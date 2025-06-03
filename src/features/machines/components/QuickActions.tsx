import React from 'react';
import { Zap, FileText, Bot, Save, Edit, ChevronRight, Loader2 } from 'lucide-react';

interface QuickActionsProps {
  isEditing: boolean;
  toggleEditMode: () => void;
  setShowReport: (show: boolean) => void;
  setShowAIAssistant: (show: boolean) => void;
  showAIAssistant: boolean;
  saveLoading: boolean;
  handleSaveChanges: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  isEditing,
  toggleEditMode,
  setShowReport,
  setShowAIAssistant,
  showAIAssistant,
  saveLoading,
  handleSaveChanges
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-medium text-gray-800 flex items-center">
          <Zap size={18} className="mr-2 text-blue-600" />
          Quick Actions
        </h3>
      </div>
      
      <div className="p-4">
        <div className="space-y-3">
          <button
            onClick={() => setShowReport(true)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center">
              <FileText className="mr-3 text-gray-600" size={18} />
              <span className="font-medium text-gray-800">Generate Report</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
          
          {!showAIAssistant && (
            <button
              onClick={() => setShowAIAssistant(true)}
              className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center">
                <Bot className="mr-3 text-blue-600" size={18} />
                <span className="font-medium text-blue-800">AI Assistant</span>
              </div>
              <ChevronRight size={16} className="text-blue-400" />
            </button>
          )}
          
          {isEditing ? (
            <button
              onClick={handleSaveChanges}
              disabled={saveLoading}
              className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left disabled:opacity-50"
            >
              <div className="flex items-center">
                {saveLoading ? (
                  <Loader2 className="mr-3 text-green-600 animate-spin\" size={18} />
                ) : (
                  <Save className="mr-3 text-green-600" size={18} />
                )}
                <span className="font-medium text-green-800">
                  {saveLoading ? 'Saving Changes...' : 'Save Changes'}
                </span>
              </div>
              <ChevronRight size={16} className="text-green-400" />
            </button>
          ) : (
            <button
              onClick={toggleEditMode}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center">
                <Edit className="mr-3 text-gray-600" size={18} />
                <span className="font-medium text-gray-800">Edit Machine</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;