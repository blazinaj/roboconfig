-- Add RLS policies for maintenance_tasks table

-- First, check and drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON maintenance_tasks;
  DROP POLICY IF EXISTS "Users can create tasks for maintenance schedules in their organizations" ON maintenance_tasks;
  DROP POLICY IF EXISTS "Users can update tasks for maintenance schedules in their organizations" ON maintenance_tasks;
  DROP POLICY IF EXISTS "Users can delete tasks for maintenance schedules in their organizations" ON maintenance_tasks;
EXCEPTION WHEN undefined_object THEN
  -- Do nothing, policy doesn't exist
END $$;

-- Policy for SELECT operations
CREATE POLICY "Enable read access for authenticated users"
ON maintenance_tasks
FOR SELECT
TO authenticated
USING (true);

-- Policy for INSERT operations
CREATE POLICY "Users can create tasks for maintenance schedules in their organizations"
ON maintenance_tasks
FOR INSERT
TO authenticated
WITH CHECK (
  schedule_id IN (
    SELECT ms.id
    FROM maintenance_schedules ms
    JOIN machines m ON ms.machine_id = m.id
    WHERE m.organization_id IN (
      SELECT get_user_organizations_with_roles.organization_id
      FROM get_user_organizations_with_roles() get_user_organizations_with_roles(organization_id, role)
    )
  )
);

-- Policy for UPDATE operations
CREATE POLICY "Users can update tasks for maintenance schedules in their organizations"
ON maintenance_tasks
FOR UPDATE
TO authenticated
USING (
  schedule_id IN (
    SELECT ms.id
    FROM maintenance_schedules ms
    JOIN machines m ON ms.machine_id = m.id
    WHERE m.organization_id IN (
      SELECT get_user_organizations_with_roles.organization_id
      FROM get_user_organizations_with_roles() get_user_organizations_with_roles(organization_id, role)
    )
  )
)
WITH CHECK (
  schedule_id IN (
    SELECT ms.id
    FROM maintenance_schedules ms
    JOIN machines m ON ms.machine_id = m.id
    WHERE m.organization_id IN (
      SELECT get_user_organizations_with_roles.organization_id
      FROM get_user_organizations_with_roles() get_user_organizations_with_roles(organization_id, role)
    )
  )
);

-- Policy for DELETE operations
CREATE POLICY "Users can delete tasks for maintenance schedules in their organizations"
ON maintenance_tasks
FOR DELETE
TO authenticated
USING (
  schedule_id IN (
    SELECT ms.id
    FROM maintenance_schedules ms
    JOIN machines m ON ms.machine_id = m.id
    WHERE m.organization_id IN (
      SELECT get_user_organizations_with_roles.organization_id
      FROM get_user_organizations_with_roles() get_user_organizations_with_roles(organization_id, role)
    )
  )
);