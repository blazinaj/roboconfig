import React from 'react';
import { ArrowLeft, Edit, Bot, FileText, Save, X, Loader2 } from 'lucide-react';
import { Machine } from '../../../types';
import { getStatusBadge } from '../utils/statusUtils';
import { getMaintenanceStatusBadge } from '../utils/maintenanceUtils';

interface MachineHeaderProps {
  machine: Machine;
  isEditing: boolean;
  toggleEditMode: () => void;
  setShowAIAssistant: (show: boolean) => void;
  setShowReport: (show: boolean) => void;
  updatedMachine: Machine | null;
  setUpdatedMachine: (machine: Machine | null) => void;
  saveLoading?: boolean;
  handleSaveChanges?: () => void;
}

const MachineHeader: React.FC<MachineHeaderProps> = ({
  machine,
  isEditing,
  toggleEditMode,
  setShowAIAssistant,
  setShowReport,
  updatedMachine,
  setUpdatedMachine,
  saveLoading = false,
  handleSaveChanges
}) => {
  const maintenanceStatus = getMaintenanceStatusBadge(machine);
  const machineToDisplay = isEditing && updatedMachine ? updatedMachine : machine;

  return (
    <div className="mb-6">
      <button
        onClick={() => window.history.back()}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft size={18} className="mr-1" />
        <span className="text-sm">Back to Machines</span>
      </button>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{machine.name}</h1>
          <p className="text-gray-600 mt-1">{machine.type}</p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={toggleEditMode}
                className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              >
                <X size={16} className="mr-1.5" />
                <span className="text-sm">Cancel</span>
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saveLoading}
                className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {saveLoading ? (
                  <>
                    <Loader2 size={16} className="mr-1.5 animate-spin" />
                    <span className="text-sm">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-1.5" />
                    <span className="text-sm">Save Changes</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleEditMode}
                className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              >
                <Edit size={16} className="mr-1.5" />
                <span className="text-sm">Edit Machine</span>
              </button>
              <button
                onClick={() => setShowAIAssistant(true)}
                className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              >
                <Bot size={16} className="mr-1.5" />
                <span className="text-sm">AI Assistant</span>
              </button>
              <button
                onClick={() => setShowReport(true)}
                className="flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded hover:bg-green-200"
              >
                <FileText size={16} className="mr-1.5" />
                <span className="text-sm">Report</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex space-x-3 mt-4">
        {getStatusBadge(machine.status)}
        {maintenanceStatus && maintenanceStatus}
      </div>
    </div>
  );
};

export default MachineHeader;