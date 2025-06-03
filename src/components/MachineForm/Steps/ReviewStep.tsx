import React from 'react';
import { MachineFormData } from '../MachineForm';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ReviewStepProps {
  formData: MachineFormData;
  setFormData: React.Dispatch<React.SetStateAction<MachineFormData>>;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  const calculateRiskLevel = (component: typeof formData.components[0]) => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Active</span>;
      case 'Maintenance':
        return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">Maintenance</span>;
      case 'Error':
        return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">Error</span>;
      case 'Offline':
        return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Offline</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">Inactive</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Machine Configuration Review</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Basic Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-500">Name</label>
                  <p className="text-gray-900">{formData.name}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Type</label>
                  <p className="text-gray-900">{formData.type}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(formData.status)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Description</label>
                  <p className="text-gray-900">{formData.description}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Maintenance Schedule
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-500">Frequency</label>
                  <p className="text-gray-900">{formData.maintenanceSchedule.frequency}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Tasks</label>
                  <p className="text-gray-900">{formData.maintenanceSchedule.tasks.length} tasks configured</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Components ({formData.components.length})</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {formData.components.map(component => (
              <div
                key={component.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{component.name}</h4>
                  <p className="text-sm text-gray-500">{component.category}</p>
                </div>
                {getRiskBadge(calculateRiskLevel(component))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Maintenance Tasks</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {formData.maintenanceSchedule.tasks.map((task, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{task.name}</h4>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">{task.estimatedDuration} min</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                      task.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{task.description}</p>
              </div>
            ))}

            {formData.maintenanceSchedule.tasks.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500">No maintenance tasks configured</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;