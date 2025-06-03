import React, { useState, useEffect } from 'react';
import { Bot, SendHorizontal, Loader2, X, RefreshCw, ZapIcon, HelpCircle } from 'lucide-react';
import { MachineFormData } from './MachineForm';
import { useMachineAI } from '../../hooks/useAIAssistant';
import { useSupabase } from '../../context/SupabaseContext';
import { v4 as uuidv4 } from 'uuid';

interface AIAssistantProps {
  formData: MachineFormData;
  setFormData: React.Dispatch<React.SetStateAction<MachineFormData>>;
  onClose: () => void;
}

const EXAMPLE_QUERIES = [
  "Build me a complete configuration for a warehouse robot",
  "I need a robot for welding applications",
  "Suggest components for a precision assembly robot",
  "Help me set up a collaborative robot for human-machine interaction",
  "What's a good configuration for an autonomous delivery vehicle?",
  "Design a drone for aerial surveillance"
];

const AIAssistant: React.FC<AIAssistantProps> = ({ formData, setFormData, onClose }) => {
  const [input, setInput] = useState('');
  const { session } = useSupabase();
  const [suggestedFormData, setSuggestedFormData] = useState<Partial<MachineFormData> | null>(null);
  const [showHelpTips, setShowHelpTips] = useState(true);
  
  const { 
    messages,
    setMessages,
    loading,
    error,
    sendMessage,
    clearMessages
  } = useMachineAI();

  useEffect(() => {
    // Add welcome message when component mounts
    setMessages([
      { 
        role: 'assistant', 
        content: 'Hello! I\'m your AI assistant for configuring robotic systems. I can suggest complete builds, individual components, or maintenance schedules based on your requirements. How can I help you today?' 
      }
    ]);
  }, [setMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userInput = input.trim();
    setInput('');

    await sendMessage(userInput, formData, (suggestions) => {
      // Process suggestions before setting them
      if (suggestions.components) {
        suggestions.components = suggestions.components.map(component => {
          // Ensure component has an id if it doesn't already have one
          if (!component.id) {
            component.id = uuidv4();
          }
          
          // Ensure risk factors have ids
          if (component.riskFactors) {
            component.riskFactors = component.riskFactors.map(risk => ({
              ...risk,
              id: risk.id || uuidv4()
            }));
          }
          
          return component;
        });
      }
      
      // Ensure maintenance tasks have ids
      if (suggestions.maintenanceSchedule?.tasks) {
        suggestions.maintenanceSchedule.tasks = suggestions.maintenanceSchedule.tasks.map(task => ({
          ...task,
          id: task.id || uuidv4()
        }));
      }
      
      setSuggestedFormData(suggestions);
    });
  };

  const handleExampleQuery = (query: string) => {
    setInput(query);
  };

  const applySuggestions = () => {
    if (suggestedFormData) {
      // Apply suggestions to form data, preserving existing data that isn't overwritten
      setFormData(prev => {
        const updatedData = { ...prev };
        
        // Apply basic fields if provided in suggestions
        if (suggestedFormData.name) updatedData.name = suggestedFormData.name;
        if (suggestedFormData.type) updatedData.type = suggestedFormData.type;
        if (suggestedFormData.description) updatedData.description = suggestedFormData.description;
        if (suggestedFormData.status) updatedData.status = suggestedFormData.status;
        
        // Apply maintenance schedule if provided
        if (suggestedFormData.maintenanceSchedule) {
          updatedData.maintenanceSchedule = {
            frequency: suggestedFormData.maintenanceSchedule.frequency || prev.maintenanceSchedule?.frequency || 'Monthly',
            tasks: [
              ...(prev.maintenanceSchedule?.tasks || []),
              ...(suggestedFormData.maintenanceSchedule.tasks || [])
            ]
          };
        }
        
        // Apply components if provided
        if (suggestedFormData.components) {
          // Merge with existing components, avoiding duplicates by ID
          const existingIds = new Set(prev.components.map(c => c.id));
          updatedData.components = [
            ...prev.components,
            ...suggestedFormData.components.filter(c => !existingIds.has(c.id))
          ];
        }
        
        return updatedData;
      });
      
      setSuggestedFormData(null);
      
      // Show confirmation that suggestions were applied
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'I\'ve applied the suggested configuration to your form. You can now review and make any necessary adjustments.'
        }
      ]);
    }
  };

  const renderSuggestionPreview = () => {
    if (!suggestedFormData) return null;
    
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 animate-fade-in">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <ZapIcon size={16} className="text-blue-600 mr-1" />
            <h3 className="text-sm font-medium text-blue-800">AI Configuration Suggestions</h3>
          </div>
          <button 
            onClick={() => setSuggestedFormData(null)}
            className="text-blue-500 hover:text-blue-700 p-1"
          >
            <X size={14} />
          </button>
        </div>
        
        <div className="space-y-2 text-xs mb-3 max-h-40 overflow-y-auto hide-scrollbar">
          {suggestedFormData.name && (
            <div>
              <span className="font-medium">Name:</span> {suggestedFormData.name}
            </div>
          )}
          
          {suggestedFormData.type && (
            <div>
              <span className="font-medium">Type:</span> {suggestedFormData.type}
            </div>
          )}
          
          {suggestedFormData.description && (
            <div>
              <span className="font-medium">Description:</span>{" "}
              <span className="line-clamp-1">{suggestedFormData.description}</span>
            </div>
          )}
          
          {suggestedFormData.components && (
            <div>
              <span className="font-medium">Components:</span> {suggestedFormData.components.length} suggested
              <ul className="mt-1 ml-3 space-y-0.5">
                {suggestedFormData.components.slice(0, 3).map((component, index) => (
                  <li key={index} className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-1 ${component.isExisting ? "bg-green-500" : "bg-blue-500"}`}></span>
                    <span className="truncate">{component.name}</span>
                    <span className="ml-1 text-gray-500">({component.isExisting ? "existing" : "new"})</span>
                  </li>
                ))}
                {suggestedFormData.components.length > 3 && (
                  <li className="text-gray-500 italic">...and {suggestedFormData.components.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
          
          {suggestedFormData.maintenanceSchedule && (
            <div>
              <span className="font-medium">Maintenance:</span> {suggestedFormData.maintenanceSchedule.frequency}
              {suggestedFormData.maintenanceSchedule.tasks && suggestedFormData.maintenanceSchedule.tasks.length > 0 && (
                <span> with {suggestedFormData.maintenanceSchedule.tasks.length} tasks</span>
              )}
            </div>
          )}
        </div>
        
        <button
          onClick={applySuggestions}
          className="w-full py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center transition-colors"
        >
          <ZapIcon size={14} className="mr-1" />
          Apply Configuration to Form
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bot size={20} />
          <h2 className="font-semibold">AI Configuration Assistant</h2>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setShowHelpTips(!showHelpTips)}
            className="text-white hover:bg-blue-800 rounded p-1 mr-1 transition-colors"
            title="Help"
          >
            <HelpCircle size={16} />
          </button>
          <button
            onClick={clearMessages}
            className="text-white hover:bg-blue-800 rounded p-1 mr-1 transition-colors"
            title="Reset conversation"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded p-1 transition-colors"
            title="Close assistant"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
        {showHelpTips && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm animate-fade-in">
            <h3 className="font-medium text-blue-800 mb-2">How to use the AI Assistant</h3>
            <ul className="space-y-1.5 text-blue-700">
              <li>• Describe your machine's <b>purpose and requirements</b></li>
              <li>• Ask for a <b>complete build</b> or specific component recommendations</li>
              <li>• The AI will use <b>existing components</b> when available</li>
              <li>• New components will be created with appropriate specifications</li>
              <li>• Maintenance schedules and risk assessments included</li>
            </ul>
          </div>
        )}

        {renderSuggestionPreview()}
        
        {messages.length <= 1 && !loading && (
          <div className="pb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Try asking for a build like:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {EXAMPLE_QUERIES.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleQuery(query)}
                  className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  "{query}"
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < message.content.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2.5 flex items-center max-w-[85%]">
              <Loader2 size={16} className="animate-spin mr-2 text-blue-600" />
              Designing your configuration...
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2.5 text-sm max-w-[85%]">
              Error: {error}
            </div>
          </div>
        )}
        
        {!session && (
          <div className="flex justify-center">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg px-4 py-2.5 text-sm max-w-[85%]">
              Please sign in to use the AI assistant
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={session ? "Describe the machine you want to build..." : "Sign in to use the AI assistant"}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={loading || !session}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !session}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <SendHorizontal size={18} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIAssistant;