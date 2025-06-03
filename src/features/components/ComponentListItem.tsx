import React from 'react';
import { Component } from '../../types';
import { AlertTriangle, CheckCircle, Info, Eye } from 'lucide-react';

interface ComponentListItemProps {
  component: Component;
  onSelect: (component: Component) => void;
}

const ComponentListItem: React.FC<ComponentListItemProps> = ({ component, onSelect }) => {
  // Calculate risk level
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
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200',
  }[riskLevel];

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'high':
        return <AlertTriangle size={14} />;
      case 'medium':
        return <Info size={14} />;
      default:
        return <CheckCircle size={14} />;
    }
  };

  // Get the most important specs as key-value pairs
  const getKeySpecs = () => {
    const specs = component.specifications;
    const keySpecs = [];
    
    // Try to get important specs based on component category
    if (specs.power) keySpecs.push(['Power', specs.power]);
    if (specs.weight) keySpecs.push(['Weight', specs.weight]);
    if (specs.voltage) keySpecs.push(['Voltage', specs.voltage]);
    if (specs.dimensions) keySpecs.push(['Size', specs.dimensions]);
    
    // Add category-specific key specs
    switch (component.category) {
      case 'Drive':
        if (specs.torque) keySpecs.push(['Torque', specs.torque]);
        if (specs.rotationSpeed) keySpecs.push(['Speed', specs.rotationSpeed]);
        break;
      case 'Controller':
        if (specs.processor) keySpecs.push(['CPU', specs.processor]);
        if (specs.memory) keySpecs.push(['Memory', specs.memory]);
        break;
      case 'Sensors':
        if (specs.range) keySpecs.push(['Range', specs.range]);
        if (specs.accuracy) keySpecs.push(['Accuracy', specs.accuracy]);
        break;
    }
    
    // Limit to max 4 specs
    return keySpecs.slice(0, 4);
  };
  
  const keySpecs = getKeySpecs();
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4 flex justify-between cursor-pointer" onClick={() => onSelect(component)}>
        <div className="flex-1 pr-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-800 text-lg">{component.name}</h3>
            <span className={`text-xs h-6 px-2.5 py-1 rounded-full flex items-center ${riskColor}`}>
              {getRiskIcon()}
              <span className="ml-1">{riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk</span>
            </span>
          </div>
          
          <div className="flex items-center mt-1 mb-2">
            <span className="text-xs uppercase font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{component.category}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-sm text-gray-600">{component.type}</span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{component.description}</p>
          
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {keySpecs.map(([key, value], index) => (
              <span key={index} className="inline-flex items-center text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1">
                <span className="font-medium text-gray-600">{key}:</span> 
                <span className="ml-1 text-gray-800">{value}</span>
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col justify-between items-end ml-4">
          <div className="text-right mb-4">
            {component.riskFactors && component.riskFactors.length > 0 && (
              <div className="text-xs bg-yellow-50 text-yellow-700 rounded-full px-2 py-0.5 mb-2 inline-block">
                {component.riskFactors.length} Risk Factor{component.riskFactors.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSelect(component);
            }} 
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Eye size={16} className="mr-1.5" />
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComponentListItem;