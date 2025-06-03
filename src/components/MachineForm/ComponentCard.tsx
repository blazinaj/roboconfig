import React from 'react';
import { Component } from '../../types';
import { AlertTriangle, CheckCircle, Info, Plus, X } from 'lucide-react';

interface ComponentCardProps {
  component: Component;
  selected: boolean;
  onClick: () => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component, selected, onClick }) => {
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

  const getRiskIcon = () => {
    const riskLevel = calculateRiskLevel();
    switch (riskLevel) {
      case 'high':
        return <AlertTriangle size={12} className="text-red-600" />;
      case 'medium':
        return <Info size={12} className="text-yellow-600" />;
      default:
        return <CheckCircle size={12} className="text-green-600" />;
    }
  };

  const getRiskLabel = () => {
    const riskLevel = calculateRiskLevel();
    return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
  };

  const getRiskBadgeClass = () => {
    const riskLevel = calculateRiskLevel();
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <li
      className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        selected ? 'bg-blue-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => {}}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <h5 className="ml-2 font-medium text-gray-900">{component.name}</h5>
          </div>
          <p className="mt-1 text-xs text-gray-500 ml-6">{component.description.substring(0, 60)}{component.description.length > 60 ? '...' : ''}</p>
          <div className="mt-1 flex items-center space-x-2 ml-6">
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
              {component.category}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs flex items-center ${getRiskBadgeClass()}`}>
              {getRiskIcon()}
              <span className="ml-1">{getRiskLabel()} Risk</span>
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`p-1 rounded-full ${
            selected
              ? 'text-red-600 hover:bg-red-100'
              : 'text-blue-600 hover:bg-blue-100'
          }`}
        >
          {selected ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>
    </li>
  );
};

export default ComponentCard;