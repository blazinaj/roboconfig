import React from 'react';
import { Machine } from '../../types';
import { useMachineDetails } from './hooks/useMachineDetails';
import AvatarSelector from './components/AvatarSelector';
import MachineHeader from './components/MachineHeader';
import MachineMetricsCard from './components/MachineMetricsCard';
import StatusCard from './components/StatusCard';
import MachineComponents from './components/MachineComponents';
import MaintenanceSchedule from './components/MaintenanceSchedule';
import RiskAssessment from './components/RiskAssessment';
import QuickActions from './components/QuickActions';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface MachineDetailProps {
  machine: Machine;
  onUpdateMachine: (machine: Machine) => Promise<void>;
}

const MachineDetail: React.FC<MachineDetailProps> = ({ 
  machine: initialMachine, 
  onUpdateMachine 
}) => {
  const {
    machine,
    updatedMachine,
    isEditing,
    showReport,
    showAIAssistant,
    saveLoading,
    error,
    success,
    avatarUrl,
    showAvatarSelector,
    expanded,
    setUpdatedMachine,
    setShowReport,
    setShowAIAssistant,
    setAvatarUrl,
    setShowAvatarSelector,
    toggleExpanded,
    toggleEditMode,
    handleRemoveComponent,
    handleAddTask,
    handleToggleTaskComplete,
    handleUpdateStatus,
    handleChangeMaintenanceFrequency,
    handleApplySuggestions,
    handleSaveChanges
  } = useMachineDetails(initialMachine.id);

  // Determine which machine data to display (original or updated version)
  const machineToDisplay = isEditing && updatedMachine ? updatedMachine : (machine || initialMachine);

  return (
    <div>
      {/* Header with machine information and actions */}
      <div className="mb-6 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Machine Avatar */}
          <AvatarSelector 
            machineType={machineToDisplay.type}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            showAvatarSelector={showAvatarSelector}
            setShowAvatarSelector={setShowAvatarSelector}
            isEditing={isEditing}
          />
          
          {/* Machine Info */}
          <div className="md:w-2/3 lg:w-3/4 p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="mb-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={updatedMachine?.name}
                      onChange={(e) => updatedMachine && setUpdatedMachine({
                        ...updatedMachine,
                        name: e.target.value
                      })}
                      className="text-2xl font-bold text-gray-900 border-b-2 border-blue-300 focus:border-blue-500 focus:outline-none bg-transparent px-2 py-1 w-full"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900">{machineToDisplay.name}</h1>
                  )}
                </div>
                
                {isEditing ? (
                  <textarea
                    value={updatedMachine?.description}
                    onChange={(e) => updatedMachine && setUpdatedMachine({
                      ...updatedMachine,
                      description: e.target.value
                    })}
                    rows={3}
                    className="w-full text-gray-600 border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-600 mb-4">{machineToDisplay.description}</p>
                )}
              </div>
            </div>
            
            {/* Performance metrics */}
            <MachineMetricsCard 
              machine={initialMachine}
              updatedMachine={updatedMachine}
              isEditing={isEditing}
            />
          </div>
        </div>
      </div>
      
      <MachineHeader 
        machine={initialMachine}
        isEditing={isEditing}
        toggleEditMode={toggleEditMode}
        setShowAIAssistant={setShowAIAssistant}
        setShowReport={setShowReport}
        updatedMachine={updatedMachine}
        setUpdatedMachine={setUpdatedMachine}
      />
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertTriangle size={18} className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center">
          <CheckCircle size={18} className="mr-2" />
          <span>{success}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="lg:w-2/3 space-y-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4">
              <div className="space-y-6">
                {/* Machine Components */}
                <MachineComponents 
                  machine={initialMachine}
                  updatedMachine={updatedMachine}
                  isEditing={isEditing}
                  handleRemoveComponent={handleRemoveComponent}
                />
                
                {/* Maintenance Schedule */}
                {machineToDisplay.maintenanceSchedule && (
                  <MaintenanceSchedule
                    machine={initialMachine}
                    updatedMachine={updatedMachine}
                    isEditing={isEditing}
                    handleToggleTaskComplete={handleToggleTaskComplete}
                    handleChangeMaintenanceFrequency={handleChangeMaintenanceFrequency}
                    handleAddTask={handleAddTask}
                  />
                )}
                
                {/* Risk Assessment */}
                <RiskAssessment 
                  machine={initialMachine}
                  updatedMachine={updatedMachine}
                  isEditing={isEditing}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:w-1/3">
          {showAIAssistant ? (
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-full border border-gray-200">
              {/* AI Assistant will be integrated here */}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Machine status card */}
              <StatusCard
                machine={initialMachine}
                updatedMachine={updatedMachine}
                isEditing={isEditing}
                expanded={expanded.status}
                onToggleExpand={() => toggleExpanded('status')}
                handleUpdateStatus={handleUpdateStatus}
              />
              
              {/* Quick actions card */}
              <QuickActions
                isEditing={isEditing}
                toggleEditMode={toggleEditMode}
                setShowReport={setShowReport}
                setShowAIAssistant={setShowAIAssistant}
                showAIAssistant={showAIAssistant}
                saveLoading={saveLoading}
                handleSaveChanges={handleSaveChanges}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MachineDetail;