import React, { useState } from 'react';
import { Component } from '../types';
import { AlertTriangle, CheckCircle, Info, X, Edit2 } from 'lucide-react';
import DriveForm from './ComponentForms/DriveForm';
import ControllerForm from './ComponentForms/ControllerForm';
import PowerForm from './ComponentForms/PowerForm';
import CommunicationForm from './ComponentForms/CommunicationForm';
import SoftwareForm from './ComponentForms/SoftwareForm';
import ManipulationForm from './ComponentForms/ManipulationForm';
import SensorsForm from './ComponentForms/SensorsForm';
import ChassisForm from './ComponentForms/ChassisForm';

interface ComponentDetailsProps {
  component: Component;
  onClose: () => void;
  onUpdate: (updatedComponent: Component) => void;
}

const ComponentDetails: React.FC<ComponentDetailsProps> = ({ component, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  const calculateRiskLevel = () => {
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

  const riskLevel = calculateRiskLevel();
  const riskColor = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  }[riskLevel];

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle size={16} />;
      case 'medium':
        return <Info size={16} />;
      case 'high':
        return <AlertTriangle size={16} />;
    }
  };

  const getFormComponent = () => {
    switch (component.category) {
      case 'Drive':
        return DriveForm;
      case 'Controller':
        return ControllerForm;
      case 'Power':
        return PowerForm;
      case 'Communication':
        return CommunicationForm;
      case 'Software':
        return SoftwareForm;
      case 'Object Manipulation':
        return ManipulationForm;
      case 'Sensors':
        return SensorsForm;
      case 'Chassis':
        return ChassisForm;
      default:
        return null;
    }
  };

  const FormComponent = getFormComponent();

  const handleUpdate = (updatedData: Partial<Component>) => {
    onUpdate({
      ...component,
      ...updatedData,
      id: component.id,
      category: component.category,
    });
    setIsEditing(false);
  };

  if (isEditing && FormComponent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <FormComponent
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            initialData={component}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{component.name}</h2>
            <p className="text-sm text-gray-600">{component.category}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Edit2 size={16} className="mr-1" />
              Edit
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <p className="mt-1">{component.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="mt-1">{component.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Risk Level</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskColor}`}>
                      {getRiskIcon()}
                      <span className="ml-1">{riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Specifications</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {Object.entries(component.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                    <span className="text-sm font-medium text-gray-600">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                    <span className="text-sm text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {component.riskFactors && component.riskFactors.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Factors</h3>
              <div className="space-y-4">
                {component.riskFactors.map((risk) => (
                  <div key={risk.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{risk.name}</h4>
                        <p className="mt-1 text-sm text-gray-600">{risk.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          Severity: {risk.severity}/5
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                          Probability: {risk.probability}/5
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentDetails;