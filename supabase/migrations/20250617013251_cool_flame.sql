/*
  # Inventory Management Schema

  1. New Tables
    - `inventory_items`: Tracks component stock quantities and locations
    - `suppliers`: Stores component supplier information
    - `purchase_orders`: Records orders for components
    - `purchase_order_items`: Individual items in purchase orders

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users within their organizations
*/

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  address text,
  website text,
  notes text,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id uuid REFERENCES components(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 0,
  minimum_quantity integer NOT NULL DEFAULT 0,
  location text,
  unit_cost decimal(10, 2),
  reorder_quantity integer DEFAULT 0,
  sku text,
  barcode text,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  order_date timestamptz NOT NULL DEFAULT now(),
  expected_delivery_date timestamptz,
  delivery_date timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'partial', 'received', 'canceled')),
  total_amount decimal(12, 2),
  notes text,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid REFERENCES purchase_orders(id) ON DELETE CASCADE,
  component_id uuid REFERENCES components(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  unit_price decimal(10, 2) NOT NULL,
  received_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create inventory_transactions table to track stock movements
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id uuid REFERENCES inventory_items(id) ON DELETE SET NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('receipt', 'issue', 'adjustment', 'transfer')),
  quantity integer NOT NULL,
  reference_id uuid, -- Can reference a purchase_order, machine, etc.
  reference_type text, -- Type of reference (e.g., 'purchase_order', 'machine')
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create updated_at triggers
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies for suppliers
CREATE POLICY "Users can view suppliers in their organizations"
  ON suppliers
  FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()));

CREATE POLICY "Users can create suppliers in their organizations"
  ON suppliers
  FOR INSERT
  TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()));

CREATE POLICY "Users can update suppliers in their organizations"
  ON suppliers
  FOR UPDATE
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()));

CREATE POLICY "Users can delete suppliers in their organizations"
  ON suppliers
  FOR DELETE
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()));

-- Create policies for inventory_items
CREATE POLICY "Users can view inventory in their organizations"
  ON inventory_items
  FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()));

CREATE POLICY "Users can create inventory in their organizations"
  ON inventory_items
  FOR INSERT
  TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()));

CREATE POLICY "Users can update inventory in their organizations"
  ON inventory_items
  FOR UPDATE
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()));

CREATE POLICY "Users can delete inventory in their organizations"
  ON inventory_items
  FOR DELETE
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()));

-- Create policies for purchase_orders
CREATE POLICY "Users can view purchase orders in their organizations"
  ON purchase_orders
  FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()));

CREATE POLICY "Users can create purchase orders in their organizations"
  ON purchase_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()));

CREATE POLICY "Users can update purchase orders in their organizations"
  ON purchase_orders
  FOR UPDATE
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()));

CREATE POLICY "Users can delete purchase orders in their organizations"
  ON purchase_orders
  FOR DELETE
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()));

-- Create policies for purchase_order_items
CREATE POLICY "Users can view purchase order items in their organizations"
  ON purchase_order_items
  FOR SELECT
  TO authenticated
  USING (purchase_order_id IN (
    SELECT id FROM purchase_orders
    WHERE organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles())
  ));

CREATE POLICY "Users can create purchase order items in their organizations"
  ON purchase_order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (purchase_order_id IN (
    SELECT id FROM purchase_orders
    WHERE organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles())
  ));

CREATE POLICY "Users can update purchase order items in their organizations"
  ON purchase_order_items
  FOR UPDATE
  TO authenticated
  USING (purchase_order_id IN (
    SELECT id FROM purchase_orders
    WHERE organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles())
  ))
  WITH CHECK (purchase_order_id IN (
    SELECT id FROM purchase_orders
    WHERE organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles())
  ));

CREATE POLICY "Users can delete purchase order items in their organizations"
  ON purchase_order_items
  FOR DELETE
  TO authenticated
  USING (purchase_order_id IN (
    SELECT id FROM purchase_orders
    WHERE organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles())
  ));

-- Create policies for inventory_transactions
CREATE POLICY "Users can view inventory transactions in their organizations"
  ON inventory_transactions
  FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()));

CREATE POLICY "Users can create inventory transactions in their organizations"
  ON inventory_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles()));

-- Create view for component inventory status
CREATE OR REPLACE VIEW component_inventory_status WITH (security_invoker = true) AS
SELECT 
  c.id as component_id,
  c.name as component_name,
  c.category,
  c.type,
  i.id as inventory_id,
  i.quantity,
  i.minimum_quantity,
  i.location,
  i.unit_cost,
  (i.quantity <= i.minimum_quantity) as needs_reorder,
  c.organization_id
FROM components c
LEFT JOIN inventory_items i ON c.id = i.component_id
WHERE c.organization_id IN (SELECT organization_id FROM get_user_organizations_with_roles());

-- Grant access to views
GRANT SELECT ON component_inventory_status TO authenticated;