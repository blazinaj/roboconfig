import React, { useState } from 'react';
import { Component } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { Package, AlertCircle, Plus, X } from 'lucide-react';

interface ComponentToInventoryProps {
  component: Component;
  onClose: () => void;
}

const ComponentToInventory: React.FC<ComponentToInventoryProps> = ({ component, onClose }) => {
  const { inventoryStatus, addInventoryItem } = useInventory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if component is already in inventory
  const existingInventory = inventoryStatus.find(item => item.component_id === component.id);
  
  const [formData, setFormData] = useState({
    component_id: component.id,
    quantity: 0,
    minimum_quantity: 3,
    location: '',
    unit_cost: 0,
    reorder_quantity: 5,
    sku: '',
    barcode: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await addInventoryItem(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add component to inventory');
    } finally {
      setLoading(false);
    }
  };

  if (existingInventory) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Package className="mr-2 text-blue-600" size={20} />
            Component Inventory
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4 flex items-start">
          <AlertCircle className="text-amber-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
          <div>
            <p className="text-amber-800 font-medium">Component Already in Inventory</p>
            <p className="text-amber-700 text-sm">
              This component is already being tracked in inventory with a quantity of {existingInventory.quantity}.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Current Inventory Status</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Current Quantity:</span>
              <span className="float-right font-medium text-gray-900">{existingInventory.quantity}</span>
            </div>
            <div>
              <span className="text-gray-500">Minimum Level:</span>
              <span className="float-right font-medium text-gray-900">{existingInventory.minimum_quantity}</span>
            </div>
            <div>
              <span className="text-gray-500">Location:</span>
              <span className="float-right font-medium text-gray-900">{existingInventory.location || "—"}</span>
            </div>
            <div>
              <span className="text-gray-500">Unit Cost:</span>
              <span className="float-right font-medium text-gray-900">
                {existingInventory.unit_cost ? `$${existingInventory.unit_cost.toFixed(2)}` : "—"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Package className="mr-2 text-blue-600" size={20} />
          Add to Inventory
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-red-700 mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h4 className="font-medium text-gray-700 mb-3">Component Information</h4>
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">{component.name}</p>
            <p className="text-sm text-gray-600 mt-1">{component.category} - {component.type}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Quantity*
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Stock Level*
              </label>
              <input
                type="number"
                min="0"
                value={formData.minimum_quantity}
                onChange={(e) => setFormData({ ...formData, minimum_quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_cost || ''}
                onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
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
                onChange={(e) => setFormData({ ...formData, reorder_quantity: parseInt(e.target.value) || 0 })}
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
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Warehouse A, Shelf B3"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
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
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 123456789012"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            {loading ? (
              <span className="mr-2 animate-spin">⏳</span>
            ) : (
              <Plus size={16} className="mr-2" />
            )}
            Add to Inventory
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComponentToInventory;