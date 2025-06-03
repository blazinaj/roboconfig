import { Component } from '../types';

export const componentData: Component[] = [
  // Drive Components
  {
    id: '9a4c1b2e-5f7d-4e8a-9b3c-6d2a1f0e8c7b',
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
    compatibility: ['3f8e4d1c-2b7a-5f9e-8c6d-1a0b9f7e6d5c', '7b6a5c4d-3e2f-1a0b-9c8d-7e6f5d4c3b2a']
  },
  {
    id: '3f8e4d1c-2b7a-5f9e-8c6d-1a0b9f7e6d5c',
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
    compatibility: ['3f8e4d1c-2b7a-5f9e-8c6d-1a0b9f7e6d5c', '8c7d6e5f-4a3b-2c1d-0e9f-8a7b6c5d4e3f']
  },
  {
    id: '2d1e0f9a-8b7c-6e5d-4f3e-2d1c0b9a8f7e',
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
    compatibility: ['3f8e4d1c-2b7a-5f9e-8c6d-1a0b9f7e6d5c', '8c7d6e5f-4a3b-2c1d-0e9f-8a7b6c5d4e3f']
  },
  
  // Controller Components
  {
    id: '6c5d4e3f-2b1a-0c9d-8e7f-6a5b4c3d2e1f',
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
    compatibility: ['7b6a5c4d-3e2f-1a0b-9c8d-7e6f5d4c3b2a', '8c7d6e5f-4a3b-2c1d-0e9f-8a7b6c5d4e3f']
  },
  {
    id: '5d4c3b2a-1f0e-9d8c-7b6a-5e4d3c2b1a0f',
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
    compatibility: ['8c7d6e5f-4a3b-2c1d-0e9f-8a7b6c5d4e3f']
  },

  // Power Components
  {
    id: '7b6a5c4d-3e2f-1a0b-9c8d-7e6f5d4c3b2a',
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
    id: '8c7d6e5f-4a3b-2c1d-0e9f-8a7b6c5d4e3f',
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
    id: '9d8c7b6a-5f4e-3d2c-1b0a-9f8e7d6c5b4a',
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
    compatibility: ['6c5d4e3f-2b1a-0c9d-8e7f-6a5b4c3d2e1f', '1a0b9c8d-7e6f-5d4c-3b2a-1f0e9d8c7b6a']
  },
  {
    id: '0e9f8d7c-6b5a-4e3d-2c1b-0a9f8e7d6c5b',
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
    id: '4c3b2a1f-0e9d-8c7b-6a5f-4e3d2c1b0a9f',
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
    compatibility: ['9a4c1b2e-5f7d-4e8a-9b3c-6d2a1f0e8c7b', '6c5d4e3f-2b1a-0c9d-8e7f-6a5b4c3d2e1f']
  },
  {
    id: '1a0b9c8d-7e6f-5d4c-3b2a-1f0e9d8c7b6a',
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