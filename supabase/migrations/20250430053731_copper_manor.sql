/*
  # Initial Schema Setup for RoboConfig

  1. New Tables
    - components
      - id (uuid, primary key)
      - name (text)
      - category (text)
      - type (text) 
      - description (text)
      - specifications (jsonb)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - risk_factors
      - id (uuid, primary key)
      - component_id (uuid, foreign key)
      - name (text)
      - severity (int)
      - probability (int)
      - description (text)
      - created_at (timestamptz)
    
    - machines
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - type (text)
      - status (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - machine_components
      - machine_id (uuid, foreign key)
      - component_id (uuid, foreign key)
      - created_at (timestamptz)
    
    - maintenance_schedules
      - id (uuid, primary key)
      - machine_id (uuid, foreign key)
      - frequency (text)
      - last_completed (timestamptz)
      - next_due (timestamptz)
      - created_at (timestamptz)
    
    - maintenance_tasks
      - id (uuid, primary key)
      - schedule_id (uuid, foreign key)
      - name (text)
      - description (text)
      - priority (text)
      - estimated_duration (int)
      - completed (boolean)
      - completed_at (timestamptz)
      - notes (text)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create components table
CREATE TABLE components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  type text NOT NULL,
  description text,
  specifications jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create risk_factors table
CREATE TABLE risk_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id uuid REFERENCES components(id) ON DELETE CASCADE,
  name text NOT NULL,
  severity int NOT NULL CHECK (severity BETWEEN 1 AND 5),
  probability int NOT NULL CHECK (probability BETWEEN 1 AND 5),
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create machines table
CREATE TABLE machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create machine_components junction table
CREATE TABLE machine_components (
  machine_id uuid REFERENCES machines(id) ON DELETE CASCADE,
  component_id uuid REFERENCES components(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (machine_id, component_id)
);

-- Create maintenance_schedules table
CREATE TABLE maintenance_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid REFERENCES machines(id) ON DELETE CASCADE,
  frequency text NOT NULL,
  last_completed timestamptz,
  next_due timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create maintenance_tasks table
CREATE TABLE maintenance_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  priority text NOT NULL,
  estimated_duration int NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON components
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON risk_factors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON machines
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON machine_components
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON maintenance_schedules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON maintenance_tasks
  FOR SELECT TO authenticated USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_components_updated_at
  BEFORE UPDATE ON components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_machines_updated_at
  BEFORE UPDATE ON machines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();