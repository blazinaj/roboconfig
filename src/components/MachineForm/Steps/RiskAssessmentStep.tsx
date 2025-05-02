import React from 'react';
import { MachineFormData } from '../MachineForm';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface RiskAssessmentStepProps {
  formData: MachineFormData;
  setFormData: React.Dispatch<React.SetStateAction<MachineFormData>>;
}

const RiskAssessmentStep: React.FC<RiskAssessmentStepProps> = ({ formData }) => {
  const calculateComponentRisk = (component: typeof formData.components[0]) => {
    if (!component.riskFactors || component.riskFactors.length === 0) {
      return { score: 0, level: 'low' };
    }
    
    const maxSeverity = Math.max(...component.riskFactors.map(rf => rf.severity));
    const maxProbability = Math.max(...component.riskFactors.map(rf => rf.probability));
    const score = (maxSeverity * maxProbability) / 25 * 100;
    
    let level = 'low';
    if (score >= 60) level = 'high';
    else if (score >= 30) level = 'medium';
    
    return { score, level };
  };

  const calculateOverallRisk = () => {
    if (formData.components.length === 0) return { score: 0, level: 'low' };
    
    const componentScores = formData.components.map(c => calculateComponentRisk(c).score);
    const averageScore = componentScores.reduce((a, b) => a + b, 0) / componentScores.length;
    
    let level = 'low';
    if (averageScore >= 60) level = 'high';
    else if (averageScore >= 30) level = 'medium';
    
    return { score: averageScore, level };
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'medium':
        return <Info size={16} className="text-yellow-500" />;
      default:
        return <CheckCircle size={16} className="text-green-500" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-700 bg-red-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      default:
        return 'text-green-700 bg-green-100';
    }
  };

  const overallRisk = calculateOverallRisk();

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Overall Risk Assessment</h3>
          <span className={`flex items-center px-3 py-1 rounded-full ${getRiskColor(overallRisk.level)}`}>
            {getRiskIcon(overallRisk.level)}
            <span className="ml-2">{Math.round(overallRisk.score)}% Risk Level</span>
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallRisk.level === 'high'
                ? 'bg-red-500'
                : overallRisk.level === 'medium'
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${overallRisk.score}%` }}
          ></div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Component Risk Analysis</h3>
        <div className="space-y-4">
          {formData.components.map(component => {
            const risk = calculateComponentRisk(component);
            return (
              <div key={component.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{component.name}</h4>
                    <p className="text-sm text-gray-500">{component.category}</p>
                  </div>
                  <span className={`flex items-center px-3 py-1 rounded-full ${getRiskColor(risk.level)}`}>
                    {getRiskIcon(risk.level)}
                    <span className="ml-2">{Math.round(risk.score)}% Risk</span>
                  </span>
                </div>

                {component.riskFactors && component.riskFactors.length > 0 ? (
                  <div className="space-y-3">
                    {component.riskFactors.map(factor => (
                      <div key={factor.id} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-800">{factor.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{factor.description}</p>
                          </div>
                          <div className="flex space-x-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              S: {factor.severity}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                              P: {factor.probability}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No risk factors identified</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentStep;