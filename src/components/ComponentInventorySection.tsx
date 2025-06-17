import React, { useState } from 'react';
import { Component, ComponentInventoryStatus } from '../types';
import { useInventory } from '../hooks/useInventory';
import { 
  Package, ShoppingCart, Plus, Minus, AlertTriangle, 
  CheckCircle, AlertCircle, Clock, ExternalLink 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ComponentInventoryProps {
  component: Component;
}

const ComponentInventorySection: React.FC<ComponentInventoryProps> = ({ component }) => {
  const { inventoryStatus, inventoryItems, updateInventoryItem, createInventoryTransaction } = useInventory();
  const [adjustmentAmount, setAdjustmentAmount] = useState(1);
  const [adjustmentType, setAdjustmentType] = useState<'receipt' | 'issue'>('receipt');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);

  // Find inventory data for this component
  const inventoryData = inventoryStatus.find(item => item.component_id === component.id);
  const inventoryItem = inventoryData?.inventory_id 
    ? inventoryItems.find(item => item.id === inventoryData.inventory_id)
    : null;

  const handleAdjustInventory = async () => {
    if (!inventoryData?.inventory_id) return;
    
    setTransactionLoading(true);
    try {
      await createInventoryTransaction(
        inventoryData.inventory_id,
        adjustmentType,
        adjustmentAmount,
        adjustmentNotes
      );
      
      setAdjustmentAmount(1);
      setAdjustmentNotes('');
      setIsAdjusting(false);
    } catch (error) {
      console.error('Error adjusting inventory:', error);
    } finally {
      setTransactionLoading(false);
    }
  };

  const getStockStatus = () => {
    if (!inventoryData) return { color: 'bg-gray-100 text-gray-500', label: 'Not Tracked', icon: <Clock size={14} className="mr-1" /> };
    
    if (inventoryData.quantity === 0) {
      return { 
        color: 'bg-red-100 text-red-800', 
        label: 'Out of Stock', 
        icon: <AlertCircle size={14} className="mr-1" /> 
      };
    } else if (inventoryData.quantity <= inventoryData.minimum_quantity) {
      return { 
        color: 'bg-yellow-100 text-yellow-800', 
        label: 'Low Stock', 
        icon: <AlertTriangle size={14} className="mr-1" /> 
      };
    } else {
      return { 
        color: 'bg-green-100 text-green-800', 
        label: 'In Stock', 
        icon: <CheckCircle size={14} className="mr-1" /> 
      };
    }
  };

  const stockStatus = getStockStatus();
  
  // Format currency
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Package className="mr-2 text-gray-600" size={18} />
          Inventory Information
        </h3>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center ${stockStatus.color}`}>
          {stockStatus.icon}
          {stockStatus.label}
        </span>
      </div>

      {inventoryData ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-500">Current Stock</div>
              <div className="text-xl font-semibold">{inventoryData.quantity}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Minimum Level</div>
              <div className="text-xl font-semibold">{inventoryData.minimum_quantity}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Unit Cost</div>
              <div className="text-xl font-semibold">{formatCurrency(inventoryData.unit_cost)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Value</div>
              <div className="text-xl font-semibold">
                {formatCurrency((inventoryData.unit_cost || 0) * inventoryData.quantity)}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            {isAdjusting ? (
              <div className="w-full space-y-3">
                <div className="flex flex-wrap gap-3 items-center">
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value as 'receipt' | 'issue')}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="receipt">Add Stock</option>
                    <option value="issue">Remove Stock</option>
                  </select>
                  <div className="flex items-center">
                    <button 
                      className="px-2 py-1 bg-gray-200 rounded-l-md text-gray-700 hover:bg-gray-300"
                      onClick={() => setAdjustmentAmount(prev => Math.max(1, prev - 1))}
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={adjustmentAmount}
                      onChange={(e) => setAdjustmentAmount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center py-1 border-t border-b border-gray-300"
                    />
                    <button 
                      className="px-2 py-1 bg-gray-200 rounded-r-md text-gray-700 hover:bg-gray-300"
                      onClick={() => setAdjustmentAmount(prev => prev + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <input 
                  type="text"
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  placeholder="Notes (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsAdjusting(false)}
                    className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdjustInventory}
                    disabled={transactionLoading}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  >
                    {transactionLoading ? (
                      <>
                        <span className="animate-spin mr-1">⏳</span> 
                        Processing...
                      </>
                    ) : (
                      'Update Inventory'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsAdjusting(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Adjust Stock
                </button>
                <Link
                  to="/inventory/purchase-orders"
                  className="px-3 py-1.5 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 flex items-center"
                >
                  <ShoppingCart size={14} className="mr-1.5" />
                  Order More
                </Link>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-600 mb-3">This component is not being tracked in inventory.</p>
          <Link 
            to="/inventory"
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 inline-flex items-center"
          >
            <Plus size={14} className="mr-1.5" />
            Add to Inventory
          </Link>
        </div>
      )}
      
      <div className="pt-3 text-right">
        <Link 
          to="/inventory"
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-end"
        >
          View Full Inventory
          <ExternalLink size={14} className="ml-1.5" />
        </Link>
      </div>
    </div>
  );
};

export default ComponentInventorySection;