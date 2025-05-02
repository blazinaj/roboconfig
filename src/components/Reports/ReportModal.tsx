import React from 'react';
import { Machine } from '../../types';
import { X } from 'lucide-react';
import MachineReport from './MachineReport';

interface ReportModalProps {
  machine: Machine;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ machine, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full h-[90vh] max-w-5xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Machine Report - {machine.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="h-[calc(90vh-4rem)]">
          <MachineReport machine={machine} />
        </div>
      </div>
    </div>
  );
};

export default ReportModal;