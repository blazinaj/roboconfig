import React, { useState } from 'react';
import { Activity, Settings, PenTool as Tool, AlertTriangle } from 'lucide-react';
import { Machine } from '../../types';
import MachineComponents from './components/MachineComponents';
import MaintenanceSchedule from './components/MaintenanceSchedule';
import RiskAssessment from './components/RiskAssessment';

interface MachineTabViewProps {
  machine: Machine;
  updatedMachine: Machine | null;
  isEditing: boolean;
  handleRemoveComponent: (id: string) => void;
  handleToggleTaskComplete: (taskId: string) => void;
  handleChangeMaintenanceFrequency: (frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly') => void;
  handleAddTask: (task: any) => void;
}

type TabType = 'overview' | 'components' | 'maintenance' | 'risks';

const MachineTabView: React.FC<MachineTabViewProps> = ({
  machine,
  updatedMachine,
  isEditing,
  handleRemoveComponent,
  handleToggleTaskComplete,
  handleChangeMaintenanceFrequency,
  handleAddTask
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Activity size={16} className="mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('components')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center ${
            activeTab === 'components'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Settings size={16} className="mr-2" />
          Components
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center ${
            activeTab === 'maintenance'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Tool size={16} className="mr-2" />
          Maintenance
        </button>
        <button
          onClick={() => setActiveTab('risks')}
          className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center ${
            activeTab === 'risks'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <AlertTriangle size={16} className="mr-2" />
          Risks
        </button>
      </div>
      
      {/* Tab content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <MachineComponents 
              machine={machine}
              updatedMachine={updatedMachine}
              isEditing={isEditing}
              handleRemoveComponent={handleRemoveComponent}
            />
            
            {machine.maintenanceSchedule && (
              <MaintenanceSchedule
                machine={machine}
                updatedMachine={updatedMachine}
                isEditing={isEditing}
                handleToggleTaskComplete={handleToggleTaskComplete}
                handleChangeMaintenanceFrequency={handleChangeMaintenanceFrequency}
                handleAddTask={handleAddTask}
              />
            )}
            
            <RiskAssessment 
              machine={machine}
              updatedMachine={updatedMachine}
              isEditing={isEditing}
            />
          </div>
        )}
        
        {activeTab === 'components' && (
          <MachineComponents 
            machine={machine}
            updatedMachine={updatedMachine}
            isEditing={isEditing}
            handleRemoveComponent={handleRemoveComponent}
          />
        )}
        
        {activeTab === 'maintenance' && machine.maintenanceSchedule && (
          <MaintenanceSchedule
            machine={machine}
            updatedMachine={updatedMachine}
            isEditing={isEditing}
            handleToggleTaskComplete={handleToggleTaskComplete}
            handleChangeMaintenanceFrequency={handleChangeMaintenanceFrequency}
            handleAddTask={handleAddTask}
          />
        )}
        
        {activeTab === 'risks' && (
          <RiskAssessment 
            machine={machine}
            updatedMachine={updatedMachine}
            isEditing={isEditing}
          />
        )}
      </div>
    </div>
  );
};

export default MachineTabView;