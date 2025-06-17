import React from 'react';
import { Component } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { AlertTriangle, CheckCircle, AlertCircle, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InventoryStatusProps {
  componentId: string;
  simple?: boolean;
}

const InventoryStatus: React.FC<InventoryStatusProps> = ({ componentId, simple = false }) => {
  const { inventoryStatus } = useInventory();
  
  // Find inventory data for this component
  const inventoryData = inventoryStatus.find(item => item.component_id === componentId);
  
  if (!inventoryData) {
    return (
      <div className={`text-xs text-gray-500 flex items-center ${simple ? '' : 'p-2 bg-gray-50 rounded'}`}>
        <Package size={14} className="mr-1" />
        Not in inventory
      </div>
    );
  }

  // Format currency
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Simple version for use in tables, lists, etc.
  if (simple) {
    if (inventoryData.quantity === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          <AlertCircle size={12} className="mr-1" />
          Out of Stock
        </span>
      );
    } else if (inventoryData.quantity <= inventoryData.minimum_quantity) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          <AlertTriangle size={12} className="mr-1" />
          Low Stock ({inventoryData.quantity})
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" />
          In Stock ({inventoryData.quantity})
        </span>
      );
    }
  }
  
  // Full version with detailed information
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-gray-800 flex items-center">
          <Package size={16} className="mr-1.5" />
          Inventory Status
        </h4>
        {inventoryData.quantity === 0 ? (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            <AlertCircle size={12} className="mr-1" />
            Out of Stock
          </span>
        ) : inventoryData.quantity <= inventoryData.minimum_quantity ? (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            <AlertTriangle size={12} className="mr-1" />
            Low Stock
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            In Stock
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Quantity:</span>
          <span className="float-right font-medium text-gray-900">{inventoryData.quantity}</span>
        </div>
        <div>
          <span className="text-gray-500">Min. Level:</span>
          <span className="float-right font-medium text-gray-900">{inventoryData.minimum_quantity}</span>
        </div>
        {inventoryData.unit_cost !== undefined && inventoryData.unit_cost !== null && (
          <div>
            <span className="text-gray-500">Unit Cost:</span>
            <span className="float-right font-medium text-gray-900">
              {formatCurrency(inventoryData.unit_cost)}
            </span>
          </div>
        )}
        {inventoryData.location && (
          <div>
            <span className="text-gray-500">Location:</span>
            <span className="float-right font-medium text-gray-900">{inventoryData.location}</span>
          </div>
        )}
      </div>
      
      <Link 
        to="/inventory"
        className="mt-3 text-xs text-blue-600 hover:text-blue-800 flex items-center justify-end"
      >
        View in Inventory
        <ArrowRight size={12} className="ml-1" />
      </Link>
    </div>
  );
};

export default InventoryStatus;