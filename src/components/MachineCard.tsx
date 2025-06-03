import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Machine, MachineType } from '../types';
import { AlertTriangle, CheckCircle, PenTool as Tool, Battery, Clock, ChevronRight, Calendar, Notebook as Robot, Truck, Cpu, Plane, Settings } from 'lucide-react';

// Machine icons based on machine type
const MACHINE_ICONS = {
  'Industrial Robot': Robot,
  'Collaborative Robot': Cpu,
  'Mobile Robot': Truck,
  'Autonomous Vehicle': Truck,
  'Drone': Plane,
  'Custom': Settings,
};

// Helper function to ensure a value is a Date object
const ensureDate = (date: any): Date | null => {
  if (!date) return null;
  if (date instanceof Date) return date;
  // If it's a string or number, try to convert it to a Date
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
};

interface MachineCardProps {
  machine: Machine;
}

const MachineCard: React.FC<MachineCardProps> = ({ machine }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-medium">
            <CheckCircle size={12} className="mr-1" /> Active
          </span>
        );
      case 'Maintenance':
        return (
          <span className="flex items-center text-blue-700 bg-blue-100 px-3 py-1 rounded-full text-xs font-medium">
            <Tool size={12} className="mr-1" /> Maintenance
          </span>
        );
      case 'Error':
        return (
          <span className="flex items-center text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs font-medium">
            <AlertTriangle size={12} className="mr-1" /> Error
          </span>
        );
      default:
        return (
          <span className="flex items-center text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
            <Clock size={12} className="mr-1" /> {status}
          </span>
        );
    }
  };

  const calculateMachineMetrics = () => {
    let totalWeight = 0;
    let totalPowerConsumption = 0;

    machine.components.forEach(component => {
      // Check if specifications exists before accessing properties
      if (component.specifications) {
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

        // Calculate power consumption
        const voltage = parseFloat(component.specifications.voltage as string || '0');
        const current = parseFloat(component.specifications.current as string || '0');
        if (!isNaN(voltage) && !isNaN(current)) {
          totalPowerConsumption += voltage * current;
        } else if (component.specifications.power) {
          const power = parseFloat(component.specifications.power as string || '0');
          if (!isNaN(power)) {
            totalPowerConsumption += power;
          }
        }
      }
    });

    return {
      weight: totalWeight > 1000 ? `${(totalWeight / 1000).toFixed(2)} kg` : `${totalWeight.toFixed(2)} g`,
      power: totalPowerConsumption > 1000 ? `${(totalPowerConsumption / 1000).toFixed(2)} kW` : `${totalPowerConsumption.toFixed(2)} W`
    };
  };
  
  const metrics = calculateMachineMetrics();
  
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

  const maintenanceStatus = getMaintenanceStatus();
  const MachineIcon = MACHINE_ICONS[machine.type as MachineType] || MACHINE_ICONS.Custom;
  
  return (
    <div 
      onClick={() => navigate(`/machines/${machine.id}`)}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="md:flex">
        <div 
          className="md:w-1/3 h-36 md:h-auto relative bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-4">
            <span className="text-white font-medium">{machine.type}</span>
            <div className="flex space-x-2 mt-2">
              {getStatusBadge(machine.status)}
              {maintenanceStatus && (
                <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${maintenanceStatus.color}`}>
                  {maintenanceStatus.icon}
                  {maintenanceStatus.label}
                </span>
              )}
            </div>
          </div>
          <MachineIcon size={64} className="text-white/80" />
        </div>
        
        <div className="p-5 md:p-6 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {machine.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{machine.description}</p>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-2 rounded-lg">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <Battery size={12} className="mr-1 text-blue-500" />
                Power Usage
              </div>
              <div className="font-medium text-gray-900">{metrics.power}</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded-lg">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <CheckCircle size={12} className="mr-1 text-green-500" />
                Components
              </div>
              <div className="font-medium text-gray-900">{machine.components.length}</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Updated {new Date(machine.updatedAt).toLocaleDateString()}
            </div>
            {getRiskBadge()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineCard;