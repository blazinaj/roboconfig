import React, { useState, useEffect } from 'react';
import { Search, Package, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { Component, Machine } from '../../../types';
import { useComponents } from '../../../hooks/useComponents';
import { getComponentIcon } from '../utils/componentUtils';

interface ComponentSelectorProps {
  machine: Machine;
  updatedMachine: Machine | null;
  setUpdatedMachine: (machine: Machine | null) => void;
}

const ComponentSelector: React.FC<ComponentSelectorProps> = ({
  machine,
  updatedMachine,
  setUpdatedMachine
}) => {
  const { components, loading, error } = useComponents();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get IDs of components already in the machine to avoid duplicates
  const machineComponentIds = updatedMachine
    ? new Set(updatedMachine.components.map(c => c.id))
    : new Set(machine.components.map(c => c.id));
  
  // Filter available components that are not already in the machine
  const availableComponents = components.filter(component => 
    !machineComponentIds.has(component.id) &&
    (selectedCategory ? component.category === selectedCategory : true) &&
    (searchQuery ? 
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    )
  );
  
  // List of component categories for filtering
  const componentCategories = [
    'Drive',
    'Controller',
    'Power',
    'Communication',
    'Software',
    'Object Manipulation',
    'Sensors',
    'Chassis'
  ];

  const handleAddComponent = (component: Component) => {
    if (!updatedMachine) return;
    
    setUpdatedMachine({
      ...updatedMachine,
      components: [...updatedMachine.components, component]
    });
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="animate-spin text-blue-500\" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 flex items-center">
        <AlertTriangle className="mr-2" size={20} />
        <span>Error loading components: {error}</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-medium text-gray-800 mb-4 flex items-center">
        <Package className="mr-2 text-blue-500" size={18} />
        Add Components
      </h3>
      
      <div className="mb-4 space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-sm rounded-full ${
              selectedCategory === null 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          
          {componentCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-sm rounded-full ${
                selectedCategory === category 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto pr-1">
        {availableComponents.length > 0 ? (
          <div className="space-y-2">
            {availableComponents.map(component => (
              <div
                key={component.id}
                className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-gray-50 rounded-lg mr-3">
                    {getComponentIcon(component.category)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{component.name}</h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded mr-2">{component.category}</span>
                      <span>{component.type}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleAddComponent(component)}
                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                  title="Add component"
                >
                  <Plus size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <Package size={36} className="mx-auto text-gray-400 mb-2" />
            <h4 className="text-gray-700 font-medium mb-1">No Available Components</h4>
            <p className="text-gray-500 text-sm">
              {searchQuery || selectedCategory
                ? "No components match your filters"
                : "All components have been added to this machine"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentSelector;