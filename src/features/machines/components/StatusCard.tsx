import React from 'react';
import { Activity, ChevronDown, ChevronRight } from 'lucide-react';
import { Machine } from '../../../types';
import { getStatusIcon, getStatusColor } from '../utils/statusUtils';
import { formatDate } from '../utils/dateUtils';

interface StatusCardProps {
  machine: Machine;
  updatedMachine: Machine | null;
  isEditing: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  handleUpdateStatus: (status: Machine['status']) => void;
}

const StatusCard: React.FC<StatusCardProps> = ({
  machine,
  updatedMachine,
  isEditing,
  expanded,
  onToggleExpand,
  handleUpdateStatus
}) => {
  const machineToDisplay = isEditing && updatedMachine ? updatedMachine : machine;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div
        className="px-4 py-3 border-b border-gray-200 flex justify-between items-center cursor-pointer"
        onClick={onToggleExpand}
      >
        <h3 className="font-medium text-gray-800 flex items-center">
          <Activity size={18} className="mr-2 text-blue-600" />
          Machine Status
        </h3>
        <button>
          {expanded ? (
            <ChevronDown size={18} className="text-gray-500" />
          ) : (
            <ChevronRight size={18} className="text-gray-500" />
          )}
        </button>
      </div>
      
      {expanded && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">Current Status:</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${getStatusColor(machineToDisplay.status)}`}>
              {getStatusIcon(machineToDisplay.status)}
              {isEditing ? (
                <select
                  value={updatedMachine?.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as Machine['status'])}
                  className={`bg-transparent border-none focus:ring-0 pr-1 pl-0 ${getStatusColor(updatedMachine?.status || 'Inactive')}`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Error">Error</option>
                  <option value="Offline">Offline</option>
                </select>
              ) : (
                machineToDisplay.status
              )}
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">Created</span>
              <span className="text-gray-900">{formatDate(machineToDisplay.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">Last Updated</span>
              <span className="text-gray-900">{formatDate(machineToDisplay.updatedAt)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700">ID</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">{machineToDisplay.id.substring(0, 12)}...</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusCard;