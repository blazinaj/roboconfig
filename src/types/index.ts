export * from './componentTypes';
export * from './machineTypes';
export * from './organizationTypes';

// Legacy types that may still be used elsewhere in the application
export type Project = {
  id: string;
  name: string;
  description: string;
  components: Component[];
  riskAssessments: RiskAssessment[];
  createdAt: Date;
  updatedAt: Date;
};

export type RiskAssessment = {
  id: string;
  componentId: string;
  riskFactors: RiskFactor[];
  overallRiskScore: number;
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
};

// Export MachineFormData type for the AI Assistant
export type MachineFormData = {
  name: string;
  type: import('./machineTypes').MachineType;
  description: string;
  status: import('./machineTypes').MachineStatus;
  components: import('./componentTypes').Component[];
  maintenanceSchedule?: {
    frequency: import('./machineTypes').MaintenanceFrequency;
    tasks?: import('./machineTypes').MaintenanceTask[];
  };
};