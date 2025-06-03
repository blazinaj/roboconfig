/*
  # Fix RLS policies for machines table

  1. Security
    - Enable RLS on machines table
    - Add policies for CRUD operations
    - Ensure authenticated users can manage their machines
*/

-- First, drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON machines;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON machines;
  DROP POLICY IF EXISTS "Enable update access for authenticated users" ON machines;
  DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON machines;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Enable RLS
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;

-- Policy for reading machines
CREATE POLICY "Enable read access for authenticated users"
ON machines
FOR SELECT
TO authenticated
USING (true);

-- Policy for creating machines
CREATE POLICY "Enable insert access for authenticated users"
ON machines
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for updating machines
CREATE POLICY "Enable update access for authenticated users"
ON machines
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for deleting machines
CREATE POLICY "Enable delete access for authenticated users"
ON machines
FOR DELETE
TO authenticated
USING (true);