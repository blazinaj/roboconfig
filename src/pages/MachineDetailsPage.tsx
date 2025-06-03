import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { AlertTriangle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { useMachineDetails } from '../features/machines/hooks/useMachineDetails';
import AvatarSelector from '../features/machines/components/AvatarSelector';
import MachineHeader from '../features/machines/components/MachineHeader';
import MachineMetricsCard from '../features/machines/components/MachineMetricsCard';
import StatusCard from '../features/machines/components/StatusCard';
import QuickActions from '../features/machines/components/QuickActions';
import MachineTabView from '../features/machines/components/MachineTabView';
import ReportModal from '../components/Reports/ReportModal';
import MachineAIAssistant from '../components/MachineDetails/MachineAIAssistant';

const MachineDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    machinesLoading,
    machinesError,
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
  } = useMachineDetails(id);

  if (machinesLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (machinesError || !machine) {
    return (
      <MainLayout>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Machine</h2>
            <p className="text-gray-600 mb-6">{machinesError || "Machine not found"}</p>
            <button
              onClick={() => navigate('/machines')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Machines
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Determine which machine data to display (original or updated version)
  const machineToDisplay = isEditing && updatedMachine ? updatedMachine : machine;

  return (
    <MainLayout>
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
                <div className="flex items-center mb-1">
                  <button
                    onClick={() => navigate('/machines')}
                    className="mr-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    title="Back to Machines"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  
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
              machine={machine}
              updatedMachine={updatedMachine}
              isEditing={isEditing}
            />
          </div>
        </div>
      </div>
      
      <MachineHeader 
        machine={machine}
        isEditing={isEditing}
        toggleEditMode={toggleEditMode}
        setShowAIAssistant={setShowAIAssistant}
        setShowReport={setShowReport}
        updatedMachine={updatedMachine}
        setUpdatedMachine={setUpdatedMachine}
        saveLoading={saveLoading}
        handleSaveChanges={handleSaveChanges}
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
          {/* Use the tabbed view component instead of directly rendering content */}
          <MachineTabView
            machine={machine}
            updatedMachine={updatedMachine}
            isEditing={isEditing}
            handleRemoveComponent={handleRemoveComponent}
            handleToggleTaskComplete={handleToggleTaskComplete}
            handleChangeMaintenanceFrequency={handleChangeMaintenanceFrequency}
            handleAddTask={handleAddTask}
          />
        </div>
        
        {/* Sidebar */}
        <div className="lg:w-1/3">
          {showAIAssistant ? (
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-full border border-gray-200">
              <MachineAIAssistant
                machine={isEditing && updatedMachine ? updatedMachine : machine}
                onApplySuggestions={handleApplySuggestions}
                onClose={() => setShowAIAssistant(false)}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Machine status card */}
              <StatusCard
                machine={machine}
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
      
      {/* Modals */}
      {showReport && (
        <ReportModal
          machine={machine}
          onClose={() => setShowReport(false)}
        />
      )}
    </MainLayout>
  );
};

export default MachineDetailsPage;