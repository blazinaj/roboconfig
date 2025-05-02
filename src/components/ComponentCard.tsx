import React, { useState } from 'react';
import { Component } from '../types';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ComponentCardProps {
  component: Component;
  onSelect: (component: Component) => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
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
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">{component.name}</h3>
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2 py-1 rounded-full ${riskColor}`}>
            {riskLevel === 'low' && <CheckCircle size={12} className="inline mr-1" />}
            {riskLevel === 'medium' && <Info size={12} className="inline mr-1" />}
            {riskLevel === 'high' && <AlertTriangle size={12} className="inline mr-1" />}
            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
          </span>
          <button 
            onClick={toggleExpand}
            className="text-gray-500 hover:text-gray-700"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      
      <div className="px-4 py-3">
        <div className="flex justify-between">
          <div className="text-sm text-gray-600">
            <span className="text-xs uppercase font-semibold text-gray-500">{component.category}</span>
            <span className="mx-2">•</span>
            <span>{component.type}</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">{component.description}</p>
      </div>
      
      {expanded && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Specifications</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(component.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                  <span className="font-mono text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {component.riskFactors && component.riskFactors.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Risk Factors</h4>
              <div className="space-y-2">
                {component.riskFactors.map(risk => (
                  <div key={risk.id} className="text-xs border-l-2 border-yellow-400 pl-2 py-1">
                    <div className="font-medium text-gray-800">{risk.name}</div>
                    <div className="text-gray-600 mt-1">{risk.description}</div>
                    <div className="mt-1 flex space-x-2">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        Severity: {risk.severity}/5
                      </span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        Probability: {risk.probability}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-3">
            <button 
              onClick={() => onSelect(component)} 
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentCard;