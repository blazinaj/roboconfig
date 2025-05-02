import React from 'react';
import { Component } from '../../../types';
import { MachineFormData } from '../MachineForm';
import { componentData } from '../../../data/componentData';
import { AlertTriangle, CheckCircle, Info, Plus, X } from 'lucide-react';

interface ComponentSelectionStepProps {
  formData: MachineFormData;
  setFormData: React.Dispatch<React.SetStateAction<MachineFormData>>;
}

const ComponentSelectionStep: React.FC<ComponentSelectionStepProps> = ({ formData, setFormData }) => {
  const getRecommendedComponents = (): Component[] => {
    switch (formData.type) {
      case 'Industrial Robot':
        return componentData.filter(c => 
          c.category === 'Object Manipulation' || 
          c.category === 'Controller' ||
          c.category === 'Power'
        );
      case 'Collaborative Robot':
        return componentData.filter(c => 
          c.category === 'Sensors' || 
          c.category === 'Object Manipulation' ||
          c.category === 'Software'
        );
      case 'Mobile Robot':
        return componentData.filter(c => 
          c.category === 'Drive' || 
          c.category === 'Sensors' ||
          c.category === 'Power'
        );
      case 'Autonomous Vehicle':
        return componentData.filter(c => 
          c.category === 'Drive' || 
          c.category === 'Sensors' ||
          c.category === 'Software'
        );
      case 'Drone':
        return componentData.filter(c => 
          c.category === 'Power' || 
          c.category === 'Controller' ||
          c.category === 'Sensors'
        );
      default:
        return componentData;
    }
  };

  const calculateRiskLevel = (component: Component) => {
    if (!component.riskFactors || component.riskFactors.length === 0) {
      return 'low';
    }
    
    const maxSeverity = Math.max(...component.riskFactors.map(rf => rf.severity));
    const maxProbability = Math.max(...component.riskFactors.map(rf => rf.probability));
    const riskScore = maxSeverity * maxProbability;
    
    if (riskScore >= 15) return 'high';
    if (riskScore >= 6) return 'medium';
    return 'low';
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high':
        return (
          <span className="flex items-center text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs">
            <AlertTriangle size={12} className="mr-1" /> High Risk
          </span>
        );
      case 'medium':
        return (
          <span className="flex items-center text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs">
            <Info size={12} className="mr-1" /> Medium Risk
          </span>
        );
      default:
        return (
          <span className="flex items-center text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs">
            <CheckCircle size={12} className="mr-1" /> Low Risk
          </span>
        );
    }
  };

  const handleAddComponent = (component: Component) => {
    setFormData({
      ...formData,
      components: [...formData.components, component]
    });
  };

  const handleRemoveComponent = (componentId: string) => {
    setFormData({
      ...formData,
      components: formData.components.filter(c => c.id !== componentId)
    });
  };

  const recommendedComponents = getRecommendedComponents();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Components</h3>
        {formData.components.length > 0 ? (
          <div className="space-y-3">
            {formData.components.map(component => (
              <div
                key={component.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{component.name}</h4>
                  <p className="text-sm text-gray-500">{component.category}</p>
                </div>
                <div className="flex items-center space-x-3">
                  {getRiskBadge(calculateRiskLevel(component))}
                  <button
                    onClick={() => handleRemoveComponent(component.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No components selected yet</p>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedComponents.map(component => {
            const isSelected = formData.components.some(c => c.id === component.id);
            return (
              <div
                key={component.id}
                className={`p-4 border rounded-lg ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{component.name}</h4>
                    <p className="text-sm text-gray-500">{component.category}</p>
                  </div>
                  {getRiskBadge(calculateRiskLevel(component))}
                </div>
                <p className="text-sm text-gray-600 mt-2">{component.description}</p>
                <button
                  onClick={() => isSelected ? handleRemoveComponent(component.id) : handleAddComponent(component)}
                  className={`mt-3 w-full flex items-center justify-center px-4 py-2 rounded ${
                    isSelected
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <X size={16} className="mr-1" />
                      Remove
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="mr-1" />
                      Add Component
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ComponentSelectionStep;