import React, { useState } from 'react';
import { Bot, SendHorizontal, Loader2, X, RefreshCw, ZapIcon, HelpCircle } from 'lucide-react';
import { Component } from '../../types';
import { useSupabase } from '../../context/SupabaseContext';

interface AIComponentAssistantProps {
  componentCategory: string;
  currentData: Partial<Component>;
  onApplySuggestions: (suggestions: Partial<Component>) => void;
  onClose: () => void;
}

const EXAMPLE_QUERIES = {
  'Drive': [
    "I need a motor for a robotic arm",
    "Suggest specifications for a high-torque servo",
    "What's a good motor for precision movement?",
    "Help me configure a drive system for heavy loads"
  ],
  'Controller': [
    "I need an ECU for motor control",
    "Suggest a controller for a mobile robot",
    "What specifications should my industrial robot controller have?",
    "Help me configure a PLC for automation"
  ],
  'Power': [
    "I need a battery for a drone",
    "Suggest specifications for a long-lasting power source",
    "What's a good power supply for an industrial robot?",
    "Help me configure a rechargeable battery system"
  ],
  'Communication': [
    "I need a wireless communication module",
    "Suggest specifications for a robust network interface",
    "What's a good communication system for remote operation?",
    "Help me configure a secure data transmission system"
  ],
  'Software': [
    "I need software for motion control",
    "Suggest specifications for vision processing software",
    "What's a good software framework for robotics?",
    "Help me configure a robot operating system"
  ],
  'Object Manipulation': [
    "I need a gripper for small objects",
    "Suggest specifications for a robotic arm",
    "What's a good end effector for assembly tasks?",
    "Help me configure a manipulator for delicate operations"
  ],
  'Sensors': [
    "I need a vision system for object detection",
    "Suggest specifications for a LiDAR sensor",
    "What's a good proximity sensor for collision avoidance?",
    "Help me configure sensors for environment mapping"
  ],
  'Chassis': [
    "I need a frame for an outdoor robot",
    "Suggest specifications for a waterproof enclosure",
    "What's a good material for a lightweight robot frame?",
    "Help me configure a chassis for a heavy-duty robot"
  ]
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIComponentAssistant: React.FC<AIComponentAssistantProps> = ({ 
  componentCategory, 
  currentData, 
  onApplySuggestions, 
  onClose 
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `Hello! I'm your AI assistant for configuring ${componentCategory} components. Describe what you need, and I'll help you set it up with appropriate specifications.` 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedData, setSuggestedData] = useState<Partial<Component> | null>(null);
  const [showHelpTips, setShowHelpTips] = useState(false);
  
  const { session } = useSupabase();

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
      // Simulate AI response
      setTimeout(() => {
        let aiResponse = `I'll help you configure your ${componentCategory} component. `;
        const suggestions: Partial<Component> = {
          category: componentCategory as any
        };
        
        // Simple keyword-based response generation based on component category
        if (componentCategory === 'Drive') {
          if (userInput.toLowerCase().includes('arm') || userInput.toLowerCase().includes('precision')) {
            aiResponse += "For a robotic arm application requiring precision, I'd recommend a high-quality servo motor with good torque characteristics.";
            suggestions.name = "High-Precision Servo Motor";
            suggestions.type = "servos";
            suggestions.description = "Precision servo motor with high torque capacity ideal for robotic arms and precision applications";
            suggestions.specifications = {
              torque: "25 kg/cm",
              voltage: "12V",
              rotationSpeed: "60 RPM",
              weight: "250g",
              dimensions: "40 x 20 x 40 mm"
            };
          } else if (userInput.toLowerCase().includes('heavy') || userInput.toLowerCase().includes('load')) {
            aiResponse += "For heavy loads, I'd recommend a powerful brushless DC motor with high torque output.";
            suggestions.name = "Heavy-Duty Brushless Motor";
            suggestions.type = "motors";
            suggestions.description = "Powerful brushless DC motor designed for high-load applications with excellent efficiency";
            suggestions.specifications = {
              power: "500W",
              voltage: "24V",
              current: "20A",
              rpm: "5000 RPM",
              efficiency: "90%"
            };
          } else {
            aiResponse += "Based on your request, I'd suggest a standard DC motor with good all-around performance.";
            suggestions.name = "Standard DC Motor";
            suggestions.type = "motors";
            suggestions.description = "Versatile DC motor suitable for various robotic applications";
            suggestions.specifications = {
              power: "100W",
              voltage: "12V",
              current: "5A",
              rpm: "3000 RPM",
              efficiency: "85%"
            };
          }
        } else if (componentCategory === 'Power') {
          if (userInput.toLowerCase().includes('drone') || userInput.toLowerCase().includes('flying')) {
            aiResponse += "For drone applications, I'd recommend a high energy density LiPo battery pack with good power-to-weight ratio.";
            suggestions.name = "Lightweight LiPo Battery";
            suggestions.type = "batteries";
            suggestions.description = "High-capacity lithium polymer battery optimized for aerial applications with excellent power-to-weight ratio";
            suggestions.specifications = {
              capacity: "5000mAh",
              voltage: "11.1V",
              dischargeRate: "25C",
              weight: "350g",
              cellCount: "3S"
            };
          } else if (userInput.toLowerCase().includes('long') || userInput.toLowerCase().includes('lasting')) {
            aiResponse += "For long-lasting operation, I'd suggest a high-capacity Li-ion battery pack with integrated BMS.";
            suggestions.name = "Long-Duration Li-ion Battery";
            suggestions.type = "batteries";
            suggestions.description = "Extended runtime lithium-ion battery with battery management system for prolonged operations";
            suggestions.specifications = {
              capacity: "10000mAh",
              voltage: "14.8V",
              dischargeRate: "10C",
              weight: "800g",
              cellCount: "4S"
            };
          } else {
            aiResponse += "Based on your request, I'd recommend a standard LiPo battery that balances capacity and weight.";
            suggestions.name = "Standard LiPo Battery";
            suggestions.type = "batteries";
            suggestions.description = "General-purpose lithium polymer battery for robotic applications";
            suggestions.specifications = {
              capacity: "3000mAh",
              voltage: "7.4V",
              dischargeRate: "20C",
              weight: "200g",
              cellCount: "2S"
            };
          }
        } else if (componentCategory === 'Controller') {
          if (userInput.toLowerCase().includes('industrial') || userInput.toLowerCase().includes('plc')) {
            aiResponse += "For industrial automation, I recommend a robust PLC with multiple I/O capabilities.";
            suggestions.name = "Industrial PLC Controller";
            suggestions.type = "PLC";
            suggestions.description = "Programmable logic controller for industrial robotics and automation systems";
            suggestions.specifications = {
              processor: "Dual-core 1.5GHz",
              memory: "4GB RAM",
              interfaces: "Ethernet, RS-485, CAN",
              io: "32DI/32DO, 8AI/4AO",
              operatingVoltage: "24V"
            };
          } else if (userInput.toLowerCase().includes('motor') || userInput.toLowerCase().includes('drive')) {
            aiResponse += "For motor control applications, an ECU with dedicated motor drivers would be ideal.";
            suggestions.name = "Motor Control ECU";
            suggestions.type = "ECU";
            suggestions.description = "Specialized electronic control unit for precision motor control and coordination";
            suggestions.specifications = {
              processor: "ARM Cortex-M7 @ 400MHz",
              memory: "512KB SRAM",
              interfaces: "CAN, PWM, SPI, I2C",
              channels: "8 independent channels",
              operatingVoltage: "12V"
            };
          }
        } else if (componentCategory === 'Sensors') {
          if (userInput.toLowerCase().includes('vision') || userInput.toLowerCase().includes('object detection')) {
            aiResponse += "For vision-based applications, I recommend a high-resolution camera sensor with good low-light performance.";
            suggestions.name = "High-Resolution Camera Sensor";
            suggestions.type = "vision";
            suggestions.description = "Advanced camera module with machine vision capabilities for object detection and recognition";
            suggestions.specifications = {
              resolution: "4K (3840x2160)",
              frameRate: "60fps",
              sensorSize: "1/2.3\"",
              interface: "USB 3.0",
              fieldOfView: "120°"
            };
          } else if (userInput.toLowerCase().includes('lidar') || userInput.toLowerCase().includes('mapping')) {
            aiResponse += "For environment mapping and obstacle detection, a LiDAR sensor would be ideal.";
            suggestions.name = "360° LiDAR Sensor";
            suggestions.type = "lidar";
            suggestions.description = "Full 360-degree LiDAR scanner for detailed environmental mapping and navigation";
            suggestions.specifications = {
              range: "100m",
              accuracy: "±2cm",
              scanRate: "20Hz",
              points: "300,000 points/sec",
              interface: "Ethernet"
            };
          } else if (userInput.toLowerCase().includes('proximity') || userInput.toLowerCase().includes('collision')) {
            aiResponse += "For collision avoidance, I recommend a set of proximity sensors with appropriate range.";
            suggestions.name = "Ultrasonic Proximity Sensor";
            suggestions.type = "proximity";
            suggestions.description = "Reliable ultrasonic sensor for obstacle detection and collision avoidance";
            suggestions.specifications = {
              range: "5cm-4m",
              accuracy: "±1cm",
              updateRate: "20Hz",
              interface: "Analog/Digital",
              operatingVoltage: "5V"
            };
          }
        }

        // Add AI response to chat
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        
        // Set suggestions
        if (Object.keys(suggestions).length > 1) { // More than just category
          setSuggestedData(suggestions);
        }
        
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error getting AI response:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleExampleQuery = (query: string) => {
    setInput(query);
  };

  const applySuggestions = () => {
    if (suggestedData) {
      onApplySuggestions(suggestedData);
      setSuggestedData(null);
      
      // Add confirmation message
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'I\'ve applied the suggested specifications to your component form.' }
      ]);
    }
  };

  const clearMessages = () => {
    setMessages([
      { 
        role: 'assistant', 
        content: `Hello! I'm your AI assistant for configuring ${componentCategory} components. Describe what you need, and I'll help you set it up with appropriate specifications.` 
      }
    ]);
    setError(null);
    setSuggestedData(null);
  };

  const renderSuggestionPreview = () => {
    if (!suggestedData) return null;
    
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <ZapIcon size={16} className="text-blue-600 mr-1" />
            <h3 className="text-sm font-medium text-blue-800">AI Suggestions Available</h3>
          </div>
          <button 
            onClick={() => setSuggestedData(null)}
            className="text-blue-500 hover:text-blue-700"
          >
            <X size={14} />
          </button>
        </div>
        
        <div className="space-y-2 text-xs mb-3">
          {suggestedData.name && (
            <div>
              <span className="font-medium">Name:</span> {suggestedData.name}
            </div>
          )}
          
          {suggestedData.type && (
            <div>
              <span className="font-medium">Type:</span> {suggestedData.type}
            </div>
          )}
          
          {suggestedData.description && (
            <div>
              <span className="font-medium">Description:</span> {suggestedData.description.slice(0, 50)}...
            </div>
          )}
          
          {suggestedData.specifications && Object.keys(suggestedData.specifications).length > 0 && (
            <div>
              <span className="font-medium">Specifications:</span> {Object.keys(suggestedData.specifications).length} items
            </div>
          )}
        </div>
        
        <button
          onClick={applySuggestions}
          className="w-full py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center"
        >
          <ZapIcon size={14} className="mr-1" />
          Apply Suggestions to Form
        </button>
      </div>
    );
  };

  const exampleQueries = EXAMPLE_QUERIES[componentCategory] || [
    "What specifications should this component have?",
    "Suggest values for this component",
    "Help me configure this component",
    "What are the typical specifications for this type?"
  ];

  return (
    <div className="bg-white overflow-hidden h-full flex flex-col border-l border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bot size={20} />
          <h2 className="font-semibold">{componentCategory} Assistant</h2>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setShowHelpTips(!showHelpTips)}
            className="text-white hover:bg-blue-800 rounded p-1 mr-1"
            title="Help"
          >
            <HelpCircle size={16} />
          </button>
          <button
            onClick={clearMessages}
            className="text-white hover:bg-blue-800 rounded p-1 mr-1"
            title="Reset conversation"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded p-1"
            title="Close assistant"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showHelpTips && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
            <h3 className="font-medium text-blue-800 mb-2">How to use the AI Assistant</h3>
            <ul className="space-y-2 text-blue-700">
              <li>• Describe the component you need</li>
              <li>• Ask for specific recommendations on specifications</li>
              <li>• Inquire about best practices for this component type</li>
              <li>• Request suggestions based on your use case</li>
            </ul>
          </div>
        )}

        {renderSuggestionPreview()}
        
        {messages.length === 1 && !loading && (
          <div className="pb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Example queries:</h4>
            <div className="space-y-2">
              {exampleQueries.map((query, index) => (
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
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2 flex items-center">
              <Loader2 size={16} className="animate-spin mr-2" />
              Thinking...
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-600 rounded-lg px-4 py-2 text-sm">
              Error: {error}
            </div>
          </div>
        )}
        
        {!session && (
          <div className="flex justify-center">
            <div className="bg-yellow-50 text-yellow-700 rounded-lg px-4 py-2 text-sm">
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
            placeholder={session ? `Ask about ${componentCategory.toLowerCase()} components...` : "Sign in to use the AI assistant"}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={loading || !session}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !session}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

export default AIComponentAssistant;