import React, { useState, useEffect } from 'react';
import { Bot, SendHorizontal, Loader2, X, RefreshCw, ZapIcon, HelpCircle } from 'lucide-react';
import { Machine, Component, MaintenanceTask, RiskFactor } from '../../types';
import { useSupabase } from '../../context/SupabaseContext';
import { v4 as uuidv4 } from 'uuid';

interface MachineAIAssistantProps {
  machine: Machine;
  onApplySuggestions: (suggestions: Partial<Machine>) => void;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const EXAMPLE_QUERIES = [
  "How can I improve this machine's efficiency?",
  "Suggest components to enhance performance",
  "What maintenance should I perform on this type of robot?",
  "Recommend safety improvements for this configuration",
  "Build me a complete configuration for this machine type",
  "How can I optimize this machine for better reliability?"
];

// Helper function to generate machine suggestions based on current state
const generateAISuggestions = (
  message: string, 
  machine: Machine
): Promise<{ 
  message: string, 
  suggestions?: Partial<Machine> 
}> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Analyze the user's message to determine intent
      const lowerMessage = message.toLowerCase();
      
      // Different suggestion types based on user intent
      if (lowerMessage.includes('improve') || lowerMessage.includes('efficien') || lowerMessage.includes('optimi')) {
        resolve(generateEfficiencySuggestions(machine));
      } 
      else if (lowerMessage.includes('component') || lowerMessage.includes('enhance') || lowerMessage.includes('performance')) {
        resolve(generateComponentSuggestions(machine));
      }
      else if (lowerMessage.includes('maintenance') || lowerMessage.includes('schedule') || lowerMessage.includes('service')) {
        resolve(generateMaintenanceSuggestions(machine));
      }
      else if (lowerMessage.includes('safety') || lowerMessage.includes('risk') || lowerMessage.includes('protect')) {
        resolve(generateSafetySuggestions(machine));
      }
      else if (lowerMessage.includes('complete') || lowerMessage.includes('configuration') || lowerMessage.includes('build')) {
        resolve(generateCompleteBuildSuggestions(machine));
      }
      else {
        // Generic response when no specific intent is detected
        resolve({ 
          message: `I've analyzed your ${machine.type} configuration. What specific aspect would you like me to help with? You can ask about efficiency improvements, component suggestions, maintenance schedules, or safety considerations.`
        });
      }
    }, 1000);
  });
};

// Generate efficiency-focused suggestions
const generateEfficiencySuggestions = (machine: Machine) => {
  const missingComponents = [];
  const hasController = machine.components.some(c => c.category === 'Controller');
  const hasPower = machine.components.some(c => c.category === 'Power');
  const hasSensors = machine.components.some(c => c.category === 'Sensors');
  
  if (!hasController) missingComponents.push('Controller');
  if (!hasPower) missingComponents.push('Power');
  if (!hasSensors) missingComponents.push('Sensors');
  
  // Suggestions based on machine type
  const suggestions: Partial<Machine> = {
    status: machine.status === 'Inactive' ? 'Active' : machine.status,
    components: []
  };
  
  // Add suggested components based on machine type and missing components
  if (machine.type === 'Industrial Robot' && !hasController) {
    suggestions.components?.push({
      id: uuidv4(),
      name: "Advanced PLC Controller",
      category: "Controller",
      type: "PLC",
      description: "Industrial-grade programmable logic controller with high processing capabilities",
      specifications: {
        processor: "Dual-core 1.5GHz",
        memory: "4GB RAM",
        interfaces: "EtherCAT, CAN, Modbus",
        operatingVoltage: "24V",
        power: "45W"
      },
      riskFactors: [],
      isExisting: false
    });
  }
  
  if (machine.type === 'Mobile Robot' && !hasSensors) {
    suggestions.components?.push({
      id: uuidv4(),
      name: "LiDAR Navigation System",
      category: "Sensors",
      type: "LiDAR",
      description: "High-precision LiDAR for environment mapping and obstacle detection",
      specifications: {
        range: "20m",
        resolution: "0.1°",
        scanRate: "20Hz",
        power: "12W",
        weight: "450g"
      },
      riskFactors: [],
      isExisting: false
    });
  }
  
  // Create a response message based on the analysis
  let responseMessage = `I've analyzed your ${machine.type} for efficiency improvements.\n\n`;
  
  if (missingComponents.length > 0) {
    responseMessage += `To improve efficiency, I recommend adding these critical components: ${missingComponents.join(', ')}.\n\n`;
  } else {
    responseMessage += "Your machine has all the essential components for basic operation.\n\n";
  }
  
  responseMessage += "I can suggest specific efficiency optimizations based on your machine type:\n";
  
  if (machine.type === 'Industrial Robot') {
    responseMessage += "• Add an advanced PLC controller for better precision\n";
    responseMessage += "• Upgrade power components for more stable operation\n";
    responseMessage += "• Consider adding real-time monitoring sensors\n";
  } else if (machine.type === 'Mobile Robot') {
    responseMessage += "• Add a LiDAR system for better navigation\n";
    responseMessage += "• Upgrade to more efficient drive motors\n";
    responseMessage += "• Add a battery management system\n";
  } else {
    responseMessage += "• Ensure proper component compatibility\n";
    responseMessage += "• Add redundant safety systems\n";
    responseMessage += "• Consider regular maintenance scheduling\n";
  }
  
  return {
    message: responseMessage,
    suggestions: suggestions.components && suggestions.components.length > 0 ? suggestions : undefined
  };
};

// Generate component-focused suggestions
const generateComponentSuggestions = (machine: Machine) => {
  // Find gaps in the component configuration
  const hasDrive = machine.components.some(c => c.category === 'Drive');
  const hasController = machine.components.some(c => c.category === 'Controller');
  const hasPower = machine.components.some(c => c.category === 'Power');
  const hasSensors = machine.components.some(c => c.category === 'Sensors');
  const hasSoftware = machine.components.some(c => c.category === 'Software');
  
  const suggestions: Partial<Machine> = {
    components: []
  };
  
  // Add components based on what's missing
  if (!hasDrive) {
    suggestions.components?.push({
      id: uuidv4(),
      name: "High-Torque Servo Motor",
      category: "Drive",
      type: "servos",
      description: "Precision servo motor with high torque capacity for accurate positioning",
      specifications: {
        torque: "25 kg/cm",
        voltage: "12V",
        rotationSpeed: "60 RPM",
        weight: "250g",
        dimensions: "40 x 20 x 40 mm"
      },
      riskFactors: [],
      isExisting: false
    });
  }
  
  if (!hasController) {
    suggestions.components?.push({
      id: uuidv4(),
      name: "Central Control Unit",
      category: "Controller",
      type: "ECU",
      description: "Advanced electronic control unit for coordinating machine functions",
      specifications: {
        processor: "ARM Cortex-M7",
        memory: "512KB",
        interfaces: "CAN, SPI, I2C, UART",
        operatingVoltage: "5V",
        power: "5W"
      },
      riskFactors: [],
      isExisting: false
    });
  }
  
  if (!hasPower) {
    suggestions.components?.push({
      id: uuidv4(),
      name: "High-Capacity LiPo Battery",
      category: "Power",
      type: "batteries",
      description: "Lithium polymer battery pack with high energy density and discharge rate",
      specifications: {
        capacity: "5000mAh",
        voltage: "11.1V",
        dischargeRate: "20C",
        weight: "350g",
        cellCount: "3S"
      },
      riskFactors: [
        {
          id: uuidv4(),
          name: "Thermal Runaway",
          severity: 4,
          probability: 1,
          description: "Risk of battery overheating under extreme conditions or damage"
        }
      ],
      isExisting: false
    });
  }
  
  if (!hasSensors) {
    suggestions.components?.push({
      id: uuidv4(),
      name: "Environment Sensor Array",
      category: "Sensors",
      type: "vision",
      description: "Multi-sensor array for environment monitoring and obstacle detection",
      specifications: {
        resolution: "1080p",
        fieldOfView: "120°",
        range: "0.1-10m",
        interface: "USB 3.0",
        power: "3.5W"
      },
      riskFactors: [],
      isExisting: false
    });
  }
  
  let responseMessage = `I've analyzed your ${machine.type} and identified opportunities to enhance its capabilities with additional components.\n\n`;
  
  if (!hasDrive) responseMessage += "• Your machine lacks drive components. I recommend adding servo motors or actuators for motion control.\n";
  if (!hasController) responseMessage += "• A controller unit would greatly improve coordination of all components.\n";
  if (!hasPower) responseMessage += "• Adding a reliable power source is essential for consistent operation.\n";
  if (!hasSensors) responseMessage += "• Sensor components would allow your machine to perceive and respond to its environment.\n";
  if (!hasSoftware) responseMessage += "• Software components are recommended for advanced control and functionality.\n";
  
  responseMessage += "\nI've prepared component suggestions that would be compatible with your current configuration.";
  
  return {
    message: responseMessage,
    suggestions
  };
};

// Generate maintenance-focused suggestions
const generateMaintenanceSuggestions = (machine: Machine) => {
  // Create appropriate maintenance schedule based on machine type
  const suggestions: Partial<Machine> = {};
  
  const nextDue = new Date();
  nextDue.setMonth(nextDue.getMonth() + 1);
  
  let frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly' = 'Monthly';
  const tasks: Partial<MaintenanceTask>[] = [];
  
  // Different maintenance schedules based on machine type
  if (machine.type === 'Industrial Robot') {
    frequency = 'Monthly';
    tasks.push(
      {
        id: uuidv4(),
        name: "Lubricate Moving Joints",
        description: "Apply appropriate lubricant to all mechanical joints and moving parts",
        priority: 'Medium',
        estimatedDuration: 45,
        completed: false
      },
      {
        id: uuidv4(),
        name: "Check Electrical Connections",
        description: "Inspect and verify all electrical connections and wiring for wear or damage",
        priority: 'High',
        estimatedDuration: 30,
        completed: false
      },
      {
        id: uuidv4(),
        name: "Calibrate Positioning System",
        description: "Perform full calibration of positioning and movement systems",
        priority: 'Critical',
        estimatedDuration: 60,
        completed: false
      }
    );
  } else if (machine.type === 'Mobile Robot') {
    frequency = 'Weekly';
    tasks.push(
      {
        id: uuidv4(),
        name: "Inspect Wheels/Tracks",
        description: "Check wheels or tracks for wear, damage, and proper tension",
        priority: 'High',
        estimatedDuration: 20,
        completed: false
      },
      {
        id: uuidv4(),
        name: "Battery Health Check",
        description: "Test battery capacity and charging functionality",
        priority: 'Critical',
        estimatedDuration: 30,
        completed: false
      },
      {
        id: uuidv4(),
        name: "Clean Sensor Arrays",
        description: "Remove dust and debris from all sensors and cameras",
        priority: 'Medium',
        estimatedDuration: 15,
        completed: false
      }
    );
  } else if (machine.type === 'Drone') {
    frequency = 'Weekly';
    tasks.push(
      {
        id: uuidv4(),
        name: "Propeller Inspection",
        description: "Check propellers for balance, chips, or cracks",
        priority: 'Critical',
        estimatedDuration: 15,
        completed: false
      },
      {
        id: uuidv4(),
        name: "Motor Testing",
        description: "Run motors to check for unusual sounds or vibrations",
        priority: 'High',
        estimatedDuration: 20,
        completed: false
      },
      {
        id: uuidv4(),
        name: "Frame Inspection",
        description: "Examine frame for cracks, loose parts, or damage",
        priority: 'Medium',
        estimatedDuration: 10,
        completed: false
      }
    );
  } else {
    // Default for other types
    frequency = 'Monthly';
    tasks.push(
      {
        id: uuidv4(),
        name: "General System Inspection",
        description: "Complete visual and functional inspection of all systems",
        priority: 'High',
        estimatedDuration: 45,
        completed: false
      },
      {
        id: uuidv4(),
        name: "Software Update Check",
        description: "Verify all software and firmware is up to date",
        priority: 'Medium',
        estimatedDuration: 30,
        completed: false
      },
      {
        id: uuidv4(),
        name: "Safety System Test",
        description: "Test all safety mechanisms and emergency stops",
        priority: 'Critical',
        estimatedDuration: 20,
        completed: false
      }
    );
  }
  
  suggestions.maintenanceSchedule = {
    frequency,
    tasks: tasks as MaintenanceTask[],
    nextDue
  };
  
  let responseMessage = `Based on your ${machine.type}, I've developed a recommended maintenance schedule to ensure optimal performance and longevity.\n\n`;
  
  responseMessage += `For this type of machine, I recommend a ${frequency.toLowerCase()} maintenance interval. Here are the key maintenance tasks I suggest:\n\n`;
  
  tasks.forEach(task => {
    responseMessage += `• ${task.name} (${task.priority} priority, ${task.estimatedDuration} min): ${task.description}\n`;
  });
  
  responseMessage += "\nImplementing this maintenance schedule will help prevent unexpected downtime and extend the operational life of your machine.";
  
  return {
    message: responseMessage,
    suggestions
  };
};

// Generate safety-focused suggestions
const generateSafetySuggestions = (machine: Machine) => {
  // Analyze components for potential safety issues
  const highRiskComponents = machine.components.filter(c => 
    c.riskFactors && c.riskFactors.some(rf => rf.severity >= 4)
  );
  
  const componentSuggestions: Component[] = [];
  const updatedComponents: Component[] = [];
  
  // Add safety components based on machine type
  if (machine.type === 'Industrial Robot' && 
      !machine.components.some(c => c.name.toLowerCase().includes('emergency stop'))) {
    componentSuggestions.push({
      id: uuidv4(),
      name: "Emergency Stop System",
      category: "Safety",
      type: "emergency stop",
      description: "Redundant emergency stop system with physical and wireless triggers",
      specifications: {
        activationTime: "<100ms",
        redundancy: "Triple",
        wireLength: "5m",
        power: "2W",
        weight: "350g"
      },
      riskFactors: [],
      isExisting: false
    });
  }
  
  // Add risk factors to existing components that might need them
  machine.components.forEach(component => {
    if (component.category === 'Drive' && 
        (!component.riskFactors || !component.riskFactors.some(rf => rf.name.includes('Pinch')))) {
      const updatedComponent = {...component};
      if (!updatedComponent.riskFactors) updatedComponent.riskFactors = [];
      updatedComponent.riskFactors.push({
        id: uuidv4(),
        name: "Pinch Hazard",
        severity: 4,
        probability: 3,
        description: "Moving parts create potential for finger or hand injuries if not properly guarded"
      });
      updatedComponents.push(updatedComponent);
    }
    
    if (component.category === 'Power' && 
        (!component.riskFactors || !component.riskFactors.some(rf => rf.name.includes('Electrical')))) {
      const updatedComponent = {...component};
      if (!updatedComponent.riskFactors) updatedComponent.riskFactors = [];
      updatedComponent.riskFactors.push({
        id: uuidv4(),
        name: "Electrical Shock Hazard",
        severity: 5,
        probability: 2,
        description: "High voltage components present risk of electrical shock during maintenance"
      });
      updatedComponents.push(updatedComponent);
    }
  });
  
  const suggestions: Partial<Machine> = {};
  if (componentSuggestions.length > 0) {
    suggestions.components = componentSuggestions;
  }
  
  let responseMessage = `I've performed a safety analysis on your ${machine.type} and identified the following safety considerations:\n\n`;
  
  if (highRiskComponents.length > 0) {
    responseMessage += "High-risk components identified:\n";
    highRiskComponents.forEach(component => {
      responseMessage += `• ${component.name} - Risk factors include: ${component.riskFactors
        .filter(rf => rf.severity >= 4)
        .map(rf => rf.name)
        .join(', ')}\n`;
    });
    responseMessage += "\n";
  }
  
  if (updatedComponents.length > 0) {
    responseMessage += "I've identified additional risk factors for your existing components that should be considered:\n";
    updatedComponents.forEach(component => {
      const newRisks = component.riskFactors.filter(rf => 
        !machine.components
          .find(c => c.id === component.id)?.riskFactors
          .some(existingRf => existingRf.name === rf.name)
      );
      
      if (newRisks.length > 0) {
        responseMessage += `• ${component.name}: ${newRisks.map(rf => rf.name).join(', ')}\n`;
      }
    });
    responseMessage += "\n";
  }
  
  if (componentSuggestions.length > 0) {
    responseMessage += "I recommend adding these safety components:\n";
    componentSuggestions.forEach(component => {
      responseMessage += `• ${component.name}: ${component.description}\n`;
    });
  }
  
  responseMessage += "\nImplementing these safety measures will help reduce operational risks and improve overall system reliability.";
  
  return {
    message: responseMessage,
    suggestions
  };
};

// Generate a complete build suggestion for the given machine type
const generateCompleteBuildSuggestions = (machine: Machine) => {
  const suggestions: Partial<Machine> = {
    components: [],
    status: 'Active',
    description: machine.description || getDefaultDescription(machine.type)
  };
  
  // Core components every machine should have
  if (!machine.components.some(c => c.category === 'Controller')) {
    suggestions.components?.push({
      id: uuidv4(),
      name: `${machine.type} Control System`,
      category: "Controller",
      type: "ECU",
      description: "Central control unit optimized for this machine type",
      specifications: {
        processor: "ARM Cortex-M7 @ 400MHz",
        memory: "1MB SRAM",
        interfaces: "CAN, SPI, I2C, UART, Ethernet",
        power: "8W",
        weight: "320g"
      },
      riskFactors: [
        {
          id: uuidv4(),
          name: "Software Failure",
          severity: 3,
          probability: 2,
          description: "Potential for software bugs or crashes affecting machine operation"
        }
      ],
      isExisting: false
    });
  }
  
  if (!machine.components.some(c => c.category === 'Power')) {
    suggestions.components?.push({
      id: uuidv4(),
      name: "High-Reliability Power System",
      category: "Power",
      type: "power supplies",
      description: "Power supply designed for continuous industrial operation",
      specifications: {
        outputVoltage: "24V DC",
        current: "20A",
        power: "480W",
        efficiency: "92%",
        weight: "1.2kg"
      },
      riskFactors: [
        {
          id: uuidv4(),
          name: "Overheating",
          severity: 3,
          probability: 2,
          description: "Risk of overheating during extended operation in high ambient temperatures"
        }
      ],
      isExisting: false
    });
  }
  
  // Machine-specific components
  if (machine.type === 'Industrial Robot') {
    if (!machine.components.some(c => c.category === 'Object Manipulation')) {
      suggestions.components?.push({
        id: uuidv4(),
        name: "Precision Robotic Arm",
        category: "Object Manipulation",
        type: "arm",
        description: "6-axis articulated arm with high precision positioning",
        specifications: {
          payload: "10kg",
          reach: "1.2m",
          repeatability: "±0.02mm",
          weight: "18kg",
          power: "220W"
        },
        riskFactors: [
          {
            id: uuidv4(),
            name: "Crushing Hazard",
            severity: 5,
            probability: 2,
            description: "Risk of serious injury from arm movement in shared workspace"
          }
        ],
        isExisting: false
      });
    }
    
    if (!machine.components.some(c => c.category === 'Software')) {
      suggestions.components?.push({
        id: uuidv4(),
        name: "Industrial Motion Control Software",
        category: "Software",
        type: "control system",
        description: "Advanced software for precise robotic arm coordination and motion planning",
        specifications: {
          platform: "Real-time OS",
          interfaces: "ROS, OPC-UA",
          updateRate: "1000Hz",
          safetyFeatures: "Collision detection, workspace limits"
        },
        riskFactors: [],
        isExisting: false
      });
    }
  } 
  else if (machine.type === 'Mobile Robot') {
    if (!machine.components.some(c => c.category === 'Drive')) {
      suggestions.components?.push({
        id: uuidv4(),
        name: "Differential Drive System",
        category: "Drive",
        type: "motors",
        description: "High-torque dual motor system with encoders for precise movement",
        specifications: {
          power: "2 x 120W",
          torque: "3.5 Nm",
          speed: "2.5 m/s",
          encoders: "1024 PPR",
          weight: "1.8kg"
        },
        riskFactors: [],
        isExisting: false
      });
    }
    
    if (!machine.components.some(c => c.category === 'Sensors')) {
      suggestions.components?.push({
        id: uuidv4(),
        name: "Navigation Sensor Suite",
        category: "Sensors",
        type: "LiDAR",
        description: "Comprehensive sensor package for autonomous navigation and obstacle avoidance",
        specifications: {
          lidarRange: "25m",
          cameras: "Stereo RGB",
          imu: "9-axis",
          ultrasonicSensors: "6x",
          power: "15W"
        },
        riskFactors: [
          {
            id: uuidv4(),
            name: "Navigation Error",
            severity: 3,
            probability: 2,
            description: "Potential for navigation errors in complex or changing environments"
          }
        ],
        isExisting: false
      });
    }
  }
  else if (machine.type === 'Drone') {
    if (!machine.components.some(c => c.category === 'Drive')) {
      suggestions.components?.push({
        id: uuidv4(),
        name: "Quadcopter Propulsion System",
        category: "Drive",
        type: "motors",
        description: "Brushless motor system with electronic speed controllers",
        specifications: {
          motors: "4x 2300KV",
          propellers: "10-inch",
          thrust: "4x 1.2kg",
          power: "4x 180W",
          weight: "720g"
        },
        riskFactors: [
          {
            id: uuidv4(),
            name: "Propeller Injury",
            severity: 4,
            probability: 2,
            description: "High-speed propellers can cause serious injuries if contacted"
          }
        ],
        isExisting: false
      });
    }
    
    if (!machine.components.some(c => c.category === 'Sensors')) {
      suggestions.components?.push({
        id: uuidv4(),
        name: "Flight Control Sensors",
        category: "Sensors",
        type: "IMU",
        description: "Comprehensive sensor array for flight stabilization and navigation",
        specifications: {
          imu: "3-axis gyro, accel, mag",
          barometer: "10cm resolution",
          gps: "RTK-capable",
          power: "3.2W",
          weight: "65g"
        },
        riskFactors: [],
        isExisting: false
      });
    }
  }
  
  // Add maintenance schedule
  const nextDue = new Date();
  nextDue.setMonth(nextDue.getMonth() + 1);
  
  suggestions.maintenanceSchedule = {
    frequency: 'Monthly',
    tasks: [
      {
        id: uuidv4(),
        name: "General Inspection",
        description: "Complete visual inspection of all systems and components",
        priority: 'Medium',
        estimatedDuration: 30,
        completed: false
      },
      {
        id: uuidv4(),
        name: "Safety Systems Check",
        description: "Verify all safety mechanisms are functioning correctly",
        priority: 'High',
        estimatedDuration: 20,
        completed: false
      },
      {
        id: uuidv4(),
        name: "Software/Firmware Update",
        description: "Check for and apply any available updates",
        priority: 'Medium',
        estimatedDuration: 45,
        completed: false
      }
    ],
    nextDue
  };
  
  let responseMessage = `I've designed a complete configuration for your ${machine.type}. This setup includes all essential components and appropriate maintenance schedules.\n\n`;
  
  responseMessage += "Key components include:\n";
  suggestions.components?.forEach(component => {
    responseMessage += `• ${component.name} (${component.category}): ${component.description}\n`;
  });
  
  responseMessage += "\nI've also created a maintenance schedule with tasks specifically tailored for this type of machine.";
  
  if (suggestions.components?.some(c => c.riskFactors && c.riskFactors.length > 0)) {
    responseMessage += "\n\nImportant safety considerations have been noted as risk factors for certain components.";
  }
  
  responseMessage += "\n\nYou can apply these suggestions to your machine configuration with the button below.";
  
  return {
    message: responseMessage,
    suggestions
  };
};

// Helper function for default machine descriptions
const getDefaultDescription = (machineType: string): string => {
  switch (machineType) {
    case 'Industrial Robot':
      return "High-precision industrial robot designed for manufacturing and assembly operations";
    case 'Collaborative Robot':
      return "Collaborative robot designed to work safely alongside humans in shared workspaces";
    case 'Mobile Robot':
      return "Autonomous mobile robot for material transport and logistics applications";
    case 'Autonomous Vehicle':
      return "Self-navigating vehicle for transportation and delivery tasks";
    case 'Drone':
      return "Aerial robotics platform for surveillance, inspection, and monitoring";
    case 'Custom':
      return "Custom robotics system with specialized configuration";
    default:
      return "Advanced robotics system configured for specific operational requirements";
  }
};

const MachineAIAssistant: React.FC<MachineAIAssistantProps> = ({
  machine, 
  onApplySuggestions, 
  onClose 
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `Hello! I'm your AI assistant for ${machine.name}. How can I help you improve or modify this machine? I can suggest components, maintenance schedules, or complete configurations.` 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedChanges, setSuggestedChanges] = useState<Partial<Machine> | null>(null);
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
      // Generate AI response
      const response = await generateAISuggestions(userInput, machine);
      
      // Add AI response to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.message
      }]);
      
      // Set suggestions if available
      if (response.suggestions) {
        setSuggestedChanges(response.suggestions);
      }
    } catch (err) {
      console.error('Error generating AI response:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error while processing your request. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleQuery = (query: string) => {
    setInput(query);
  };

  const applySuggestions = () => {
    if (suggestedChanges) {
      onApplySuggestions(suggestedChanges);
      setSuggestedChanges(null);
      
      // Add confirmation message to chat
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'I\'ve applied the suggested changes to the machine. You can now review and save them.' 
        }
      ]);
    }
  };

  const clearMessages = () => {
    setMessages([{
      role: 'assistant',
      content: `Hello! I'm your AI assistant for ${machine.name}. How can I help you improve or modify this machine? I can suggest components, maintenance schedules, or complete configurations.`
    }]);
    setError(null);
    setSuggestedChanges(null);
  };

  const renderSuggestionPreview = () => {
    if (!suggestedChanges) return null;
    
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 animate-fade-in">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <ZapIcon size={16} className="text-blue-600 mr-1" />
            <h3 className="text-sm font-medium text-blue-800">AI Suggestions Available</h3>
          </div>
          <button 
            onClick={() => setSuggestedChanges(null)}
            className="text-blue-500 hover:text-blue-700 p-1"
          >
            <X size={14} />
          </button>
        </div>
        
        <div className="space-y-2 text-xs mb-3 max-h-40 overflow-y-auto hide-scrollbar">
          {suggestedChanges.components && suggestedChanges.components.length > 0 && (
            <div>
              <span className="font-medium">Components:</span> {suggestedChanges.components.length} components
              <ul className="mt-1 ml-3 space-y-0.5">
                {suggestedChanges.components.slice(0, 3).map((component, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                    <span className="truncate">{component.name}</span>
                  </li>
                ))}
                {suggestedChanges.components.length > 3 && (
                  <li className="text-gray-500 italic">...and {suggestedChanges.components.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
          
          {suggestedChanges.maintenanceSchedule && (
            <div>
              <span className="font-medium">Maintenance:</span> {suggestedChanges.maintenanceSchedule.frequency}
              {suggestedChanges.maintenanceSchedule.tasks && suggestedChanges.maintenanceSchedule.tasks.length > 0 && (
                <span> with {suggestedChanges.maintenanceSchedule.tasks.length} tasks</span>
              )}
            </div>
          )}
          
          {suggestedChanges.status && suggestedChanges.status !== machine.status && (
            <div>
              <span className="font-medium">Status:</span> {suggestedChanges.status}
            </div>
          )}
          
          {suggestedChanges.description && suggestedChanges.description !== machine.description && (
            <div>
              <span className="font-medium">Description:</span> Updated
            </div>
          )}
        </div>
        
        <button
          onClick={applySuggestions}
          className="w-full py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center transition-colors"
        >
          <ZapIcon size={14} className="mr-1" />
          Apply Suggestions to Machine
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bot size={20} />
          <h2 className="font-semibold">Machine AI Assistant</h2>
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
            <h3 className="font-medium text-blue-800 mb-2">How to use the Machine AI Assistant</h3>
            <ul className="space-y-2 text-blue-700">
              <li>• Ask for a complete build based on your machine's purpose</li>
              <li>• Request specific component recommendations</li>
              <li>• Get maintenance schedule suggestions</li>
              <li>• Receive safety improvement recommendations</li>
              <li>• Get performance optimization advice</li>
            </ul>
          </div>
        )}

        {renderSuggestionPreview()}
        
        {messages.length === 1 && !loading && (
          <div className="pb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Try asking about:</h4>
            <div className="space-y-2">
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
              Thinking...
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
            placeholder={session ? `Ask about improvements for ${machine.name}...` : "Sign in to use the AI assistant"}
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

export default MachineAIAssistant;