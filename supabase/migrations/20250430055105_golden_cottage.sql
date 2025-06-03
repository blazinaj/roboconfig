/*
  # Add RLS policies for machines table
  
  1. Security
    - Enable RLS on machines table
    - Add policies for CRUD operations for authenticated users
*/

-- Enable RLS
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'machines' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Policy for reading machines
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'machines' 
    AND policyname = 'Enable read access for authenticated users'
  ) THEN
    CREATE POLICY "Enable read access for authenticated users"
    ON machines
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Policy for creating machines
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'machines' 
    AND policyname = 'Enable insert access for authenticated users'
  ) THEN
    CREATE POLICY "Enable insert access for authenticated users"
    ON machines
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
  END IF;
END $$;

-- Policy for updating machines
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'machines' 
    AND policyname = 'Enable update access for authenticated users'
  ) THEN
    CREATE POLICY "Enable update access for authenticated users"
    ON machines
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- Policy for deleting machines
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'machines' 
    AND policyname = 'Enable delete access for authenticated users'
  ) THEN
    CREATE POLICY "Enable delete access for authenticated users"
    ON machines
    FOR DELETE
    TO authenticated
    USING (true);
  END IF;
END $$;