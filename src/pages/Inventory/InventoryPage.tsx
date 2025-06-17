import React, { useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { useInventory } from '../../hooks/useInventory';
import { useComponents } from '../../hooks/useComponents';
import { ComponentInventoryStatus, Component, InventoryItem } from '../../types';
import { 
  Warehouse, Plus, Search, Filter, ArrowUpDown, Package, ShoppingCart,
  AlertTriangle, Loader2, CheckCircle, AlertCircle, Trash2, Edit, X, Bot
} from 'lucide-react';
import InventoryAIAssistant from '../../components/Inventory/InventoryAIAssistant';

const InventoryPage: React.FC = () => {
  const { inventoryStatus, loading, error, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useInventory();
  const { components } = useComponents();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ComponentInventoryStatus | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    quantity: 0,
    minimum_quantity: 0,
    location: '',
    unit_cost: 0,
    reorder_quantity: 0,
    sku: '',
    barcode: ''
  });
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'low-stock' | 'out-of-stock' | 'in-stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'quantity' | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAssistant, setShowAssistant] = useState(false);

  // Filter and sort inventory
  const filteredInventory = inventoryStatus
    .filter(item => {
      // Text search
      const matchesSearch = 
        item.component_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Stock level filter
      let matchesFilter = true;
      if (selectedFilter === 'low-stock') {
        matchesFilter = item.quantity <= item.minimum_quantity && item.quantity > 0;
      } else if (selectedFilter === 'out-of-stock') {
        matchesFilter = item.quantity === 0;
      } else if (selectedFilter === 'in-stock') {
        matchesFilter = item.quantity > item.minimum_quantity;
      }
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.component_name.localeCompare(b.component_name)
          : b.component_name.localeCompare(a.component_name);
      } else if (sortBy === 'category') {
        return sortDirection === 'asc'
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      } else if (sortBy === 'quantity') {
        return sortDirection === 'asc'
          ? a.quantity - b.quantity
          : b.quantity - a.quantity;
      } else if (sortBy === 'status') {
        const getStatusValue = (item: ComponentInventoryStatus) => {
          if (item.quantity === 0) return 0;
          if (item.quantity <= item.minimum_quantity) return 1;
          return 2;
        };
        return sortDirection === 'asc'
          ? getStatusValue(a) - getStatusValue(b)
          : getStatusValue(b) - getStatusValue(a);
      }
      return 0;
    });

  const handleSort = (column: 'name' | 'category' | 'quantity' | 'status') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleAddInventory = () => {
    setFormData({
      quantity: 0,
      minimum_quantity: 0,
      location: '',
      unit_cost: 0,
      reorder_quantity: 0,
      sku: '',
      barcode: ''
    });
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditInventory = (item: ComponentInventoryStatus) => {
    // Find the component
    const component = components.find(c => c.id === item.component_id);
    if (!component) return;

    // Set form data
    setFormData({
      component_id: item.component_id,
      quantity: item.quantity,
      minimum_quantity: item.minimum_quantity,
      location: item.location || '',
      unit_cost: item.unit_cost || 0,
      reorder_quantity: 0, // Default reorder quantity
      sku: '',
      barcode: ''
    });
    
    setEditingItem(item);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem && editingItem.inventory_id) {
        // Update existing inventory
        await updateInventoryItem(editingItem.inventory_id, formData);
      } else {
        // Create new inventory
        await addInventoryItem(formData as Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>);
      }
      
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  };

  const handleDeleteInventory = async (id: string) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await deleteInventoryItem(id);
      } catch (error) {
        console.error('Error deleting inventory:', error);
      }
    }
  };

  const handleApplySuggestion = (suggestion: any) => {
    console.log('Applying suggestion:', suggestion);
    
    if (suggestion.type === 'reorder') {
      // This would typically navigate to purchase orders and prefill the form
      // For this demo, we'll just alert
      alert(`Creating purchase order for ${suggestion.items.length} items`);
    } else if (suggestion.type === 'stock_levels') {
      // Apply the suggested minimum stock levels
      const applyChanges = async () => {
        try {
          for (const adjustment of suggestion.adjustments) {
            const item = inventoryStatus.find(i => i.component_id === adjustment.component_id);
            if (item && item.inventory_id) {
              await updateInventoryItem(item.inventory_id, {
                minimum_quantity: adjustment.suggested_minimum
              });
            }
          }
          alert('Successfully updated minimum stock levels for ' + suggestion.adjustments.length + ' items');
        } catch (error) {
          console.error('Error updating minimum stock levels:', error);
        }
      };
      
      applyChanges();
    }
  };

  // Get stock status
  const getStockStatus = (item: ComponentInventoryStatus) => {
    if (item.quantity === 0) {
      return {
        label: 'Out of Stock',
        color: 'bg-red-100 text-red-800',
        icon: <AlertCircle size={14} className="mr-1" />
      };
    } else if (item.quantity <= item.minimum_quantity) {
      return {
        label: 'Low Stock',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <AlertTriangle size={14} className="mr-1" />
      };
    } else {
      return {
        label: 'In Stock',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle size={14} className="mr-1" />
      };
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Inventory</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600">Track and manage component stock levels</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAssistant(!showAssistant)}
              className={`px-4 py-2 ${showAssistant ? 'bg-amber-100 text-amber-800' : 'bg-amber-600 text-white'} rounded-md hover:bg-amber-700 hover:text-white flex items-center transition-colors`}
            >
              <Bot size={18} className="mr-2" />
              AI Assistant
            </button>
            <button
              onClick={() => window.location.href = '/inventory/purchase-orders'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <ShoppingCart size={18} className="mr-2" />
              Purchase Orders
            </button>
            <button
              onClick={handleAddInventory}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Add Inventory
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content area */}
          <div className={`${showAssistant ? 'lg:w-2/3' : 'w-full'}`}>
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
                    placeholder="Search components..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-auto">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Stock Levels</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Inventory Form */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {editingItem ? 'Edit Inventory' : 'Add Inventory'}
                    </h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Component
                        </label>
                        <select
                          value={formData.component_id || ''}
                          onChange={(e) => setFormData({ ...formData, component_id: e.target.value })}
                          disabled={!!editingItem}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                            editingItem ? 'bg-gray-100' : 'focus:ring-blue-500 focus:border-blue-500'
                          }`}
                          required
                        >
                          <option value="">Select a component</option>
                          {components.map((component) => (
                            <option key={component.id} value={component.id}>
                              {component.name} - {component.category}
                            </option>
                          ))}
                        </select>
                        {editingItem && (
                          <p className="mt-1 text-sm text-gray-500">Component cannot be changed once inventory is created.</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Quantity
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Minimum Stock Level
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.minimum_quantity}
                            onChange={(e) => setFormData({ ...formData, minimum_quantity: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Cost ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.unit_cost}
                            onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reorder Quantity
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.reorder_quantity}
                            onChange={(e) => setFormData({ ...formData, reorder_quantity: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Storage Location
                        </label>
                        <input
                          type="text"
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Warehouse A, Shelf B3"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            SKU
                          </label>
                          <input
                            type="text"
                            value={formData.sku || ''}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., DRV-001"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Barcode
                          </label>
                          <input
                            type="text"
                            value={formData.barcode || ''}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 123456789012"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        {editingItem ? 'Update Inventory' : 'Add Inventory'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Inventory Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Component
                          {sortBy === 'name' && (
                            <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('category')}
                      >
                        <div className="flex items-center">
                          Category
                          {sortBy === 'category' && (
                            <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('quantity')}
                      >
                        <div className="flex items-center">
                          Quantity
                          {sortBy === 'quantity' && (
                            <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
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
                    {filteredInventory.map((item) => {
                      const stockStatus = getStockStatus(item);
                      return (
                        <tr key={item.component_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.component_name}
                                </div>
                                <div className="text-sm text-gray-500">{item.type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {item.quantity}
                              {item.minimum_quantity > 0 && (
                                <span className="text-xs text-gray-500 ml-1">
                                  (Min: {item.minimum_quantity})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.location || '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.color}`}>
                              {stockStatus.icon}
                              {stockStatus.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditInventory(item)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Edit size={18} />
                            </button>
                            {item.inventory_id && (
                              <button
                                onClick={() => handleDeleteInventory(item.inventory_id!)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredInventory.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <Warehouse size={48} className="mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No Inventory Found</h3>
                          <p className="text-gray-500 max-w-md mx-auto mb-6">
                            {searchQuery || selectedFilter !== 'all'
                              ? 'Try adjusting your search or filters'
                              : 'Add your first inventory item to get started'}
                          </p>
                          <button
                            onClick={handleAddInventory}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus size={16} className="mr-2" />
                            Add Inventory
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <CheckCircle size={18} className="text-green-500 mr-2" />
                  In Stock Items
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {inventoryStatus.filter(i => i.quantity > i.minimum_quantity).length}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Components with sufficient stock levels
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <AlertTriangle size={18} className="text-yellow-500 mr-2" />
                  Low Stock Items
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {inventoryStatus.filter(i => i.quantity <= i.minimum_quantity && i.quantity > 0).length}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Components below minimum stock levels
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <AlertCircle size={18} className="text-red-500 mr-2" />
                  Out of Stock Items
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {inventoryStatus.filter(i => i.quantity === 0).length}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Components with zero inventory
                </p>
              </div>
            </div>
          </div>
          
          {/* AI Assistant Panel */}
          {showAssistant && (
            <div className="lg:w-1/3 border-l border-gray-200 bg-white rounded-lg shadow-md overflow-hidden">
              <InventoryAIAssistant 
                inventoryItems={inventoryStatus}
                onClose={() => setShowAssistant(false)}
                onApplySuggestion={handleApplySuggestion}
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default InventoryPage;