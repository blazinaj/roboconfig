import React, { useState } from 'react';
import { Machine } from '../../../types';
import { useInventory } from '../../../hooks/useInventory';
import { 
  Package, ShoppingCart, Truck, CheckCircle, AlertTriangle, 
  AlertCircle, ExternalLink, Plus 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import InventoryAllocation from '../../../components/MachineDetails/InventoryAllocation';

interface MachineInventoryProps {
  machine: Machine;
  updatedMachine: Machine | null;
  isEditing: boolean;
}

const MachineInventory: React.FC<MachineInventoryProps> = ({ 
  machine, 
  updatedMachine,
  isEditing 
}) => {
  const { inventoryStatus } = useInventory();
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  
  const machineToDisplay = isEditing && updatedMachine ? updatedMachine : machine;
  
  // Get inventory status for each component
  const componentsWithInventory = machineToDisplay.components.map(component => {
    const inventoryData = inventoryStatus.find(item => item.component_id === component.id);
    return {
      ...component,
      inventoryStatus: inventoryData ? {
        tracked: true,
        quantity: inventoryData.quantity,
        minimum: inventoryData.minimum_quantity,
        location: inventoryData.location,
        unit_cost: inventoryData.unit_cost
      } : {
        tracked: false
      }
    };
  });
  
  // Calculate summary stats
  const trackedComponents = componentsWithInventory.filter(c => c.inventoryStatus.tracked);
  const outOfStockCount = trackedComponents.filter(c => c.inventoryStatus.quantity === 0).length;
  const lowStockCount = trackedComponents.filter(c => 
    c.inventoryStatus.quantity > 0 && c.inventoryStatus.quantity <= c.inventoryStatus.minimum
  ).length;
  const healthyStockCount = trackedComponents.filter(c => 
    c.inventoryStatus.quantity > c.inventoryStatus.minimum
  ).length;
  
  // Format currency
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Package className="text-blue-600 mr-2" size={20} />
          Component Inventory
        </h3>
        
        <button
          onClick={() => setShowAllocationModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus size={16} className="inline mr-1.5" />
          Allocate from Inventory
        </button>
      </div>
      
      {/* Inventory Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Total Components</h4>
          <p className="text-2xl font-bold text-gray-900">{machineToDisplay.components.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            {trackedComponents.length} tracked in inventory
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Healthy Stock</h4>
          <p className="text-2xl font-bold text-green-600">{healthyStockCount}</p>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <CheckCircle size={12} className="mr-1 text-green-500" />
            Components with sufficient stock
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Low Stock</h4>
          <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <AlertTriangle size={12} className="mr-1 text-yellow-500" />
            Components below minimum level
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Out of Stock</h4>
          <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <AlertCircle size={12} className="mr-1 text-red-500" />
            Components with zero inventory
          </div>
        </div>
      </div>
      
      {/* Component Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Component
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {componentsWithInventory.map(component => (
              <tr key={component.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{component.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{component.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {component.inventoryStatus.tracked ? (
                    <div>
                      {component.inventoryStatus.quantity === 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle size={12} className="mr-1" />
                          Out of Stock
                        </span>
                      ) : component.inventoryStatus.quantity <= component.inventoryStatus.minimum ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertTriangle size={12} className="mr-1" />
                          Low Stock ({component.inventoryStatus.quantity})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          In Stock ({component.inventoryStatus.quantity})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Not Tracked</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {component.inventoryStatus.tracked && component.inventoryStatus.unit_cost ? (
                    <span className="text-sm font-medium">
                      {formatCurrency(component.inventoryStatus.quantity * component.inventoryStatus.unit_cost)}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {component.inventoryStatus.tracked && component.inventoryStatus.location ? (
                    <span className="text-sm">{component.inventoryStatus.location}</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            
            {componentsWithInventory.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No components in this machine
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h4 className="font-medium text-gray-800 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/inventory"
            className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
          >
            <Package className="h-6 w-6 text-blue-600 mb-2" />
            <span className="font-medium text-gray-800">Manage Inventory</span>
            <span className="text-xs text-gray-500 mt-1">View and edit component stock</span>
          </Link>
          
          <Link 
            to="/inventory/purchase-orders"
            className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-amber-50 hover:border-amber-200 transition-colors"
          >
            <ShoppingCart className="h-6 w-6 text-amber-600 mb-2" />
            <span className="font-medium text-gray-800">Purchase Orders</span>
            <span className="text-xs text-gray-500 mt-1">Order new components</span>
          </Link>
          
          <Link 
            to="/inventory/suppliers"
            className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-200 transition-colors"
          >
            <Truck className="h-6 w-6 text-green-600 mb-2" />
            <span className="font-medium text-gray-800">Suppliers</span>
            <span className="text-xs text-gray-500 mt-1">Manage component suppliers</span>
          </Link>
        </div>
      </div>
      
      {/* Allocation Modal */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <InventoryAllocation 
              machine={machine} 
              onClose={() => setShowAllocationModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineInventory;