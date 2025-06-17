import React, { useState } from 'react';
import { Machine, Component } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { Package, CheckSquare, AlertTriangle, AlertCircle, Loader2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InventoryAllocationProps {
  machine: Machine;
  onClose: () => void;
}

const InventoryAllocation: React.FC<InventoryAllocationProps> = ({ machine, onClose }) => {
  const { inventoryStatus, allocateComponentsToMachine } = useInventory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [success, setSuccess] = useState(false);

  // Initialize allocations with all components
  useState(() => {
    const initialAllocations = {} as Record<string, number>;
    machine.components.forEach(component => {
      initialAllocations[component.id] = 1; // Default allocation of 1
    });
    setAllocations(initialAllocations);
  });

  // Get stock status for a component
  const getComponentStockStatus = (componentId: string) => {
    const stock = inventoryStatus.find(item => item.component_id === componentId);
    
    if (!stock) {
      return { status: 'not_tracked', quantity: 0, message: 'Not tracked in inventory' };
    }
    
    if (stock.quantity === 0) {
      return { status: 'out_of_stock', quantity: 0, message: 'Out of stock' };
    }
    
    if (stock.quantity < allocations[componentId]) {
      return { 
        status: 'insufficient', 
        quantity: stock.quantity, 
        message: `Only ${stock.quantity} available`
      };
    }
    
    return { 
      status: 'available', 
      quantity: stock.quantity, 
      message: `${stock.quantity} in stock`
    };
  };

  const handleUpdateAllocation = (componentId: string, quantity: number) => {
    setAllocations(prev => ({
      ...prev,
      [componentId]: Math.max(0, quantity)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Convert allocations to the format expected by the API
      const componentAllocations = Object.entries(allocations)
        .filter(([_, quantity]) => quantity > 0)
        .map(([componentId, quantity]) => ({
          componentId,
          quantity
        }));
      
      if (componentAllocations.length === 0) {
        throw new Error('No components allocated');
      }
      
      // Check if we have sufficient inventory for all allocations
      const insufficientComponents = componentAllocations.filter(allocation => {
        const stock = inventoryStatus.find(item => item.component_id === allocation.componentId);
        return !stock || stock.quantity < allocation.quantity;
      });
      
      if (insufficientComponents.length > 0) {
        const componentNames = insufficientComponents.map(alloc => {
          const component = machine.components.find(c => c.id === alloc.componentId);
          return component?.name || 'Unknown component';
        });
        throw new Error(`Insufficient inventory for: ${componentNames.join(', ')}`);
      }
      
      // Allocate components to machine
      await allocateComponentsToMachine(machine.id, componentAllocations);
      setSuccess(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to allocate inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Package size={20} className="mr-2 text-blue-600" />
          Allocate Inventory to Machine
        </h3>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
          <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center">
          <CheckSquare size={18} className="mr-2 flex-shrink-0" />
          <p>Components successfully allocated to machine</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-gray-50 rounded-lg border border-gray-200 mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Component
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Status
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {machine.components.map(component => {
                const stockStatus = getComponentStockStatus(component.id);
                const isUnavailable = stockStatus.status === 'out_of_stock' || stockStatus.status === 'insufficient';
                
                return (
                  <tr key={component.id}>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package size={16} className="text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{component.name}</div>
                          <div className="text-xs text-gray-500">{component.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      {stockStatus.status === 'not_tracked' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Not Tracked
                        </span>
                      ) : stockStatus.status === 'out_of_stock' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle size={12} className="mr-1" />
                          Out of Stock
                        </span>
                      ) : stockStatus.status === 'insufficient' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertTriangle size={12} className="mr-1" />
                          {stockStatus.message}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckSquare size={12} className="mr-1" />
                          {stockStatus.message}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      {stockStatus.status === 'not_tracked' ? (
                        <Link
                          to="/inventory"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Add to inventory
                        </Link>
                      ) : (
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleUpdateAllocation(component.id, Math.max(0, (allocations[component.id] || 1) - 1))}
                            className="p-1 bg-gray-100 rounded-l-md text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isUnavailable || (allocations[component.id] || 0) <= 0}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={stockStatus.quantity}
                            value={allocations[component.id] || 0}
                            onChange={(e) => handleUpdateAllocation(component.id, parseInt(e.target.value) || 0)}
                            className="w-12 py-1 px-1 text-center text-sm border-t border-b border-gray-300"
                            disabled={isUnavailable}
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateAllocation(component.id, (allocations[component.id] || 0) + 1)}
                            className="p-1 bg-gray-100 rounded-r-md text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isUnavailable || (allocations[component.id] || 0) >= stockStatus.quantity}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between">
          <Link
            to="/inventory/purchase-orders"
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 flex items-center"
          >
            <ShoppingCart size={16} className="mr-2" />
            Order Components
          </Link>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Object.values(allocations).every(qty => qty === 0)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Package size={16} className="mr-2" />
                  Allocate Components
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InventoryAllocation;