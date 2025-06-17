import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from '../types';
import { useOrganization } from '../context/OrganizationContext';

export const usePurchaseOrders = () => {
  const { currentOrganization } = useOrganization();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchaseOrders();

    // Subscribe to changes
    const purchaseOrdersSubscription = supabase
      .channel('purchase_orders_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'purchase_orders' }, 
        () => fetchPurchaseOrders()
      )
      .subscribe();

    return () => {
      purchaseOrdersSubscription.unsubscribe();
    };
  }, [currentOrganization]);

  const fetchPurchaseOrders = async () => {
    try {
      if (!currentOrganization) {
        setPurchaseOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Fetch purchase orders with supplier information
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('order_date', { ascending: false });

      if (error) throw error;

      // For each purchase order, fetch its items
      const ordersWithItems = await Promise.all(
        data.map(async (order) => {
          // Fetch items for this purchase order
          const { data: itemsData, error: itemsError } = await supabase
            .from('purchase_order_items')
            .select(`
              *,
              component:components(name)
            `)
            .eq('purchase_order_id', order.id);

          if (itemsError) throw itemsError;

          // Format the items data
          const formattedItems = itemsData.map(item => ({
            ...item,
            component_name: item.component?.name,
            created_at: new Date(item.created_at)
          }));

          // Format dates
          return {
            ...order,
            order_date: new Date(order.order_date),
            expected_delivery_date: order.expected_delivery_date ? new Date(order.expected_delivery_date) : undefined,
            delivery_date: order.delivery_date ? new Date(order.delivery_date) : undefined,
            created_at: new Date(order.created_at),
            updated_at: new Date(order.updated_at),
            items: formattedItems
          };
        })
      );

      setPurchaseOrders(ordersWithItems);
      setError(null);
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createPurchaseOrder = async (orderData: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at' | 'items'> & { items: Omit<PurchaseOrderItem, 'id' | 'purchase_order_id' | 'created_at'>[] }) => {
    if (!currentOrganization) {
      throw new Error('No organization selected');
    }

    try {
      // Create the purchase order
      const { data: orderData, error: orderError } = await supabase
        .from('purchase_orders')
        .insert([{
          order_number: orderData.order_number,
          supplier_id: orderData.supplier_id,
          order_date: orderData.order_date,
          expected_delivery_date: orderData.expected_delivery_date,
          status: orderData.status,
          total_amount: orderData.total_amount,
          notes: orderData.notes,
          organization_id: currentOrganization.id
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create the order items
      if (orderData && orderData.items && orderData.items.length > 0) {
        const formattedItems = orderData.items.map(item => ({
          purchase_order_id: orderData.id,
          component_id: item.component_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          received_quantity: item.received_quantity || 0
        }));

        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(formattedItems);

        if (itemsError) throw itemsError;
      }
      
      await fetchPurchaseOrders();
      return orderData;
    } catch (err) {
      console.error('Error creating purchase order:', err);
      throw err;
    }
  };

  const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update({
          order_number: updates.order_number,
          supplier_id: updates.supplier_id,
          order_date: updates.order_date,
          expected_delivery_date: updates.expected_delivery_date,
          delivery_date: updates.delivery_date,
          status: updates.status,
          total_amount: updates.total_amount,
          notes: updates.notes
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchPurchaseOrders();
    } catch (err) {
      console.error('Error updating purchase order:', err);
      throw err;
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchPurchaseOrders();
    } catch (err) {
      console.error('Error deleting purchase order:', err);
      throw err;
    }
  };

  const updatePurchaseOrderStatus = async (id: string, status: PurchaseOrderStatus) => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      await fetchPurchaseOrders();
    } catch (err) {
      console.error('Error updating purchase order status:', err);
      throw err;
    }
  };

  const receiveOrderItems = async (
    orderId: string, 
    itemUpdates: { id: string, received_quantity: number }[]
  ) => {
    try {
      // Update received quantities for each item
      for (const item of itemUpdates) {
        const { error } = await supabase
          .from('purchase_order_items')
          .update({ received_quantity: item.received_quantity })
          .eq('id', item.id)
          .eq('purchase_order_id', orderId);

        if (error) throw error;
      }
      
      // Get the order
      const order = purchaseOrders.find(po => po.id === orderId);
      if (!order) throw new Error('Order not found');
      
      // Determine new status
      let newStatus: PurchaseOrderStatus = 'pending';
      const allItemsReceived = order.items?.every(item => {
        const updatedItem = itemUpdates.find(update => update.id === item.id);
        const receivedQty = updatedItem ? updatedItem.received_quantity : item.received_quantity;
        return receivedQty >= item.quantity;
      });
      
      const anyItemsReceived = order.items?.some(item => {
        const updatedItem = itemUpdates.find(update => update.id === item.id);
        const receivedQty = updatedItem ? updatedItem.received_quantity : item.received_quantity;
        return receivedQty > 0;
      });
      
      if (allItemsReceived) {
        newStatus = 'received';
      } else if (anyItemsReceived) {
        newStatus = 'partial';
      }
      
      // Update order status
      await updatePurchaseOrderStatus(orderId, newStatus);
      
      // If items were received, also update delivery date if not already set
      if (anyItemsReceived && !order.delivery_date) {
        const { error } = await supabase
          .from('purchase_orders')
          .update({ delivery_date: new Date() })
          .eq('id', orderId);
          
        if (error) throw error;
      }
      
      await fetchPurchaseOrders();
    } catch (err) {
      console.error('Error receiving order items:', err);
      throw err;
    }
  };

  return {
    purchaseOrders,
    loading,
    error,
    fetchPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    updatePurchaseOrderStatus,
    receiveOrderItems
  };
};