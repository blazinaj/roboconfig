/*
  # Organizations Schema

  1. New Tables
    - organizations: Store organization details
    - organization_members: Link users to organizations with roles
    - organization_invitations: Manage pending invitations

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Create secure views for organization data
*/

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create organization_members table with roles
CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

-- Create organization_invitations table
CREATE TABLE IF NOT EXISTS organization_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'member')),
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (organization_id, email)
);

-- Add organization_id to machines table
ALTER TABLE machines ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;

-- Add organization_id to components table
ALTER TABLE components ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners and admins can update" ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Create policies for organization_members
CREATE POLICY "Users can view members of their organizations" ON organization_members
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only owners can add/remove members" ON organization_members
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Create policies for organization_invitations
CREATE POLICY "Organization admins can manage invitations" ON organization_invitations
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Update RLS for machines to be organization-aware
DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON machines;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON machines;
  DROP POLICY IF EXISTS "Enable update access for authenticated users" ON machines;
  DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON machines;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

CREATE POLICY "Users can view machines in their organizations" ON machines
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create machines in their organizations" ON machines
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update machines in their organizations" ON machines
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete machines in their organizations" ON machines
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Update RLS for components to be organization-aware
DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON components;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

CREATE POLICY "Users can view components in their organizations" ON components
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Create secure views
CREATE OR REPLACE VIEW user_organizations WITH (security_invoker = true) AS
SELECT
  o.id,
  o.name,
  o.slug,
  o.logo_url,
  om.role,
  o.created_at
FROM organizations o
JOIN organization_members om ON o.id = om.organization_id
WHERE om.user_id = auth.uid();

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
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid()
);

-- Create function for slugifying organization names
CREATE OR REPLACE FUNCTION slugify(input text) RETURNS text AS $$
  SELECT lower(
    regexp_replace(
      regexp_replace(input, '[^a-zA-Z0-9\s]', '', 'g'),  -- Remove non-alphanumeric except spaces
      '\s+', '-', 'g'                                    -- Replace spaces with hyphens
    )
  );
$$ LANGUAGE SQL IMMUTABLE;