-- Fix for infinite recursion in organization_members policies
-- Using SECURITY DEFINER function to break the circular dependency

-- Create a secure function that will run with elevated privileges to get user organizations
CREATE OR REPLACE FUNCTION get_user_organizations_with_roles()
RETURNS TABLE (organization_id uuid, role text) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT om.organization_id, om.role
  FROM organization_members om
  WHERE om.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_organizations_with_roles() TO authenticated;

-- Update policies for organizations table
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM get_user_organizations_with_roles()
    )
  );

-- Update policies for organization_members table
DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;
CREATE POLICY "Users can view members of their organizations" ON organization_members
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM get_user_organizations_with_roles()
    )
  );

DROP POLICY IF EXISTS "Only owners can add/remove members" ON organization_members;
CREATE POLICY "Only owners can add/remove members" ON organization_members
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM get_user_organizations_with_roles() WHERE role = 'owner'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM get_user_organizations_with_roles() WHERE role = 'owner'
    )
  );

-- Update policies for organization_invitations
DROP POLICY IF EXISTS "Organization admins can manage invitations" ON organization_invitations;
CREATE POLICY "Organization admins can manage invitations" ON organization_invitations
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM get_user_organizations_with_roles() WHERE role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM get_user_organizations_with_roles() WHERE role IN ('owner', 'admin')
    )
  );

-- Update machine policies to use the secure function
DROP POLICY IF EXISTS "Users can view machines in their organizations" ON machines;
CREATE POLICY "Users can view machines in their organizations" ON machines
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM get_user_organizations_with_roles()
    )
  );

DROP POLICY IF EXISTS "Users can create machines in their organizations" ON machines;
CREATE POLICY "Users can create machines in their organizations" ON machines
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM get_user_organizations_with_roles()
    )
  );

DROP POLICY IF EXISTS "Users can update machines in their organizations" ON machines;
CREATE POLICY "Users can update machines in their organizations" ON machines
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM get_user_organizations_with_roles()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM get_user_organizations_with_roles()
    )
  );

DROP POLICY IF EXISTS "Users can delete machines in their organizations" ON machines;
CREATE POLICY "Users can delete machines in their organizations" ON machines
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM get_user_organizations_with_roles()
    )
  );

-- Update component policies to use the secure function
DROP POLICY IF EXISTS "Users can view components in their organizations" ON components;
CREATE POLICY "Users can view components in their organizations" ON components
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM get_user_organizations_with_roles()
    )
  );

-- Create additional policies for components
CREATE POLICY "Users can insert components in their organizations" ON components
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM get_user_organizations_with_roles()
    )
  );

CREATE POLICY "Users can update components in their organizations" ON components
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM get_user_organizations_with_roles()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM get_user_organizations_with_roles()
    )
  );

CREATE POLICY "Users can delete components in their organizations" ON components
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM get_user_organizations_with_roles()
    )
  );

-- Create or replace the view for user_organizations to use the new function
CREATE OR REPLACE VIEW user_organizations WITH (security_invoker = true) AS
SELECT
  o.id,
  o.name,
  o.slug,
  o.logo_url,
  org_role.role,
  o.created_at
FROM organizations o
JOIN get_user_organizations_with_roles() org_role ON o.id = org_role.organization_id;

-- Create or replace the view for organization_users to use the new function
CREATE OR REPLACE VIEW organization_users WITH (security_invoker = true) AS
SELECT
  om.organization_id,
  u.id as user_id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  om.role,
  om.created_at as joined_at
FROM organization_members om
JOIN auth.users u ON om.user_id = u.id
WHERE om.organization_id IN (
  SELECT organization_id FROM get_user_organizations_with_roles()
);