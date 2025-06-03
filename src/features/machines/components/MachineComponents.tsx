import React, { useState } from 'react';
import { X, Settings, Plus, Contrast as DragDropContext, Droplet as Droppable, Cable as Draggable } from 'lucide-react';
import { Machine, Component } from '../../../types';
import { getComponentIcon } from '../utils/componentUtils';
import ComponentSelector from './ComponentSelector';

interface MachineComponentsProps {
  machine: Machine;
  updatedMachine: Machine | null;
  isEditing: boolean;
  handleRemoveComponent: (id: string) => void;
}

const MachineComponents: React.FC<MachineComponentsProps> = ({
  machine,
  updatedMachine,
  isEditing,
  handleRemoveComponent
}) => {
  const [showComponentSelector, setShowComponentSelector] = useState(false);
  const machineToDisplay = isEditing && updatedMachine ? updatedMachine : machine;

  // Handle reordering of components (when drag and drop is implemented)
  const handleReorderComponents = (result: any) => {
    if (!result.destination || !updatedMachine) return;
    
    const items = Array.from(updatedMachine.components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setUpdatedMachine({
      ...updatedMachine,
      components: items
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Machine Components ({machineToDisplay.components.length})
        </h3>
        {isEditing && (
          <button 
            onClick={() => setShowComponentSelector(!showComponentSelector)}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="mr-1.5" />
            Add Component
          </button>
        )}
      </div>
      
      {isEditing && showComponentSelector && (
        <ComponentSelector 
          machine={machine}
          updatedMachine={updatedMachine}
          setUpdatedMachine={setUpdatedMachine}
        />
      )}
      
      {machineToDisplay.components.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {machineToDisplay.components.map((component, index) => (
            <div 
              key={component.id} 
              className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow relative"
            >
              {isEditing && (
                <button
                  onClick={() => handleRemoveComponent(component.id)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200 transition-colors"
                  title="Remove component"
                >
                  <X size={16} />
                </button>
              )}
              <div className="flex items-start">
                <div className="mt-1 mr-3 p-2 rounded-lg bg-white shadow-sm">
                  {getComponentIcon(component.category)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{component.name}</h4>
                  <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {component.category}
                    </span>
                    <span className="mx-1 text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{component.type}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{component.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 mb-3">
            <Settings size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-1">No Components Added</h3>
          <p className="text-gray-500">
            This machine doesn't have any components yet.
          </p>
          {isEditing && (
            <button
              onClick={() => setShowComponentSelector(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus size={16} className="inline mr-1.5" />
              Add Components
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MachineComponents;