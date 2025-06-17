import React, { useState } from 'react';
import { Component } from '../../types';
import { useInventory } from '../../hooks/useInventory';
import { Package, Plus } from 'lucide-react';
import ComponentToInventory from './ComponentToInventory';

interface AddToInventoryButtonProps {
  component: Component;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const AddToInventoryButton: React.FC<AddToInventoryButtonProps> = ({ 
  component, 
  size = 'md',
  fullWidth = false
}) => {
  const [showForm, setShowForm] = useState(false);
  const { inventoryStatus, loading } = useInventory();
  
  // Don't render anything while inventory data is loading
  if (loading) {
    return null;
  }
  
  // Check if component is already in inventory
  const existingInventory = inventoryStatus.find(item => item.component_id === component.id);
  
  // If component is already in inventory, don't show the button
  if (existingInventory) {
    return null;
  }
  
  // Button size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className={`${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} 
                    bg-blue-600 text-white hover:bg-blue-700
                    rounded flex items-center justify-center transition-colors`}
      >
        <Package size={size === 'sm' ? 12 : 16} className="mr-1" />
        {size === 'sm' ? 'Add to Inventory' : 'Add to Inventory'}
      </button>
      
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <ComponentToInventory 
              component={component}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AddToInventoryButton;