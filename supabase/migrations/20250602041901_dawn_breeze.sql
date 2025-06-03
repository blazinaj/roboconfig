/*
  # Add RLS policies for maintenance_schedules table

  1. Security Changes
    - Add INSERT policy for maintenance_schedules table
    - Add UPDATE policy for maintenance_schedules table
    - Add DELETE policy for maintenance_schedules table
    
  This migration adds the missing Row-Level Security (RLS) policies for the maintenance_schedules
  table to allow authenticated users to create, update, and delete maintenance schedules
  for machines that belong to their organizations.
*/

-- Policy for INSERT operations
CREATE POLICY "Users can create maintenance schedules for machines in their organizations"
ON maintenance_schedules
FOR INSERT
TO authenticated
WITH CHECK (
  machine_id IN (
    SELECT m.id
    FROM machines m
    WHERE m.organization_id IN (
      SELECT get_user_organizations_with_roles.organization_id
      FROM get_user_organizations_with_roles() get_user_organizations_with_roles(organization_id, role)
    )
  )
);

-- Policy for UPDATE operations
CREATE POLICY "Users can update maintenance schedules for machines in their organizations"
ON maintenance_schedules
FOR UPDATE
TO authenticated
USING (
  machine_id IN (
    SELECT m.id
    FROM machines m
    WHERE m.organization_id IN (
      SELECT get_user_organizations_with_roles.organization_id
      FROM get_user_organizations_with_roles() get_user_organizations_with_roles(organization_id, role)
    )
  )
)
WITH CHECK (
  machine_id IN (
    SELECT m.id
    FROM machines m
    WHERE m.organization_id IN (
      SELECT get_user_organizations_with_roles.organization_id
      FROM get_user_organizations_with_roles() get_user_organizations_with_roles(organization_id, role)
    )
  )
);

-- Policy for DELETE operations
CREATE POLICY "Users can delete maintenance schedules for machines in their organizations"
ON maintenance_schedules
FOR DELETE
TO authenticated
USING (
  machine_id IN (
    SELECT m.id
    FROM machines m
    WHERE m.organization_id IN (
      SELECT get_user_organizations_with_roles.organization_id
      FROM get_user_organizations_with_roles() get_user_organizations_with_roles(organization_id, role)
    )
  )
);