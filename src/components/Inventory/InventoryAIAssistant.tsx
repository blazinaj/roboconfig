import React, { useState, useEffect } from 'react';
import { Bot, SendHorizontal, Loader2, X, RefreshCw, ZapIcon, HelpCircle, CheckCircle } from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { ComponentInventoryStatus, InventoryItem, Supplier, PurchaseOrder } from '../../types';

interface InventoryAIAssistantProps {
  inventoryItems: ComponentInventoryStatus[];
  onClose: () => void;
  onApplySuggestion: (suggestion: any) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ReorderSuggestion {
  type: 'reorder';
  items: {
    component_id: string;
    component_name: string;
    current_quantity: number;
    suggested_quantity: number;
    priority: 'high' | 'medium' | 'low';
  }[];
}

interface StockLevelSuggestion {
  type: 'stock_levels';
  adjustments: {
    component_id: string;
    component_name: string;
    current_minimum: number;
    suggested_minimum: number;
    rationale: string;
  }[];
}

const EXAMPLE_QUERIES = [
  "What items should I reorder soon?",
  "Analyze my current inventory health",
  "Suggest optimal stock levels for my components",
  "Which suppliers should I contact for restocking?",
  "Which components have the highest turnover rate?",
  "Generate a purchase order for low stock items"
];

const InventoryAIAssistant: React.FC<InventoryAIAssistantProps> = ({
  inventoryItems,
  onClose,
  onApplySuggestion
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI inventory assistant powered by GPT-4o. I can help you manage your inventory, analyze stock levels, suggest reordering, and optimize your inventory management. How can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSuggestion, setCurrentSuggestion] = useState<ReorderSuggestion | StockLevelSuggestion | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  
  const { session } = useSupabase();

  const sendMessage = async (message: string) => {
    if (!message.trim() || loading) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setInput('');
    setLoading(true);
    setError(null);
    
    try {
      // For demonstration purposes, we'll simulate the AI response
      // In a real app, you'd call an OpenAI API endpoint here
      await simulateAIResponse(message);
    } catch (err) {
      console.error('Error getting AI response:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const simulateAIResponse = async (userMessage: string) => {
    // Wait to simulate API call latency
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Analyze the message to determine intent
    if (lowerMessage.includes('reorder') || lowerMessage.includes('low stock')) {
      // Suggest reordering for low stock items
      const lowStockItems = inventoryItems.filter(item => 
        item.quantity <= item.minimum_quantity && item.quantity > 0
      );
      
      const outOfStockItems = inventoryItems.filter(item => 
        item.quantity === 0
      );
      
      const criticalItems = [...outOfStockItems, ...lowStockItems.slice(0, 5-outOfStockItems.length)];
      
      if (criticalItems.length > 0) {
        const reorderSuggestion: ReorderSuggestion = {
          type: 'reorder',
          items: criticalItems.map(item => ({
            component_id: item.component_id,
            component_name: item.component_name,
            current_quantity: item.quantity,
            suggested_quantity: item.minimum_quantity * 2,
            priority: item.quantity === 0 ? 'high' : (item.quantity <= item.minimum_quantity / 2) ? 'medium' : 'low'
          }))
        };
        
        setCurrentSuggestion(reorderSuggestion);
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I've analyzed your inventory and identified ${criticalItems.length} items that need to be reordered soon. ${outOfStockItems.length} items are completely out of stock and ${lowStockItems.length} are below minimum levels.\n\nI've prepared a reorder list with suggested quantities. Would you like to create a purchase order for these items?`
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I\'ve checked your inventory and everything appears to be at healthy stock levels. There are no items that need immediate reordering at this time.'
        }]);
      }
    }
    else if (lowerMessage.includes('stock level') || lowerMessage.includes('optimal')) {
      // Suggest optimized stock levels
      const itemsToOptimize = inventoryItems.filter(item => 
        item.minimum_quantity < 5 || item.quantity > item.minimum_quantity * 3
      ).slice(0, 5);
      
      if (itemsToOptimize.length > 0) {
        const stockSuggestion: StockLevelSuggestion = {
          type: 'stock_levels',
          adjustments: itemsToOptimize.map(item => {
            // Random algorithm to determine if minimum should increase or decrease
            // In a real app, this would be based on actual usage data, lead times, etc.
            const direction = item.quantity > item.minimum_quantity * 3 ? 'increase' : 'decrease';
            const newMinimum = direction === 'increase' 
              ? Math.ceil(item.minimum_quantity * 1.5) 
              : Math.max(1, Math.floor(item.minimum_quantity * 0.7));
              
            return {
              component_id: item.component_id,
              component_name: item.component_name,
              current_minimum: item.minimum_quantity,
              suggested_minimum: newMinimum,
              rationale: direction === 'increase' 
                ? 'Usage patterns indicate higher consumption than anticipated' 
                : 'Current minimum may be leading to excess inventory costs'
            };
          })
        };
        
        setCurrentSuggestion(stockSuggestion);
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I've analyzed your inventory minimum stock levels and found ${itemsToOptimize.length} components that could benefit from adjustment.\n\nSome minimums may be too low, causing frequent stockouts, while others may be unnecessarily high, tying up capital in excess inventory. I've prepared recommendations to optimize your stock levels based on historical usage patterns.`
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Based on my analysis, your current minimum stock levels appear to be well-optimized for your inventory needs. I don\'t see any items that require immediate adjustment to their minimum quantities.'
        }]);
      }
    }
    else if (lowerMessage.includes('analyz') || lowerMessage.includes('health')) {
      // General inventory health analysis
      const totalItems = inventoryItems.length;
      const lowStockItems = inventoryItems.filter(item => item.quantity <= item.minimum_quantity && item.quantity > 0).length;
      const outOfStockItems = inventoryItems.filter(item => item.quantity === 0).length;
      const healthyItems = totalItems - lowStockItems - outOfStockItems;
      
      const healthPercentage = Math.round((healthyItems / totalItems) * 100);
      
      let healthAssessment = 'excellent';
      if (healthPercentage < 70) healthAssessment = 'good';
      if (healthPercentage < 50) healthAssessment = 'concerning';
      if (healthPercentage < 30) healthAssessment = 'critical';
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I've analyzed your inventory health:\n\n• ${healthyItems} items (${healthPercentage}%) are at healthy stock levels\n• ${lowStockItems} items are below minimum stock levels\n• ${outOfStockItems} items are completely out of stock\n\nOverall inventory health is ${healthAssessment}. ${
          healthPercentage < 70 
            ? "I recommend creating purchase orders soon to replenish your low and out-of-stock items."
            : "Your inventory is in good shape, but you might want to check the few items that need attention."
        }`
      }]);
    }
    else if (lowerMessage.includes('purchase order') || lowerMessage.includes('generate')) {
      // Generate a purchase order suggestion
      const itemsToOrder = inventoryItems
        .filter(item => item.quantity <= item.minimum_quantity)
        .slice(0, 8);
        
      if (itemsToOrder.length > 0) {
        const reorderSuggestion: ReorderSuggestion = {
          type: 'reorder',
          items: itemsToOrder.map(item => ({
            component_id: item.component_id,
            component_name: item.component_name,
            current_quantity: item.quantity,
            suggested_quantity: Math.max(item.minimum_quantity * 2 - item.quantity, 1),
            priority: item.quantity === 0 ? 'high' : (item.quantity <= item.minimum_quantity / 2) ? 'medium' : 'low'
          }))
        };
        
        setCurrentSuggestion(reorderSuggestion);
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I've prepared a purchase order draft with ${itemsToOrder.length} items that need replenishing.\n\nThis order focuses on the most critical items first (out of stock and severely low stock). Would you like to review and create this purchase order now?`
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I don\'t see any items that need reordering at this time. All your inventory appears to be at healthy levels above their minimum thresholds.'
        }]);
      }
    }
    else if (lowerMessage.includes('turnover') || lowerMessage.includes('usage')) {
      // This would typically use real transaction history data
      // For this demo, we'll simulate some insights
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Based on simulated transaction history, here are your highest turnover components:\n\n1. Drive Motors - 12 units/month\n2. Controller Boards - 8 units/month\n3. Battery Packs - 7 units/month\n4. Sensors - 5 units/month\n\nConsider maintaining higher stock levels for these high-turnover items to prevent stockouts. I recommend increasing minimum stock levels for these components by 25-50% to ensure adequate coverage during supply chain delays.'
      }]);
    }
    else if (lowerMessage.includes('supplier') || lowerMessage.includes('contact')) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Based on your low stock items, I recommend contacting the following suppliers:\n\n1. TechSupply Inc - For electronic components\n2. RoboParts Ltd - For mechanical components\n3. SensorTech - For sensor components\n\nThese suppliers have historically provided the components you\'re running low on with the best combination of price, quality, and delivery speed based on your order history.'
      }]);
    }
    else {
      // Generic response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I can help you manage your inventory efficiently. Try asking me about:\n\n• Items you should reorder soon\n• Analyzing your inventory health\n• Suggesting optimal stock levels\n• Generating purchase orders\n• Identifying high-turnover components\n• Recommending suppliers for restocking'
      }]);
    }
  };

  const handleApplySuggestion = () => {
    if (!currentSuggestion) return;
    
    onApplySuggestion(currentSuggestion);
    setCurrentSuggestion(null);
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'I\'ve applied the suggestion to your inventory management. You can now review and make any final adjustments before proceeding.'
    }]);
  };

  const handleExampleQuery = (query: string) => {
    setInput(query);
  };

  const clearMessages = () => {
    setMessages([{
      role: 'assistant',
      content: 'Hello! I\'m your AI inventory assistant powered by GPT-4o. I can help you manage your inventory, analyze stock levels, suggest reordering, and optimize your inventory management. How can I assist you today?'
    }]);
    setCurrentSuggestion(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bot size={20} />
          <h2 className="font-semibold">Inventory Assistant</h2>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-white hover:bg-amber-800 rounded p-1 mr-1"
            title="Help"
          >
            <HelpCircle size={16} />
          </button>
          <button
            onClick={clearMessages}
            className="text-white hover:bg-amber-800 rounded p-1 mr-1"
            title="Reset conversation"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={onClose}
            className="text-white hover:bg-amber-800 rounded p-1"
            title="Close assistant"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
        {showHelp && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm">
            <h3 className="font-medium text-amber-800 mb-2">How to use the Inventory Assistant</h3>
            <ul className="space-y-2 text-amber-700">
              <li>• Ask about items that need reordering</li>
              <li>• Request analysis of your inventory health</li>
              <li>• Get suggestions for optimal stock levels</li>
              <li>• Generate purchase orders for low stock items</li>
              <li>• Identify high-turnover components</li>
              <li>• Find recommended suppliers for restocking</li>
            </ul>
          </div>
        )}

        {currentSuggestion && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 animate-fade-in">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <ZapIcon size={16} className="text-amber-600 mr-1" />
                <h3 className="text-sm font-medium text-amber-800">AI Suggestion Available</h3>
              </div>
              <button 
                onClick={() => setCurrentSuggestion(null)}
                className="text-amber-500 hover:text-amber-700 p-1"
              >
                <X size={14} />
              </button>
            </div>
            
            <div className="max-h-40 overflow-y-auto mb-3 hide-scrollbar">
              {currentSuggestion.type === 'reorder' && (
                <div>
                  <p className="text-xs text-amber-800 mb-2">Suggested items to reorder:</p>
                  <ul className="text-xs space-y-1">
                    {currentSuggestion.items.map((item, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-1 ${
                            item.priority === 'high' ? 'bg-red-500' : 
                            item.priority === 'medium' ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}></span>
                          {item.component_name}
                        </span>
                        <span>
                          {item.current_quantity} → {item.suggested_quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentSuggestion.type === 'stock_levels' && (
                <div>
                  <p className="text-xs text-amber-800 mb-2">Suggested minimum stock adjustments:</p>
                  <ul className="text-xs space-y-1">
                    {currentSuggestion.adjustments.map((item, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>{item.component_name}</span>
                        <span className={
                          item.suggested_minimum > item.current_minimum ? 'text-green-600' : 'text-blue-600'
                        }>
                          {item.current_minimum} → {item.suggested_minimum}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <button
              onClick={handleApplySuggestion}
              className="w-full py-1.5 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 flex items-center justify-center transition-colors"
            >
              <ZapIcon size={14} className="mr-1" />
              Apply Suggestion
            </button>
          </div>
        )}
        
        {messages.length === 1 && !loading && (
          <div className="pb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Try asking:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {EXAMPLE_QUERIES.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleQuery(query)}
                  className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md"
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
                  ? 'bg-amber-600 text-white'
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
              <Loader2 size={16} className="animate-spin mr-2 text-amber-600" />
              Analyzing inventory data...
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-red-700 text-sm max-w-[85%]">
              Error: {error}
            </div>
          </div>
        )}
        
        {!session && (
          <div className="flex justify-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5 text-yellow-700 text-sm max-w-[85%]">
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
            placeholder={session ? "Ask about inventory management..." : "Sign in to use the AI assistant"}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            disabled={loading || !session}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !session}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
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

export default InventoryAIAssistant;