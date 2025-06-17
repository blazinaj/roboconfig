import React from 'react';
import { BarChart3, Heart, Zap, Activity } from 'lucide-react';
import { Machine } from '../../../types';
import { calculatePerformanceScore, calculateReliabilityScore, calculateEfficiencyScore } from '../utils/metricsUtils';

interface MachineMetricsCardProps {
  machine: Machine;
  updatedMachine: Machine | null;
  isEditing: boolean;
}

const MachineMetricsCard: React.FC<MachineMetricsCardProps> = ({ 
  machine, 
  updatedMachine, 
  isEditing 
}) => {
  const machineToUse = isEditing && updatedMachine ? updatedMachine : machine;
  
  const performance = calculatePerformanceScore(machineToUse);
  const reliability = calculateReliabilityScore(machineToUse);
  const efficiency = calculateEfficiencyScore(machineToUse);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 shadow-sm">
        <div className="flex justify-between">
          <div className="text-blue-600 mb-1">
            <BarChart3 size={18} />
          </div>
          <div className="text-xs font-semibold text-blue-700 bg-blue-200 px-2 py-0.5 rounded-full">
            {performance.level}
          </div>
        </div>
        <div className="text-xl font-bold text-gray-900">{Math.round(performance.score)}<span className="text-sm">/100</span></div>
        <div className="text-xs text-blue-800">Performance Score</div>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 shadow-sm">
        <div className="flex justify-between">
          <div className="text-green-600 mb-1">
            <Heart size={18} />
          </div>
          <div className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
            {reliability.level}
          </div>
        </div>
        <div className="text-xl font-bold text-gray-900">{Math.round(reliability.score)}<span className="text-sm">/100</span></div>
        <div className="text-xs text-green-800">Reliability Score</div>
      </div>
      
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 shadow-sm">
        <div className="flex justify-between">
          <div className="text-yellow-600 mb-1">
            <Zap size={18} />
          </div>
          <div className="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded-full">
            {efficiency.level}
          </div>
        </div>
        <div className="text-xl font-bold text-gray-900">{Math.round(efficiency.score)}<span className="text-sm">/100</span></div>
        <div className="text-xs text-yellow-800">Efficiency Score</div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 shadow-sm">
        <div className="flex justify-between">
          <div className="text-purple-600 mb-1">
            <Activity size={18} />
          </div>
          <div className="text-xs font-semibold text-purple-700 bg-purple-200 px-2 py-0.5 rounded-full">
            Active
          </div>
        </div>
        <div className="text-xl font-bold text-gray-900">{machineToUse.components.length}</div>
        <div className="text-xs text-purple-800">Components</div>
      </div>
    </div>
  );
};

export default MachineMetricsCard;