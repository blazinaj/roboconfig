import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, Calendar, Battery, Notebook as Robot, PenTool as Tool } from 'lucide-react';
import { Machine, MachineType } from '../../../types';
import { calculateMachineMetrics } from '../utils/metricsUtils';
import { ensureDate } from '../utils/dateUtils';

// Machine icons based on machine type
const MACHINE_ICONS = {
  'Industrial Robot': Robot,
  'Collaborative Robot': Robot,
  'Mobile Robot': Robot,
  'Autonomous Vehicle': Robot,
  'Drone': Robot,
  'Custom': Robot,
};

interface MachineListItemProps {
  machine: Machine;
}

const MachineListItem: React.FC<MachineListItemProps> = ({ machine }) => {
  const navigate = useNavigate();
  const metrics = calculateMachineMetrics(machine);
  const MachineIcon = MACHINE_ICONS[machine.type as MachineType] || MACHINE_ICONS.Custom;

  // Calculate risk level
  const calculateRiskLevel = () => {
    if (!machine.components || machine.components.length === 0) return 'Low';
    
    const maxRiskScore = Math.max(...machine.components.flatMap(component => {
      if (!component.riskFactors || component.riskFactors.length === 0) return [0];
      return component.riskFactors.map(rf => rf.severity * rf.probability);
    }));
    
    if (maxRiskScore >= 15) return 'High';
    if (maxRiskScore >= 6) return 'Medium';
    return 'Low';
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-green-700 bg-green-100">
            <CheckCircle size={12} className="mr-1" /> Active
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-blue-700 bg-blue-100">
            <Tool size={12} className="mr-1" /> Maintenance
          </span>
        );
      case 'Error':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-red-700 bg-red-100">
            <AlertTriangle size={12} className="mr-1" /> Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-gray-700 bg-gray-100">
            <Clock size={12} className="mr-1" /> {status}
          </span>
        );
    }
  };

  // Calculate maintenance status
  const getMaintenanceStatus = () => {
    if (!machine.maintenanceSchedule) return null;

    const now = new Date();
    // Ensure nextDue is a Date object
    const nextDue = ensureDate(machine.maintenanceSchedule.nextDue);
    if (!nextDue) return null;

    const daysUntilDue = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      return {
        label: 'Overdue',
        color: 'text-red-700 bg-red-100',
        icon: <AlertTriangle size={12} className="mr-1" />
      };
    } else if (daysUntilDue <= 7) {
      return {
        label: 'Due Soon',
        color: 'text-yellow-700 bg-yellow-100',
        icon: <Clock size={12} className="mr-1" />
      };
    } else {
      return {
        label: `Due in ${daysUntilDue} days`,
        color: 'text-green-700 bg-green-100',
        icon: <Calendar size={12} className="mr-1" />
      };
    }
  };

  // Get risk badge
  const getRiskBadge = () => {
    const riskLevel = calculateRiskLevel();
    switch (riskLevel) {
      case 'High':
        return <span className="text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs font-medium">High Risk</span>;
      case 'Medium':
        return <span className="text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-xs font-medium">Medium Risk</span>;
      default:
        return <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-medium">Low Risk</span>;
    }
  };

  const maintenanceStatus = getMaintenanceStatus();

  return (
    <div 
      onClick={() => navigate(`/machines/${machine.id}`)}
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-700 to-blue-900 rounded-lg flex items-center justify-center text-white">
            <MachineIcon size={32} />
          </div>
        </div>
        
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{machine.name}</h3>
            <div className="flex flex-wrap gap-2 mt-1 sm:mt-0">
              {getStatusBadge(machine.status)}
              {maintenanceStatus && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${maintenanceStatus.color}`}>
                  {maintenanceStatus.icon}
                  {maintenanceStatus.label}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-3 mb-3">
            <span className="text-sm text-gray-500">{machine.type}</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500">Components: {machine.components.length}</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500">Updated: {new Date(machine.updatedAt).toLocaleDateString()}</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{machine.description}</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
            <div className="bg-gray-50 p-2 rounded-lg">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <Battery size={12} className="mr-1 text-blue-500" />
                Power
              </div>
              <div className="font-medium text-gray-900">{metrics.power}</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded-lg">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <Clock size={12} className="mr-1 text-green-500" />
                Weight
              </div>
              <div className="font-medium text-gray-900">{metrics.weight}</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded-lg sm:col-span-1">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <AlertTriangle size={12} className="mr-1 text-yellow-500" />
                Risk Level
              </div>
              <div className="font-medium text-gray-900">{calculateRiskLevel()}</div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col justify-between items-end">
          {getRiskBadge()}
          
          <div className="mt-auto flex items-center text-blue-600 hover:text-blue-800">
            <span className="text-sm mr-1 font-medium">View Details</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineListItem;