import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { useInventory } from '../../hooks/useInventory';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderItem } from '../../types';
import {
  ShoppingCart, ArrowLeft, Calendar, Truck, CheckCircle, Loader2, AlertTriangle,
  FileText, Printer, X, Edit, Save, PackageCheck, Package
} from 'lucide-react';

const PurchaseOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { purchaseOrders, loading, error, updatePurchaseOrder, updatePurchaseOrderStatus, receiveOrderItems } = usePurchaseOrders();
  const { createInventoryTransaction } = useInventory();
  
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Partial<PurchaseOrder>>({});
  const [isReceiving, setIsReceiving] = useState(false);
  const [receivedItems, setReceivedItems] = useState<{ id: string, received_quantity: number }[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [receiveLoading, setReceiveLoading] = useState(false);

  // Find the order in the loaded orders
  useEffect(() => {
    if (purchaseOrders.length > 0 && id) {
      const foundOrder = purchaseOrders.find(po => po.id === id);
      if (foundOrder) {
        setOrder(foundOrder);
        setEditedOrder({
          order_number: foundOrder.order_number,
          supplier_id: foundOrder.supplier_id,
          order_date: foundOrder.order_date,
          expected_delivery_date: foundOrder.expected_delivery_date,
          notes: foundOrder.notes
        });
        
        // Initialize received items if not yet fully received
        if (foundOrder.status !== 'received' && foundOrder.items) {
          setReceivedItems(
            foundOrder.items.map(item => ({
              id: item.id,
              received_quantity: item.received_quantity
            }))
          );
        }
      }
    }
  }, [purchaseOrders, id]);

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (date?: Date) => {
    if (!date) return 'Not specified';
    return date.toLocaleDateString();
  };

  // Get color based on status
  const getStatusColor = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle updating order
  const handleSaveChanges = async () => {
    if (!order || !id) return;
    
    setSaveLoading(true);
    try {
      await updatePurchaseOrder(id, editedOrder);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle marking as ordered
  const handleMarkAsOrdered = async () => {
    if (!order || !id) return;
    
    try {
      await updatePurchaseOrderStatus(id, 'ordered');
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Handle canceling order
  const handleCancelOrder = async () => {
    if (!order || !id) return;
    
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await updatePurchaseOrderStatus(id, 'canceled');
      } catch (error) {
        console.error('Error canceling order:', error);
      }
    }
  };

  // Handle receiving items
  const handleReceiveItems = async () => {
    if (!order || !id) return;
    
    setReceiveLoading(true);
    try {
      // Update received quantities
      await receiveOrderItems(id, receivedItems);
      
      // For each received item, add to inventory
      for (const receivedItem of receivedItems) {
        const orderItem = order.items?.find(item => item.id === receivedItem.id);
        if (orderItem && receivedItem.received_quantity > orderItem.received_quantity) {
          // Calculate the newly received quantity (delta)
          const newlyReceived = receivedItem.received_quantity - orderItem.received_quantity;
          
          // Find or create inventory item for this component
          // This would normally create a transaction in the database that updates inventory
          // For this demo, we'll simulate adding to inventory
          console.log(`Received ${newlyReceived} units of component ${orderItem.component_id}`);
        }
      }
      
      setIsReceiving(false);
    } catch (error) {
      console.error('Error receiving items:', error);
    } finally {
      setReceiveLoading(false);
    }
  };

  // Update received quantity for an item
  const updateReceivedQuantity = (id: string, quantity: number) => {
    setReceivedItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, received_quantity: quantity } : item
      )
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error || !order) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-red-600 mb-2">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Purchase order not found'}
          </h2>
          <button
            onClick={() => navigate('/inventory/purchase-orders')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-4"
          >
            Back to Purchase Orders
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <button
          onClick={() => navigate('/inventory/purchase-orders')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span className="text-sm">Back to Purchase Orders</span>
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600 mr-2" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    {order.order_number}
                  </h1>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Order from {order.supplier?.name}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  {order.status === 'pending' && (
                    <button
                      onClick={handleMarkAsOrdered}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center"
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      Mark as Ordered
                    </button>
                  )}
                  
                  {['pending', 'ordered', 'partial'].includes(order.status) && (
                    <button
                      onClick={() => setIsReceiving(true)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 flex items-center"
                    >
                      <PackageCheck className="h-4 w-4 mr-1" />
                      Receive Items
                    </button>
                  )}
                  
                  {['pending', 'ordered'].includes(order.status) && (
                    <button
                      onClick={handleCancelOrder}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel Order
                    </button>
                  )}
                  
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 flex items-center"
                  >
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Number
                      </label>
                      <input
                        type="text"
                        value={editedOrder.order_number || ''}
                        onChange={(e) => setEditedOrder({ ...editedOrder, order_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Date
                      </label>
                      <input
                        type="date"
                        value={editedOrder.order_date ? new Date(editedOrder.order_date).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditedOrder({ ...editedOrder, order_date: new Date(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Delivery Date
                      </label>
                      <input
                        type="date"
                        value={editedOrder.expected_delivery_date ? new Date(editedOrder.expected_delivery_date).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditedOrder({ ...editedOrder, expected_delivery_date: e.target.value ? new Date(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={editedOrder.notes || ''}
                        onChange={(e) => setEditedOrder({ ...editedOrder, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        disabled={saveLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                      >
                        {saveLoading ? (
                          <Loader2 size={16} className="animate-spin mr-2" />
                        ) : (
                          <Save size={16} className="mr-2" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dl className="divide-y divide-gray-200">
                      <div className="grid grid-cols-3 py-3">
                        <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                        <dd className="text-sm text-gray-900 col-span-2 flex items-center">
                          <Calendar size={14} className="mr-1 text-gray-400" />
                          {formatDate(order.order_date)}
                        </dd>
                      </div>
                      
                      <div className="grid grid-cols-3 py-3">
                        <dt className="text-sm font-medium text-gray-500">Expected Delivery</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {formatDate(order.expected_delivery_date)}
                        </dd>
                      </div>
                      
                      <div className="grid grid-cols-3 py-3">
                        <dt className="text-sm font-medium text-gray-500">Actual Delivery</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {order.delivery_date ? formatDate(order.delivery_date) : 'Not delivered yet'}
                        </dd>
                      </div>
                      
                      <div className="grid grid-cols-3 py-3">
                        <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                        <dd className="text-sm font-medium text-gray-900 col-span-2">
                          {formatCurrency(order.total_amount)}
                        </dd>
                      </div>
                      
                      <div className="grid grid-cols-3 py-3">
                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {order.notes || 'No notes'}
                        </dd>
                      </div>
                    </dl>
                    
                    {!isEditing && (
                      <div className="mt-4">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <Edit size={16} className="mr-1" />
                          Edit Order Details
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Supplier Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {order.supplier ? (
                    <dl className="divide-y divide-gray-200">
                      <div className="grid grid-cols-3 py-3">
                        <dt className="text-sm font-medium text-gray-500">Supplier Name</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{order.supplier.name}</dd>
                      </div>
                      
                      <div className="grid grid-cols-3 py-3">
                        <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {order.supplier.contact_name || 'Not specified'}
                        </dd>
                      </div>
                      
                      <div className="grid grid-cols-3 py-3">
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {order.supplier.email ? (
                            <a href={`mailto:${order.supplier.email}`} className="text-blue-600 hover:text-blue-800">
                              {order.supplier.email}
                            </a>
                          ) : (
                            'Not specified'
                          )}
                        </dd>
                      </div>
                      
                      <div className="grid grid-cols-3 py-3">
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {order.supplier.phone ? (
                            <a href={`tel:${order.supplier.phone}`} className="text-blue-600 hover:text-blue-800">
                              {order.supplier.phone}
                            </a>
                          ) : (
                            'Not specified'
                          )}
                        </dd>
                      </div>
                      
                      <div className="grid grid-cols-3 py-3">
                        <dt className="text-sm font-medium text-gray-500">Address</dt>
                        <dd className="text-sm text-gray-900 col-span-2">
                          {order.supplier.address || 'Not specified'}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="text-sm text-gray-500">Supplier information not available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            {isReceiving ? (
              <div className="bg-white border-2 border-green-200 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-800 flex items-center">
                    <PackageCheck className="h-5 w-5 text-green-600 mr-2" />
                    Receive Items
                  </h4>
                  <button
                    onClick={() => setIsReceiving(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ordered
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Previously Received
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Receiving Now
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items?.map((item) => {
                        const receivedItem = receivedItems.find(ri => ri.id === item.id);
                        const currentReceived = receivedItem?.received_quantity || 0;
                        return (
                          <tr key={item.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-500" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.component_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Unit price: {formatCurrency(item.unit_price)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <span className="text-sm text-gray-900">{item.quantity}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <span className="text-sm text-gray-900">{item.received_quantity}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <input
                                type="number"
                                min={item.received_quantity}
                                max={item.quantity}
                                value={currentReceived}
                                onChange={(e) => updateReceivedQuantity(item.id, parseInt(e.target.value))}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleReceiveItems}
                    disabled={receiveLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    {receiveLoading ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : (
                      <CheckCircle size={16} className="mr-2" />
                    )}
                    Confirm Receipt
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Component
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Received
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.component_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            <span className={item.received_quantity === item.quantity ? 'text-green-600 font-medium' : ''}>
                              {item.received_quantity}
                            </span>
                            {item.received_quantity !== item.quantity && (
                              <span className="text-gray-500 ml-1">
                                ({((item.received_quantity / item.quantity) * 100).toFixed(0)}%)
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {formatCurrency(item.unit_price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          Total Amount:
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Order Timeline */}
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <ol className="relative border-l border-gray-200 ml-3">
                <li className="mb-6 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-200 rounded-full -left-3 ring-8 ring-white">
                    <FileText className="w-3 h-3 text-blue-600" />
                  </span>
                  <h4 className="flex items-center text-lg font-semibold text-gray-900">
                    Order Created
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium ml-2 px-2.5 py-0.5 rounded">
                      Current
                    </span>
                  </h4>
                  <time className="block mb-2 text-sm font-normal leading-none text-gray-500">
                    {order.created_at.toLocaleDateString()}
                  </time>
                  <p className="text-base font-normal text-gray-500">
                    Purchase order was created with {order.items?.length || 0} items
                  </p>
                </li>
                
                {order.status !== 'pending' && order.status !== 'canceled' && (
                  <li className="mb-6 ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-200 rounded-full -left-3 ring-8 ring-white">
                      <Truck className="w-3 h-3 text-blue-600" />
                    </span>
                    <h4 className="text-lg font-semibold text-gray-900">Order Placed</h4>
                    <time className="block mb-2 text-sm font-normal leading-none text-gray-500">
                      {order.updated_at.toLocaleDateString()}
                    </time>
                    <p className="text-base font-normal text-gray-500">
                      Order was placed with the supplier
                    </p>
                  </li>
                )}
                
                {(order.status === 'partial' || order.status === 'received') && (
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-green-200 rounded-full -left-3 ring-8 ring-white">
                      <PackageCheck className="w-3 h-3 text-green-600" />
                    </span>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {order.status === 'received' ? 'Order Received' : 'Partial Delivery'}
                    </h4>
                    <time className="block mb-2 text-sm font-normal leading-none text-gray-500">
                      {order.delivery_date ? order.delivery_date.toLocaleDateString() : 'Unknown date'}
                    </time>
                    <p className="text-base font-normal text-gray-500">
                      {order.status === 'received' 
                        ? 'All items have been received and added to inventory' 
                        : 'Some items have been received and added to inventory'}
                    </p>
                  </li>
                )}
                
                {order.status === 'canceled' && (
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-red-200 rounded-full -left-3 ring-8 ring-white">
                      <X className="w-3 h-3 text-red-600" />
                    </span>
                    <h4 className="text-lg font-semibold text-gray-900">Order Canceled</h4>
                    <time className="block mb-2 text-sm font-normal leading-none text-gray-500">
                      {order.updated_at.toLocaleDateString()}
                    </time>
                    <p className="text-base font-normal text-gray-500">
                      The purchase order was canceled
                    </p>
                  </li>
                )}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PurchaseOrderDetailsPage;