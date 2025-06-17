import React, { useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useComponents } from '../../hooks/useComponents';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderItem } from '../../types';
import { 
  ShoppingCart, Plus, Search, Filter, ArrowUpDown, Calendar, Loader2, AlertTriangle, 
  X, PackagePlus, Truck, ArrowLeft, Warehouse
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PurchaseOrdersPage: React.FC = () => {
  const { purchaseOrders, loading, error, createPurchaseOrder, updatePurchaseOrderStatus } = usePurchaseOrders();
  const { suppliers } = useSuppliers();
  const { components } = useComponents();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'supplier' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Form state
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
    order_number: '',
    supplier_id: '',
    order_date: new Date(),
    expected_delivery_date: undefined,
    status: 'pending',
    notes: '',
    items: []
  });
  
  // Items state for form
  const [orderItems, setOrderItems] = useState<Partial<PurchaseOrderItem>[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<PurchaseOrderItem>>({
    component_id: '',
    quantity: 1,
    unit_price: 0,
    received_quantity: 0
  });

  // Filter and sort purchase orders
  const filteredOrders = purchaseOrders
    .filter(order => {
      // Text search
      const matchesSearch = 
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.order_date).getTime() - new Date(b.order_date).getTime()
          : new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
      } else if (sortBy === 'supplier') {
        const supplierA = a.supplier?.name || '';
        const supplierB = b.supplier?.name || '';
        return sortDirection === 'asc'
          ? supplierA.localeCompare(supplierB)
          : supplierB.localeCompare(supplierA);
      } else if (sortBy === 'status') {
        const statusOrder = { 'received': 0, 'partial': 1, 'ordered': 2, 'pending': 3, 'canceled': 4 };
        return sortDirection === 'asc'
          ? statusOrder[a.status] - statusOrder[b.status]
          : statusOrder[b.status] - statusOrder[a.status];
      }
      return 0;
    });

  const handleSort = (column: 'date' | 'supplier' | 'status') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const handleAddItem = () => {
    if (!currentItem.component_id || currentItem.quantity <= 0 || currentItem.unit_price <= 0) {
      return;
    }
    
    setOrderItems([...orderItems, currentItem]);
    setCurrentItem({
      component_id: '',
      quantity: 1,
      unit_price: 0,
      received_quantity: 0
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Calculate total amount
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 
        0
      );
      
      // Create a new order with items
      await createPurchaseOrder({
        ...formData,
        order_number: formData.order_number || generateOrderNumber(),
        order_date: formData.order_date || new Date(),
        status: 'pending',
        total_amount: totalAmount,
        items: orderItems as Omit<PurchaseOrderItem, 'id' | 'purchase_order_id' | 'created_at'>[]
      });
      
      // Reset form
      setFormData({
        order_number: '',
        supplier_id: '',
        order_date: new Date(),
        expected_delivery_date: undefined,
        status: 'pending',
        notes: '',
        items: []
      });
      setOrderItems([]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating purchase order:', error);
    }
  };

  // Generate a unique order number
  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PO-${year}${month}${day}-${random}`;
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get the status badge for a given status
  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Pending</span>;
      case 'ordered':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Ordered</span>;
      case 'partial':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Partially Received</span>;
      case 'received':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Received</span>;
      case 'canceled':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Canceled</span>;
      default:
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
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

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-red-600 mb-2">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Purchase Orders</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="mb-6">
          <button
            onClick={() => window.location.href = '/inventory'}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            <span className="text-sm">Back to Inventory</span>
          </button>

          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
              <p className="text-gray-600">Manage and track component orders</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Create Order
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="w-full md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PurchaseOrderStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="ordered">Ordered</option>
              <option value="partial">Partially Received</option>
              <option value="received">Received</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>

        {/* Purchase Order Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                <h2 className="text-xl font-semibold text-gray-900">
                  Create Purchase Order
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Number
                    </label>
                    <input
                      type="text"
                      value={formData.order_number || ''}
                      onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder={generateOrderNumber()}
                    />
                    <p className="mt-1 text-xs text-gray-500">Leave blank to auto-generate</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier*
                    </label>
                    <select
                      value={formData.supplier_id || ''}
                      onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Date
                    </label>
                    <input
                      type="date"
                      value={formData.order_date ? new Date(formData.order_date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, order_date: new Date(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Delivery Date
                    </label>
                    <input
                      type="date"
                      value={formData.expected_delivery_date ? new Date(formData.expected_delivery_date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, expected_delivery_date: new Date(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                    <div className="text-sm text-gray-500">Total: {formatCurrency(orderItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0))}</div>
                  </div>
                  
                  {/* Items list */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    {orderItems.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="text-xs text-left text-gray-500 uppercase">
                            <th className="px-2 py-2">Component</th>
                            <th className="px-2 py-2 text-right">Quantity</th>
                            <th className="px-2 py-2 text-right">Unit Price</th>
                            <th className="px-2 py-2 text-right">Total</th>
                            <th className="px-2 py-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orderItems.map((item, index) => {
                            const component = components.find(c => c.id === item.component_id);
                            return (
                              <tr key={index} className="text-sm">
                                <td className="px-2 py-2">{component?.name || 'Unknown Component'}</td>
                                <td className="px-2 py-2 text-right">{item.quantity}</td>
                                <td className="px-2 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                                <td className="px-2 py-2 text-right">{formatCurrency((item.quantity || 0) * (item.unit_price || 0))}</td>
                                <td className="px-2 py-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <X size={18} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-4 text-gray-500">No items added yet</div>
                    )}
                  </div>
                  
                  {/* Add item form */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Add Item</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Component</label>
                        <select
                          value={currentItem.component_id || ''}
                          onChange={(e) => setCurrentItem({ ...currentItem, component_id: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Component</option>
                          {components.map((component) => (
                            <option key={component.id} value={component.id}>
                              {component.name} ({component.category})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={currentItem.quantity || ''}
                          onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={currentItem.unit_price || ''}
                          onChange={(e) => setCurrentItem({ ...currentItem, unit_price: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleAddItem}
                          disabled={!currentItem.component_id || (currentItem.quantity || 0) <= 0 || (currentItem.unit_price || 0) <= 0}
                          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 flex items-center"
                        >
                          <Plus size={16} className="mr-1" />
                          Add to Order
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.supplier_id || orderItems.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Create Purchase Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Purchase Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('supplier')}
                  >
                    <div className="flex items-center">
                      Supplier
                      {sortBy === 'supplier' && (
                        <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortBy === 'date' && (
                        <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortBy === 'status' && (
                        <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        <Link to={`/inventory/purchase-orders/${order.id}`}>{order.order_number}</Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.supplier?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {order.order_date.toLocaleDateString()}
                      </div>
                      {order.expected_delivery_date && (
                        <div className="text-xs text-gray-500 mt-1">
                          Due: {order.expected_delivery_date.toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.items?.length || 0} item(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/inventory/purchase-orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Purchase Orders Found</h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        {searchQuery || statusFilter !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Create your first purchase order to get started'}
                      </p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus size={16} className="mr-2" />
                        Create Order
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
            >
              <div className="p-3 bg-blue-100 rounded-full mb-3">
                <PackagePlus className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-800">Create New Order</h4>
              <p className="text-sm text-gray-600 mt-1 text-center">
                Order new components from suppliers
              </p>
            </button>
            
            <button
              onClick={() => window.location.href = '/inventory/suppliers'}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors"
            >
              <div className="p-3 bg-green-100 rounded-full mb-3">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-800">Manage Suppliers</h4>
              <p className="text-sm text-gray-600 mt-1 text-center">
                View and edit your supplier list
              </p>
            </button>
            
            <button
              onClick={() => window.location.href = '/inventory'}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-200 transition-colors"
            >
              <div className="p-3 bg-amber-100 rounded-full mb-3">
                <Warehouse className="h-6 w-6 text-amber-600" />
              </div>
              <h4 className="font-medium text-gray-800">Inventory Status</h4>
              <p className="text-sm text-gray-600 mt-1 text-center">
                View current stock levels
              </p>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PurchaseOrdersPage;