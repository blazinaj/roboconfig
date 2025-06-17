// Inventory-related type definitions

export type InventoryItem = {
  id: string;
  component_id: string;
  quantity: number;
  minimum_quantity: number;
  location?: string;
  unit_cost?: number;
  reorder_quantity: number;
  sku?: string;
  barcode?: string;
  organization_id?: string;
  created_at: Date;
  updated_at: Date;
};

export type Supplier = {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  notes?: string;
  organization_id?: string;
  created_at: Date;
  updated_at: Date;
};

export type PurchaseOrderStatus = 'pending' | 'ordered' | 'partial' | 'received' | 'canceled';

export type PurchaseOrder = {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier?: Supplier;
  order_date: Date;
  expected_delivery_date?: Date;
  delivery_date?: Date;
  status: PurchaseOrderStatus;
  total_amount?: number;
  notes?: string;
  items?: PurchaseOrderItem[];
  organization_id?: string;
  created_at: Date;
  updated_at: Date;
};

export type PurchaseOrderItem = {
  id: string;
  purchase_order_id: string;
  component_id: string;
  component_name?: string;
  quantity: number;
  unit_price: number;
  received_quantity: number;
  created_at: Date;
};

export type TransactionType = 'receipt' | 'issue' | 'adjustment' | 'transfer';

export type InventoryTransaction = {
  id: string;
  inventory_item_id: string;
  transaction_type: TransactionType;
  quantity: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  created_by?: string;
  organization_id?: string;
  created_at: Date;
};

export type ComponentInventoryStatus = {
  component_id: string;
  component_name: string;
  category: string;
  type: string;
  inventory_id?: string;
  quantity: number;
  minimum_quantity: number;
  location?: string;
  unit_cost?: number;
  needs_reorder: boolean;
  organization_id?: string;
};