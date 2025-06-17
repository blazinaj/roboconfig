import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { InventoryItem, ComponentInventoryStatus } from '../types';
import { useOrganization } from '../context/OrganizationContext';

export const useInventory = () => {
  const { currentOrganization } = useOrganization();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryStatus, setInventoryStatus] = useState<ComponentInventoryStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();

    // Subscribe to changes
    const inventorySubscription = supabase
      .channel('inventory_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'inventory_items' }, 
        () => fetchInventory()
      )
      .subscribe();

    return () => {
      inventorySubscription.unsubscribe();
    };
  }, [currentOrganization]);

  const fetchInventory = async () => {
    try {
      if (!currentOrganization) {
        setInventoryItems([]);
        setInventoryStatus([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Fetch inventory items
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (inventoryError) throw inventoryError;
      
      // Fetch component inventory status view
      const { data: statusData, error: statusError } = await supabase
        .from('component_inventory_status')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (statusError) throw statusError;

      // Format dates
      const formattedInventoryItems = inventoryData.map(item => ({
        ...item,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at)
      }));

      setInventoryItems(formattedInventoryItems);
      setInventoryStatus(statusData || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addInventoryItem = async (inventoryItem: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (!currentOrganization) {
      throw new Error('No organization selected');
    }

    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([{
          ...inventoryItem,
          organization_id: currentOrganization.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchInventory();
      return data;
    } catch (err) {
      console.error('Error adding inventory item:', err);
      throw err;
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchInventory();
    } catch (err) {
      console.error('Error updating inventory item:', err);
      throw err;
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchInventory();
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      throw err;
    }
  };

  // Function to add transaction and update inventory in one operation
  const createInventoryTransaction = async (
    inventoryItemId: string, 
    transactionType: 'receipt' | 'issue' | 'adjustment' | 'transfer',
    quantity: number,
    notes?: string,
    referenceId?: string,
    referenceType?: string
  ) => {
    if (!currentOrganization) {
      throw new Error('No organization selected');
    }

    try {
      // Start a transaction
      const { data, error } = await supabase.rpc('create_inventory_transaction', {
        p_inventory_item_id: inventoryItemId,
        p_transaction_type: transactionType,
        p_quantity: quantity,
        p_notes: notes || null,
        p_reference_id: referenceId || null,
        p_reference_type: referenceType || null,
        p_organization_id: currentOrganization.id
      });

      if (error) throw error;
      
      // Refresh inventory data
      await fetchInventory();
      
      return data;
    } catch (err) {
      console.error('Error creating inventory transaction:', err);
      throw err;
    }
  };

  // Function to allocate components to a machine
  const allocateComponentsToMachine = async (
    machineId: string,
    componentAllocations: { componentId: string, quantity: number }[]
  ) => {
    if (!currentOrganization) {
      throw new Error('No organization selected');
    }

    try {
      // For each component, create an issue transaction
      for (const allocation of componentAllocations) {
        // Find the inventory item for this component
        const inventoryItem = inventoryItems.find(item => 
          item.component_id === allocation.componentId
        );

        if (!inventoryItem) {
          throw new Error(`No inventory found for component ${allocation.componentId}`);
        }

        if (inventoryItem.quantity < allocation.quantity) {
          throw new Error(`Insufficient inventory for component ${allocation.componentId}`);
        }

        // Create an issue transaction
        await createInventoryTransaction(
          inventoryItem.id,
          'issue',
          allocation.quantity,
          `Allocated to machine ${machineId}`,
          machineId,
          'machine'
        );
      }

      return true;
    } catch (err) {
      console.error('Error allocating components:', err);
      throw err;
    }
  };

  return {
    inventoryItems,
    inventoryStatus,
    loading,
    error,
    fetchInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    createInventoryTransaction,
    allocateComponentsToMachine
  };
};