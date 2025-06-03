import React, { useState } from 'react';
import { Activity, Settings, PenTool as Tool, AlertTriangle } from 'lucide-react';
import { Machine, MaintenanceTask } from '../../../types';
import MachineComponents from './MachineComponents';
import MaintenanceSchedule from './MaintenanceSchedule';
import RiskAssessment from './RiskAssessment';

interface MachineTabViewProps {
  machine: Machine;
  updatedMachine: Machine | null;
  isEditing: boolean;
  handleRemoveComponent: (id: string) => void;
  handleToggleTaskComplete: (taskId: string) => void;
  handleChangeMaintenanceFrequency: (frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly') => void;
  handleAddTask: (task: Partial<MaintenanceTask>) => void;
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
            {/* Show a summary of all sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-600 mb-1">Components</h4>
                <p className="text-2xl font-bold text-gray-900">{machine.components.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-600 mb-1">Maintenance Tasks</h4>
                <p className="text-2xl font-bold text-gray-900">{machine.maintenanceSchedule?.tasks.length || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-600 mb-1">Risk Factors</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {machine.components.reduce((sum, component) => sum + (component.riskFactors?.length || 0), 0)}
                </p>
              </div>
            </div>
            
            {/* Brief component list */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-medium text-gray-700">Key Components</h4>
                <button 
                  onClick={() => setActiveTab('components')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {machine.components.slice(0, 3).map(component => (
                  <div key={component.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{component.name}</span>
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {component.category}
                      </span>
                    </div>
                  </div>
                ))}
                {machine.components.length > 3 && (
                  <button 
                    onClick={() => setActiveTab('components')}
                    className="text-center w-full p-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    + {machine.components.length - 3} more components
                  </button>
                )}
              </div>
            </div>
            
            {/* Brief maintenance summary */}
            {machine.maintenanceSchedule && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between mb-3">
                  <h4 className="font-medium text-gray-700">Maintenance</h4>
                  <button 
                    onClick={() => setActiveTab('maintenance')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Schedule
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm text-gray-600">Next Maintenance:</span>
                    <span className="ml-2 font-medium">
                      {machine.maintenanceSchedule.nextDue 
                        ? new Date(machine.maintenanceSchedule.nextDue).toLocaleDateString() 
                        : 'Not scheduled'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {machine.maintenanceSchedule.frequency}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Brief risk summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-medium text-gray-700">Risk Assessment</h4>
                <button 
                  onClick={() => setActiveTab('risks')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All Risks
                </button>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Overall Risk Level</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Medium
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  This machine has {machine.components.reduce((sum, component) => 
                    sum + (component.riskFactors?.filter(rf => rf.severity >= 3)?.length || 0), 0
                  )} high severity risk factors that need attention.
                </p>
              </div>
            </div>
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