import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Component, ComponentCategory, RiskFactor } from '../../types';
import { Bot, SendHorizontal, Loader2, X, RefreshCw, ZapIcon, HelpCircle, Check, Trash2 } from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';

interface AIComponentListAssistantProps {
  componentCategory: ComponentCategory;
  existingComponents: Component[];
  onAddComponents: (components: Component[]) => Promise<void>;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const EXAMPLE_QUERIES = {
  'Drive': [
    "Generate 3 high-torque servo motors for a robotic arm",
    "I need different types of motors for precision movement",
    "Create a set of actuators for an industrial application",
    "Make some drive components for heavy-duty applications"
  ],
  'Controller': [
    "Generate various controller units for factory automation",
    "I need different ECUs for different applications",
    "Create a set of industrial PLCs with different capabilities",
    "Make some controllers with various processing power"
  ],
  'Power': [
    "Generate various battery options for a mobile robot",
    "I need power supplies for different voltage requirements",
    "Create a set of battery packs with different capacities",
    "Make some power components for long-duration operation"
  ],
  'Communication': [
    "Generate various wireless communication modules",
    "I need different network interfaces for my robots",
    "Create a set of communication components with various ranges",
    "Make some communication modules with different protocols"
  ],
  'Software': [
    "Generate software components for robot control",
    "I need different software modules for various functions",
    "Create control system software components",
    "Make some vision processing software components"
  ],
  'Object Manipulation': [
    "Generate gripper designs for different payloads",
    "I need various robotic arms with different reaches",
    "Create end effectors for precision assembly tasks",
    "Make some manipulation components for handling fragile objects"
  ],
  'Sensors': [
    "Generate various sensor configurations for environmental awareness",
    "I need LiDAR, camera, and ultrasonic sensor components",
    "Create a set of vision systems with different specifications",
    "Make some sensor arrays for industrial monitoring"
  ],
  'Chassis': [
    "Generate various chassis options for a mobile robot",
    "I need frame components with different materials and strengths",
    "Create enclosure options with different protection ratings",
    "Make some structural components for various environments"
  ],
};

const AIComponentListAssistant: React.FC<AIComponentListAssistantProps> = ({
  componentCategory,
  existingComponents,
  onAddComponents,
  onClose
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I can help you generate multiple ${componentCategory} components at once. Describe what you need, and I'll create several options for you.`
    }
  ]);
  
  const [generatedComponents, setGeneratedComponents] = useState<Component[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [addingComponents, setAddingComponents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  
  const { session } = useSupabase();

  const toggleComponentSelection = (componentId: string) => {
    const newSelection = new Set(selectedComponents);
    if (newSelection.has(componentId)) {
      newSelection.delete(componentId);
    } else {
      newSelection.add(componentId);
    }
    setSelectedComponents(newSelection);
  };

  const selectAllComponents = () => {
    const allIds = generatedComponents
      .filter(c => !c.isExisting)
      .map(c => c.id);
    setSelectedComponents(new Set(allIds));
  };

  const deselectAllComponents = () => {
    setSelectedComponents(new Set());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userInput = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    
    setLoading(true);
    setError(null);
    
    try {
      if (!session) {
        throw new Error('You must be logged in to use the AI assistant');
      }

      // Call the Edge Function to generate components
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          message: userInput, 
          category: componentCategory,
          existingComponents
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate components');
      }

      const { components, explanation } = await response.json();
      
      setGeneratedComponents(components);
      
      // Pre-select all components that aren't duplicates
      setSelectedComponents(new Set(
        components
          .filter(c => !c.isExisting)
          .map(c => c.id)
      ));
      
      // Add AI response to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: explanation || `I've generated ${components.length} ${componentCategory.toLowerCase()} components based on your request. You can review them below and select which ones you want to add.${
          components.some(c => c.isExisting) ? 
          "\n\n⚠️ Some components have similar names to existing ones and are marked as potential duplicates." : 
          ""
        }`
      }]);
    } catch (err) {
      console.error('Error generating components:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I'm sorry, but I encountered an error: ${err instanceof Error ? err.message : 'An unknown error occurred'}. Please try again.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const addSelectedComponents = async () => {
    if (selectedComponents.size === 0) return;
    
    const componentsToAdd = generatedComponents.filter(c => selectedComponents.has(c.id));
    if (componentsToAdd.length === 0) return;
    
    setAddingComponents(true);
    
    try {
      await onAddComponents(componentsToAdd);
      
      // Add success message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Successfully added ${componentsToAdd.length} components. ${componentsToAdd.map(c => c.name).join(', ')}`
      }]);
      
      // Clear generated components and selections
      setGeneratedComponents([]);
      setSelectedComponents(new Set());
    } catch (err) {
      console.error('Error adding components:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while adding components');
    } finally {
      setAddingComponents(false);
    }
  };

  const clearMessages = () => {
    setMessages([{
      role: 'assistant',
      content: `Hi! I can help you generate multiple ${componentCategory} components at once. Describe what you need, and I'll create several options for you.`
    }]);
    setGeneratedComponents([]);
    setSelectedComponents(new Set());
    setError(null);
  };

  const handleExampleQuery = (query: string) => {
    setInput(query);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center">
        <div className="flex items-center">
          <Bot size={20} className="mr-2" />
          <h2 className="font-semibold">{componentCategory} Generator</h2>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1 text-white hover:bg-blue-800 rounded-full"
            title="Help"
          >
            <HelpCircle size={16} />
          </button>
          <button
            onClick={clearMessages}
            className="p-1 ml-1 text-white hover:bg-blue-800 rounded-full"
            title="Reset"
          >
            <RefreshCw size={16} />
          </button>
          <button 
            onClick={onClose}
            className="p-1 ml-1 text-white hover:bg-blue-800 rounded-full"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Help section */}
      {showHelp && (
        <div className="p-3 bg-blue-50 border-b border-blue-200">
          <h3 className="font-medium text-blue-800 mb-1.5">How to use this generator</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Describe the components you want to create in detail</li>
            <li>• Specify quantity, specifications, or special requirements</li>
            <li>• You can generate several components at once</li>
            <li>• Review generated components and select which to keep</li>
            <li>• Click "Add Selected Components" to save them to your library</li>
          </ul>
        </div>
      )}
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 hide-scrollbar">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`rounded-lg px-3 py-2 max-w-[85%] ${
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
            <div className="bg-gray-100 rounded-lg px-3 py-2 text-gray-800 flex items-center max-w-[85%]">
              <Loader2 size={16} className="animate-spin mr-2" />
              Generating components...
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-sm">
              {error}
            </div>
          </div>
        )}
        
        {/* Example queries */}
        {!loading && messages.length === 1 && (
          <div className="mb-2 pt-2">
            <p className="text-sm font-medium text-gray-500 mb-2">Try asking for:</p>
            <div className="grid grid-cols-1 gap-2">
              {EXAMPLE_QUERIES[componentCategory]?.map((query, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleQuery(query)}
                  className="text-left p-2 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-700 text-sm transition-colors"
                >
                  "{query}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Generated components */}
      {generatedComponents.length > 0 && (
        <div className="border-t border-gray-200 max-h-[40%] overflow-y-auto">
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div className="text-sm font-medium text-gray-700">
              Generated Components ({selectedComponents.size}/{generatedComponents.length})
            </div>
            <div className="flex space-x-2">
              <button
                onClick={selectAllComponents}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button
                onClick={deselectAllComponents}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Deselect All
              </button>
            </div>
          </div>
          
          <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
            {generatedComponents.map(component => (
              <div 
                key={component.id}
                className={`p-2 rounded border ${
                  component.isExisting
                    ? 'bg-yellow-50 border-yellow-200'
                    : selectedComponents.has(component.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900">
                        {component.name}
                        {component.isExisting && (
                          <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">
                            Potential Duplicate
                          </span>
                        )}
                      </h4>
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded">{component.category}</span>
                      <span className="mx-1">•</span>
                      <span>{component.type}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{component.description.substring(0, 100)}...</p>
                    <div className="mt-1 text-xs text-gray-500">
                      <span className="font-medium">Specs:</span> {Object.keys(component.specifications).length} items
                      {component.riskFactors.length > 0 && (
                        <span className="ml-2 text-yellow-600">
                          <span className="font-medium">Risks:</span> {component.riskFactors.length}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleComponentSelection(component.id)}
                    disabled={component.isExisting}
                    className={`ml-2 p-1.5 rounded-full ${
                      component.isExisting
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : selectedComponents.has(component.id)
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {selectedComponents.has(component.id) ? (
                      <Check size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={addSelectedComponents}
              disabled={selectedComponents.size === 0 || addingComponents}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {addingComponents ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Adding Components...
                </>
              ) : (
                <>
                  <ZapIcon size={16} className="mr-2" />
                  Add Selected Components ({selectedComponents.size})
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={session ? `Describe ${componentCategory.toLowerCase()} components you need...` : "Sign in to use the generator"}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={loading || !session || addingComponents}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !session || addingComponents}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

export default AIComponentListAssistant;