import React, { useState, useEffect } from 'react';
import { Component } from '../types';
import { AlertTriangle, CheckCircle, Info, X, Edit2, DollarSign, Package } from 'lucide-react';
import DriveForm from './ComponentForms/DriveForm';
import ControllerForm from './ComponentForms/ControllerForm';
import PowerForm from './ComponentForms/PowerForm';
import CommunicationForm from './ComponentForms/CommunicationForm';
import SoftwareForm from './ComponentForms/SoftwareForm';
import ManipulationForm from './ComponentForms/ManipulationForm';
import SensorsForm from './ComponentForms/SensorsForm';
import ChassisForm from './ComponentForms/ChassisForm';
import PriceEstimation from './PriceEstimation';
import ComponentInventorySection from './ComponentInventorySection';

interface ComponentDetailsProps {
  component: Component;
  onClose: () => void;
  onUpdate: (updatedComponent: Component) => Promise<void>;
}

const ComponentDetails: React.FC<ComponentDetailsProps> = ({ component, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'pricing' | 'risks' | 'inventory'>('details');

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
      case 'high':
        return <AlertTriangle size={16} />;
      case 'medium':
        return <Info size={16} />;
      default:
        return <CheckCircle size={16} />;
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

  const handleUpdate = async (updatedData: Partial<Component>) => {
    await onUpdate({
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

        {/* Tab Navigation */}
        <div className="bg-gray-50 px-6 border-b border-gray-200">
          <div className="flex -mb-px">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'details' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center ${
                activeTab === 'pricing' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DollarSign size={16} className="mr-1" />
              Pricing
            </button>
            <button
              onClick={() => setActiveTab('risks')}
              className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center ${
                activeTab === 'risks' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {getRiskIcon()}
              <span className="ml-1">Risk Analysis</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center ${
                activeTab === 'inventory' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package size={16} className="mr-1" />
              <span className="ml-1">Inventory</span>
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {activeTab === 'details' && (
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
          )}

          {activeTab === 'pricing' && (
            <PriceEstimation component={component} />
          )}
          
          {activeTab === 'risks' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Analysis</h3>
              
              {component.riskFactors && component.riskFactors.length > 0 ? (
                <div className="space-y-4">
                  {component.riskFactors.map((risk) => {
                    const riskScore = risk.severity * risk.probability;
                    const scoreBadgeColor = 
                      riskScore >= 15 ? 'bg-red-100 text-red-800' :
                      riskScore >= 6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800';
                    
                    return (
                      <div key={risk.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{risk.name}</h4>
                            <p className="mt-1 text-sm text-gray-600">{risk.description}</p>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scoreBadgeColor}`}>
                              Score: {riskScore}/25
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-gray-500">Severity</span>
                              <span className="text-xs font-medium">{risk.severity}/5</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${risk.severity * 20}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-gray-500">Probability</span>
                              <span className="text-xs font-medium">{risk.probability}/5</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${risk.probability * 20}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        {risk.mitigationStrategy && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-700">Mitigation Strategy:</span>
                            <p className="mt-1 text-sm text-gray-600">{risk.mitigationStrategy}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-green-50 p-6 rounded-lg text-center border border-green-200">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                  <h4 className="text-lg font-medium text-green-800 mb-1">No Risk Factors Identified</h4>
                  <p className="text-green-600">
                    This component doesn't have any associated risk factors.
                  </p>
                </div>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">About Risk Scoring</h4>
                <div className="text-sm text-blue-700">
                  <p className="mb-2">Risk Score = Severity × Probability (max 25)</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <span className="inline-block w-20 font-medium">High Risk:</span> 
                      Score ≥ 15
                    </li>
                    <li>
                      <span className="inline-block w-20 font-medium">Medium Risk:</span> 
                      Score 6-14
                    </li>
                    <li>
                      <span className="inline-block w-20 font-medium">Low Risk:</span> 
                      Score &lt; 6
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <ComponentInventorySection component={component} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentDetails;