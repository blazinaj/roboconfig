import { Component } from '../types';

export const componentData: Component[] = [
  // Drive Components
  {
    id: 'drive-servo-1',
    name: 'High-Torque Servo',
    category: 'Drive',
    type: 'servos',
    description: 'Industrial-grade servo motor with high torque capabilities for precise movement control.',
    specifications: {
      torque: '25kg/cm',
      voltage: '12V',
      rotationSpeed: '60 RPM',
      weight: '250g',
      dimensions: '40 x 20 x 40 mm',
    },
    riskFactors: [
      {
        id: 'rf-001',
        name: 'Overheating',
        severity: 3,
        probability: 2,
        description: 'Risk of overheating during extended operation under high load.'
      },
      {
        id: 'rf-002',
        name: 'Mechanical Failure',
        severity: 4,
        probability: 1,
        description: 'Potential for gear stripping under excessive load.'
      }
    ],
    compatibility: ['controller-ecu-1', 'power-battery-1']
  },
  {
    id: 'drive-motor-1',
    name: 'DC Brushless Motor',
    category: 'Drive',
    type: 'motors',
    description: 'High-efficiency brushless DC motor suitable for continuous operation.',
    specifications: {
      power: '250W',
      voltage: '24V',
      current: '10A',
      rpm: '3000 RPM',
      efficiency: '85%',
    },
    riskFactors: [
      {
        id: 'rf-003',
        name: 'Current Surge',
        severity: 3,
        probability: 2,
        description: 'Initial startup may cause current surge affecting other components.'
      }
    ],
    compatibility: ['controller-ecu-1', 'power-battery-2']
  },
  {
    id: 'drive-motor-2',
    name: 'Linear Actuator',
    category: 'Drive',
    type: 'actuators',
    description: 'Precision linear actuator for smooth and accurate linear motion control.',
    specifications: {
      stroke: '200mm',
      force: '1000N',
      speed: '50mm/s',
      voltage: '24V',
      protection: 'IP65',
    },
    riskFactors: [
      {
        id: 'rf-004',
        name: 'Mechanical Binding',
        severity: 3,
        probability: 2,
        description: 'Risk of binding under misaligned loads.'
      }
    ],
    compatibility: ['controller-ecu-1', 'power-battery-2']
  },
  
  // Controller Components
  {
    id: 'controller-ecu-1',
    name: 'Advanced ECU',
    category: 'Controller',
    type: 'ECU',
    description: 'Electronic Control Unit for precise management of robotic systems.',
    specifications: {
      processor: 'ARM Cortex-M7',
      memory: '512KB',
      interfaces: 'CAN, SPI, I2C, UART',
      operatingVoltage: '5V',
    },
    riskFactors: [
      {
        id: 'rf-005',
        name: 'Software Failure',
        severity: 5,
        probability: 1,
        description: 'Critical system control failure due to software bugs.'
      },
      {
        id: 'rf-006',
        name: 'Electrical Interference',
        severity: 3,
        probability: 2,
        description: 'Susceptibility to EMI causing unpredictable behavior.'
      }
    ],
    compatibility: ['power-battery-1', 'power-battery-2']
  },
  {
    id: 'controller-plc-1',
    name: 'Industrial PLC',
    category: 'Controller',
    type: 'PLC',
    description: 'Programmable Logic Controller for industrial automation and control.',
    specifications: {
      processor: 'Dual-core 1GHz',
      memory: '4GB',
      io: '32DI/32DO',
      protocol: 'EtherCAT',
    },
    riskFactors: [
      {
        id: 'rf-007',
        name: 'Network Security',
        severity: 4,
        probability: 2,
        description: 'Vulnerability to cyber attacks through network connection.'
      }
    ],
    compatibility: ['power-battery-2']
  },

  // Power Components
  {
    id: 'power-battery-1',
    name: 'Lithium Polymer Battery',
    category: 'Power',
    type: 'batteries',
    description: 'High-capacity LiPo battery pack for robotic applications.',
    specifications: {
      capacity: '5000mAh',
      voltage: '11.1V',
      dischargRate: '20C',
      weight: '450g',
      cellCount: '3S',
    },
    riskFactors: [
      {
        id: 'rf-008',
        name: 'Thermal Runaway',
        severity: 5,
        probability: 1,
        description: 'Risk of fire due to cell damage or overcharging.'
      },
      {
        id: 'rf-009',
        name: 'Undervoltage',
        severity: 3,
        probability: 2,
        description: 'System failure due to battery depletion below safe threshold.'
      }
    ]
  },
  {
    id: 'power-supply-1',
    name: 'Industrial Power Supply',
    category: 'Power',
    type: 'power supplies',
    description: 'Regulated power supply for industrial robotics systems.',
    specifications: {
      power: '1000W',
      input: '220VAC',
      output: '24VDC',
      efficiency: '93%',
      protection: 'OVP, OCP, SCP',
    },
    riskFactors: [
      {
        id: 'rf-010',
        name: 'Electrical Shock',
        severity: 5,
        probability: 1,
        description: 'Risk of electrical shock during maintenance.'
      }
    ]
  },
  
  // Sensors
  {
    id: 'sensor-vision-1',
    name: 'High-Resolution Camera',
    category: 'Sensors',
    type: 'Vision',
    description: 'Advanced vision sensor for object recognition and environment mapping.',
    specifications: {
      resolution: '1920x1080',
      frameRate: '60fps',
      fieldOfView: '120°',
      interface: 'USB 3.0',
      powerConsumption: '2.5W',
    },
    riskFactors: [
      {
        id: 'rf-011',
        name: 'Image Processing Lag',
        severity: 3,
        probability: 2,
        description: 'Delayed response due to image processing overhead.'
      }
    ],
    compatibility: ['controller-ecu-1', 'software-vision-1']
  },
  {
    id: 'sensor-lidar-1',
    name: '360° LiDAR Scanner',
    category: 'Sensors',
    type: 'Vision',
    description: 'High-precision LiDAR scanner for 3D mapping and obstacle detection.',
    specifications: {
      range: '100m',
      accuracy: '±2cm',
      scanRate: '20Hz',
      points: '300,000/s',
      protection: 'IP67',
    },
    riskFactors: [
      {
        id: 'rf-012',
        name: 'Eye Safety',
        severity: 4,
        probability: 1,
        description: 'Potential eye hazard from laser radiation.'
      }
    ]
  },

  // Object Manipulation
  {
    id: 'manipulation-gripper-1',
    name: 'Precision Gripper',
    category: 'Object Manipulation',
    type: 'grabbers',
    description: 'Adaptive gripper for handling various object sizes and shapes with precision.',
    specifications: {
      grippingForce: '50N',
      openingWidth: '0-100mm',
      weight: '300g',
      accuracy: '±0.5mm',
    },
    riskFactors: [
      {
        id: 'rf-013',
        name: 'Pinch Hazard',
        severity: 4,
        probability: 3,
        description: 'Risk of injury from moving gripper parts.'
      },
      {
        id: 'rf-014',
        name: 'Object Drop',
        severity: 3,
        probability: 2,
        description: 'Potential for dropping held objects during operation.'
      }
    ],
    compatibility: ['drive-servo-1', 'controller-ecu-1']
  },
  {
    id: 'manipulation-arm-1',
    name: '6-Axis Robotic Arm',
    category: 'Object Manipulation',
    type: 'arms',
    description: 'Industrial 6-axis robotic arm for complex manipulation tasks.',
    specifications: {
      payload: '10kg',
      reach: '1500mm',
      repeatability: '±0.1mm',
      axes: '6',
      weight: '120kg',
    },
    riskFactors: [
      {
        id: 'rf-015',
        name: 'Collision',
        severity: 5,
        probability: 2,
        description: 'Risk of collision with obstacles or humans.'
      }
    ]
  }
];