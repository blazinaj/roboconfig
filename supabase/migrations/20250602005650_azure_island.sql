/*
  # Add INSERT policies for risk_factors and machine_components tables

  1. Security
    - Add INSERT policy for risk_factors table to allow authenticated users to add risk factors for components in their organizations
    - Add INSERT policy for machine_components table to allow authenticated users to associate components with machines in their organizations
    - Add UPDATE and DELETE policies for both tables to allow complete management

  This migration addresses RLS policy violations that prevent users from creating risk factors and associating components with machines.
*/

-- Add INSERT policy for risk_factors table
CREATE POLICY "Users can insert risk factors for components in their organizations" 
ON public.risk_factors
FOR INSERT 
TO authenticated
WITH CHECK (
  component_id IN (
    SELECT c.id 
    FROM components c
    WHERE c.organization_id IN (
      SELECT get_user_organizations_with_roles.organization_id
      FROM get_user_organizations_with_roles() 
    )
  )
);

-- Add UPDATE policy for risk_factors table
CREATE POLICY "Users can update risk factors for components in their organizations" 
ON public.risk_factors
FOR UPDATE
TO authenticated
USING (
  component_id IN (
    SELECT c.id 
    FROM components c
    WHERE c.organization_id IN (
      SELECT get_user_organizations_with_roles.organization_id
      FROM get_user_organizations_with_roles() 
    )
  )
)
WITH CHECK (
  component_id IN (
    SELECT c.id 
    FROM components c
    WHERE c.organization_id IN (
      SELECT get_user_organizations_with_roles.organization_id
      FROM get_user_organizations_with_roles() 
    )
  )
);

-- Add DELETE policy for risk_factors table
CREATE POLICY "Users can delete risk factors for components in their organizations" 
ON public.risk_factors
FOR DELETE
TO authenticated
USING (
  component_id IN (
    SELECT c.id 
    FROM components c
    WHERE c.organization_id IN (
      SELECT get_user_organizations_with_roles.organization_id
      FROM get_user_organizations_with_roles() 
    )
  )
);

-- Add INSERT policy for machine_components table
CREATE POLICY "Users can associate components with machines in their organizations" 
ON public.machine_components
FOR INSERT 
TO authenticated
WITH CHECK (
  machine_id IN (
    SELECT m.id 
    FROM machines m
    WHERE m.organization_id IN (
      SELECT get_user_organizations_with_roles.organization_id
      FROM get_user_organizations_with_roles() 
    )
  )
  AND 
  component_id IN (
    SELECT c.id 
    FROM components c
    WHERE c.organization_id IN (
      SELECT get_user_organizations_with_roles.organization_id
      FROM get_user_organizations_with_roles() 
    )
  )
);

-- Add DELETE policy for machine_components table
CREATE POLICY "Users can remove component associations from machines in their organizations" 
ON public.machine_components
FOR DELETE
TO authenticated
USING (
  machine_id IN (
    SELECT m.id 
    FROM machines m
    WHERE m.organization_id IN (
      SELECT get_user_organizations_with_roles.organization_id
      FROM get_user_organizations_with_roles() 
    )
  )
);