import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Machine } from '../../../types';
import { calculateMachineMetrics } from '../utils/metricsUtils';
import { getComponentIcon } from '../utils/componentUtils';

interface RiskAssessmentProps {
  machine: Machine;
  updatedMachine: Machine | null;
  isEditing: boolean;
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ machine, updatedMachine, isEditing }) => {
  const machineToDisplay = isEditing && updatedMachine ? updatedMachine : machine;
  const metrics = calculateMachineMetrics(machineToDisplay);

  return (
    <div className="space-y-6">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
      </div>
      
      {/* Risk overview */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-100">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-amber-800 flex items-center">
              <AlertTriangle size={18} className="mr-2 text-amber-600" />
              Overall Risk Assessment
            </h4>
            <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-amber-800 shadow-sm">
              Score: {metrics.riskScore}/25
            </div>
          </div>
          
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                parseFloat(metrics.riskScore) > 15
                  ? 'bg-red-500'
                  : parseFloat(metrics.riskScore) > 6
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(parseFloat(metrics.riskScore) / 25 * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="p-4">
          <h4 className="font-medium text-gray-700 mb-3">Component Risk Factors</h4>
          <div className="space-y-4">
            {machineToDisplay.components.filter(c => c.riskFactors && c.riskFactors.length > 0).map(component => (
              <div key={component.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm mr-3">
                    {getComponentIcon(component.category)}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{component.name}</h5>
                    <span className="text-xs text-gray-500">{component.category}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {component.riskFactors && component.riskFactors.map(risk => {
                    const riskScore = risk.severity * risk.probability;
                    const scoreColor =
                      riskScore >= 15 ? 'text-red-700 bg-red-100' :
                      riskScore >= 6 ? 'text-yellow-700 bg-yellow-100' :
                      'text-green-700 bg-green-100';
                    
                    return (
                      <div key={risk.id} className="border-l-2 border-amber-400 pl-3 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{risk.name}</p>
                            <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                          </div>
                          <div className={`px-2 py-1 rounded ${scoreColor} text-xs font-medium flex items-center`}>
                            Score: {riskScore}
                          </div>
                        </div>
                        
                        <div className="flex space-x-3 mt-2">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-gray-500">Severity</span>
                              <span className="text-xs font-medium">{risk.severity}/5</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(risk.severity / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-gray-500">Probability</span>
                              <span className="text-xs font-medium">{risk.probability}/5</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${(risk.probability / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {machineToDisplay.components.filter(c => c.riskFactors && c.riskFactors.length > 0).length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-gray-700 text-lg font-medium mb-2">No Risk Factors Identified</h3>
                <p className="text-gray-500">No risk factors have been identified for this machine's components.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h4 className="font-medium text-gray-800">Safety Recommendations</h4>
        </div>
        
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600 mr-3 mt-0.5" size={18} />
              <div>
                <p className="font-medium text-green-800">Regular Maintenance</p>
                <p className="text-sm text-green-700">Follow the maintenance schedule to minimize component failures.</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="text-yellow-600 mr-3 mt-0.5" size={18} />
              <div>
                <p className="font-medium text-yellow-800">Component Risk Management</p>
                <p className="text-sm text-yellow-700">Address identified component risks before operation.</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-blue-50 rounded-lg">
              <Info className="text-blue-600 mr-3 mt-0.5" size={18} />
              <div>
                <p className="font-medium text-blue-800">Operator Training</p>
                <p className="text-sm text-blue-700">Ensure operators are trained on safety procedures specific to this machine.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessment;