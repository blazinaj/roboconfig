import React, { useState, useEffect } from 'react';
import { Machine, MachineType, Component } from '../../types';
import { Notebook as Robot, X, Bot, Save, Search, AlertTriangle, Plus, Calendar, Cog, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useComponents } from '../../hooks/useComponents';
import { useSupabase } from '../../context/SupabaseContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AIAssistant from './AIAssistant';
import ComponentCard from './ComponentCard';
import Tooltip from '../UI/Tooltip';

interface MachineFormProps {
  onSubmit: (machine: Partial<Machine>) => void;
  onCancel: () => void;
  initialData?: Machine;
}

export type MachineFormData = {
  name: string;
  type: MachineType;
  description: string;
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Error' | 'Offline';
  components: Component[];
  maintenanceSchedule?: {
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  };
};

const MachineForm: React.FC<MachineFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<MachineFormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'Industrial Robot',
    description: initialData?.description || '',
    status: initialData?.status || 'Inactive',
    components: initialData?.components || [],
    maintenanceSchedule: initialData?.maintenanceSchedule ? {
      frequency: initialData.maintenanceSchedule.frequency
    } : {
      frequency: 'Monthly'
    }
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [componentSearchQuery, setComponentSearchQuery] = useState('');
  const [componentCategory, setComponentCategory] = useState<string | null>(null);
  
  // Collapsible sections state
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    basicInfo: false,
    components: false,
    maintenance: false
  });
  
  const { components, loading: componentsLoading } = useComponents();
  const { session } = useSupabase();

  // Calculate total metrics
  const [metrics, setMetrics] = useState({
    totalWeight: '0g',
    totalPower: '0W',
    estimatedCost: '$0',
    compatibilityScore: 'N/A',
    riskLevel: 'Low'
  });

  useEffect(() => {
    calculateMetrics();
  }, [formData.components]);

  const calculateMetrics = () => {
    let totalWeight = 0;
    let totalPowerConsumption = 0;
    let estimatedCost = 0;
    let riskScore = 0;
    
    formData.components.forEach(component => {
      // Extract weight from specifications
      const weightStr = component.specifications.weight as string;
      if (weightStr) {
        const weight = parseFloat(weightStr);
        if (!isNaN(weight)) {
          // Assume weight is in grams if unit is not specified
          if (weightStr.toLowerCase().includes('kg')) {
            totalWeight += weight * 1000;
          } else {
            totalWeight += weight;
          }
        }
      }

      // Calculate power consumption from voltage and current if available
      const voltage = parseFloat(component.specifications.voltage as string);
      const current = parseFloat(component.specifications.current as string);
      if (!isNaN(voltage) && !isNaN(current)) {
        totalPowerConsumption += voltage * current;
      } else if (component.specifications.power) {
        // If power is directly specified
        const power = parseFloat(component.specifications.power as string);
        if (!isNaN(power)) {
          totalPowerConsumption += power;
        }
      }
      
      // Simulated cost calculation - in a real app, this would be based on actual component costs
      estimatedCost += Math.random() * 100 + 50; // Random value between 50 and 150
      
      // Calculate risk score
      if (component.riskFactors && component.riskFactors.length > 0) {
        const componentRiskScore = Math.max(
          ...component.riskFactors.map(rf => rf.severity * rf.probability)
        );
        riskScore = Math.max(riskScore, componentRiskScore);
      }
    });

    let riskLevel = 'Low';
    if (riskScore >= 15) riskLevel = 'High';
    else if (riskScore >= 6) riskLevel = 'Medium';
    
    // Generate compatibility score - would be more sophisticated in a real app
    const componentTypes = new Set(formData.components.map(c => c.category));
    let compatibilityScore = 'N/A';
    
    if (formData.components.length >= 2) {
      const essentialCategories = ['Controller', 'Power'];
      const hasEssentials = essentialCategories.every(category => 
        formData.components.some(comp => comp.category === category)
      );
      
      if (hasEssentials) {
        compatibilityScore = formData.components.length >= 4 ? 'High' : 'Medium';
      } else {
        compatibilityScore = 'Low';
      }
    }
    
    setMetrics({
      totalWeight: totalWeight > 1000 ? `${(totalWeight / 1000).toFixed(2)} kg` : `${totalWeight.toFixed(2)} g`,
      totalPower: totalPowerConsumption > 1000 ? `${(totalPowerConsumption / 1000).toFixed(2)} kW` : `${totalPowerConsumption.toFixed(2)} W`,
      estimatedCost: `$${estimatedCost.toFixed(2)}`,
      compatibilityScore,
      riskLevel
    });
  };

  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
  };

  const toggleSection = (section: keyof typeof sectionsCollapsed) => {
    setSectionsCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = () => {
    // Validate form
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Machine name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (formData.components.length === 0) {
      errors.components = 'At least one component is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    onSubmit(formData);
  };

  const machineTypes: { type: MachineType; description: string }[] = [
    {
      type: 'Industrial Robot',
      description: 'Heavy-duty robots for manufacturing and assembly lines'
    },
    {
      type: 'Collaborative Robot',
      description: 'Robots designed to work alongside humans safely'
    },
    {
      type: 'Mobile Robot',
      description: 'Autonomous robots for transportation and logistics'
    },
    {
      type: 'Autonomous Vehicle',
      description: 'Self-driving vehicles for various applications'
    },
    {
      type: 'Drone',
      description: 'Aerial robots for surveillance and delivery'
    },
    {
      type: 'Custom',
      description: 'Custom robot configuration for specific needs'
    }
  ];

  const filteredComponents = components.filter(component => {
    if (!componentSearchQuery && !componentCategory) return true;
    
    const matchesSearch = !componentSearchQuery || (
      component.name.toLowerCase().includes(componentSearchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(componentSearchQuery.toLowerCase()) ||
      component.category.toLowerCase().includes(componentSearchQuery.toLowerCase())
    );
    
    const matchesCategory = !componentCategory || component.category === componentCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const isComponentSelected = (id: string) => {
    return formData.components.some(component => component.id === id);
  };
  
  const handleSelectComponent = (component: Component) => {
    if (isComponentSelected(component.id)) {
      setFormData({
        ...formData,
        components: formData.components.filter(c => c.id !== component.id)
      });
    } else {
      setFormData({
        ...formData,
        components: [...formData.components, component]
      });
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

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

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

  // Handle drag and drop reordering
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    const reorderedComponents = [...formData.components];
    const [removed] = reorderedComponents.splice(sourceIndex, 1);
    reorderedComponents.splice(destinationIndex, 0, removed);
    
    setFormData({
      ...formData,
      components: reorderedComponents
    });
  };

  // Custom component for drag handle
  const DragHandleIcon = ({ size = 16, className = "" }) => {
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={2} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
      >
        <circle cx="9" cy="5" r="1" />
        <circle cx="9" cy="12" r="1" />
        <circle cx="9" cy="19" r="1" />
        <circle cx="15" cy="5" r="1" />
        <circle cx="15" cy="12" r="1" />
        <circle cx="15" cy="19" r="1" />
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center">
            <Robot className="text-white mr-2" size={24} />
            <div>
              <h2 className="text-xl font-semibold">
                {initialData ? 'Edit Machine' : 'New Machine'}
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleAIAssistant}
              className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${
                showAIAssistant 
                  ? 'bg-white text-blue-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              <Bot size={18} className="mr-1.5" />
              <span className="text-sm font-medium">AI Assistant</span>
            </button>
            <button onClick={onCancel} className="text-white hover:text-blue-100">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            {Object.keys(validationErrors).length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-red-800 font-medium flex items-center mb-2">
                  <AlertTriangle size={18} className="mr-2" />
                  Please fix the following errors:
                </h3>
                <ul className="list-disc pl-5 text-red-700 text-sm">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Performance & Compatibility Summary */}
            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-3">Configuration Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <div className="text-xs text-blue-600 mb-1">Weight</div>
                  <div className="text-sm font-medium">{metrics.totalWeight}</div>
                </div>
                <div>
                  <div className="text-xs text-blue-600 mb-1">Power Usage</div>
                  <div className="text-sm font-medium">{metrics.totalPower}</div>
                </div>
                <div>
                  <div className="text-xs text-blue-600 mb-1">Est. Cost</div>
                  <div className="text-sm font-medium">{metrics.estimatedCost}</div>
                </div>
                <div>
                  <div className="text-xs text-blue-600 mb-1">Compatibility</div>
                  <div className={`text-sm font-medium ${
                    metrics.compatibilityScore === 'High' ? 'text-green-600' :
                    metrics.compatibilityScore === 'Medium' ? 'text-yellow-600' :
                    metrics.compatibilityScore === 'Low' ? 'text-red-600' : ''
                  }`}>
                    {metrics.compatibilityScore}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-blue-600 mb-1">Risk Level</div>
                  <div className={`text-sm font-medium ${
                    metrics.riskLevel === 'Low' ? 'text-green-600' :
                    metrics.riskLevel === 'Medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {metrics.riskLevel}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Basic Information */}
            <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div 
                className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('basicInfo')}
              >
                <h3 className="font-medium text-gray-900">Basic Information</h3>
                <div>
                  {sectionsCollapsed.basicInfo ? (
                    <ChevronDown size={18} className="text-gray-500" />
                  ) : (
                    <ChevronUp size={18} className="text-gray-500" />
                  )}
                </div>
              </div>
              
              {!sectionsCollapsed.basicInfo && (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Machine Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (validationErrors.name) {
                          const { name, ...rest } = validationErrors;
                          setValidationErrors(rest);
                        }
                      }}
                      className={`w-full px-3 py-2 border ${
                        validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter machine name"
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Machine Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {machineTypes.map(({ type, description }) => (
                        <div
                          key={type}
                          onClick={() => setFormData({ ...formData, type })}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            formData.type === type
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-blue-200'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{type}</div>
                          <div className="text-xs text-gray-500 mt-1">{description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        if (validationErrors.description) {
                          const { description, ...rest } = validationErrors;
                          setValidationErrors(rest);
                        }
                      }}
                      className={`w-full px-3 py-2 border ${
                        validationErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      rows={3}
                      placeholder="Describe the purpose and functionality of this machine"
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as MachineFormData['status'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Inactive">Inactive</option>
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Error">Error</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            {/* Components Section */}
            <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div 
                className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('components')}
              >
                <h3 className="font-medium text-gray-900">Components</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {formData.components.length} components selected
                  </span>
                  {sectionsCollapsed.components ? (
                    <ChevronDown size={18} className="text-gray-500" />
                  ) : (
                    <ChevronUp size={18} className="text-gray-500" />
                  )}
                </div>
              </div>
              
              {!sectionsCollapsed.components && (
                <div className="p-4 space-y-4">
                  {validationErrors.components && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                      {validationErrors.components}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-2">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={componentSearchQuery}
                        onChange={(e) => setComponentSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Search components..."
                      />
                    </div>
                    <select
                      value={componentCategory || ''}
                      onChange={(e) => setComponentCategory(e.target.value || null)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">All Categories</option>
                      {componentCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Available Components</h4>
                      </div>
                      
                      <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-md">
                        {componentsLoading ? (
                          <div className="flex items-center justify-center h-20">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          </div>
                        ) : filteredComponents.length > 0 ? (
                          <ul className="divide-y divide-gray-200">
                            {filteredComponents.map(component => {
                              if (isComponentSelected(component.id)) return null;
                              
                              return (
                                <ComponentCard
                                  key={component.id}
                                  component={component}
                                  onClick={() => handleSelectComponent(component)}
                                  selected={false}
                                />
                              );
                            })}
                          </ul>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No components found matching your search
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-2 flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-700">Selected Components</h4>
                        <button 
                          type="button"
                          onClick={() => setFormData({ ...formData, components: [] })}
                          disabled={formData.components.length === 0}
                          className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Clear All
                        </button>
                      </div>
                      
                      {formData.components.length > 0 ? (
                        <DragDropContext onDragEnd={onDragEnd}>
                          <Droppable droppableId="selected-components">
                            {(provided) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-md"
                              >
                                {formData.components.map((component, index) => (
                                  <Draggable 
                                    key={component.id} 
                                    draggableId={component.id} 
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`p-3 border-b border-gray-200 last:border-0 ${
                                          snapshot.isDragging ? 'bg-blue-50' : 'bg-white'
                                        }`}
                                      >
                                        <div className="flex items-start">
                                          <div 
                                            {...provided.dragHandleProps}
                                            className="mt-1 mr-2 text-gray-400 cursor-grab"
                                          >
                                            <DragHandleIcon size={16} />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex justify-between">
                                              <div>
                                                <span className="font-medium text-gray-900">{component.name}</span>
                                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                                                  {component.category}
                                                </span>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => handleSelectComponent(component)}
                                                className="text-gray-400 hover:text-red-500"
                                              >
                                                <X size={16} />
                                              </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{component.description}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] border border-dashed border-gray-300 rounded-md p-4 bg-gray-50">
                          <p className="text-gray-500 text-sm mb-2">No components selected</p>
                          <p className="text-gray-400 text-xs text-center">
                            Drag and drop or select components from the available list
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Component Relationship Visualization */}
                  {formData.components.length >= 2 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Component Relationships</h4>
                      <div className="relative w-full h-24 bg-white rounded border border-gray-200 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          {/* This would be replaced by an actual visualization component in a real implementation */}
                          <div className="text-xs text-gray-500">
                            Visual component relationship map would be displayed here
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Maintenance Schedule - Simplified */}
            <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div 
                className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection('maintenance')}
              >
                <h3 className="font-medium text-gray-900">Maintenance Schedule</h3>
                <div>
                  {sectionsCollapsed.maintenance ? (
                    <ChevronDown size={18} className="text-gray-500" />
                  ) : (
                    <ChevronUp size={18} className="text-gray-500" />
                  )}
                </div>
              </div>
              
              {!sectionsCollapsed.maintenance && (
                <div className="p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Frequency
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const).map(frequency => (
                        <button
                          key={frequency}
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            maintenanceSchedule: {
                              ...formData.maintenanceSchedule!,
                              frequency
                            }
                          })}
                          className={`p-2 text-center text-sm rounded-md border transition-colors ${
                            formData.maintenanceSchedule?.frequency === frequency
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-blue-200 text-gray-700'
                          }`}
                        >
                          {frequency}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      The maintenance frequency determines how often routine maintenance should be performed. 
                      Maintenance tasks can be defined after creating the machine.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              >
                <Save size={16} className="mr-2" />
                {initialData ? 'Save Changes' : 'Create Machine'}
              </button>
            </div>
          </div>
          
          {/* AI Assistant Panel */}
          {showAIAssistant && (
            <div className="w-96 border-l border-gray-200">
              <AIAssistant 
                formData={formData} 
                setFormData={setFormData} 
                onClose={toggleAIAssistant} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MachineForm;