/*
  # Add CRUD policies for machines table

  1. Changes
    - Add INSERT policy for authenticated users
    - Add UPDATE policy for authenticated users
    - Add DELETE policy for authenticated users

  2. Security
    - Policies allow authenticated users to perform CRUD operations
    - Maintains existing read policy
*/

-- Add INSERT policy
CREATE POLICY "Enable insert access for authenticated users" ON machines
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy
CREATE POLICY "Enable update access for authenticated users" ON machines
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add DELETE policy
CREATE POLICY "Enable delete access for authenticated users" ON machines
  FOR DELETE TO authenticated
  USING (true);