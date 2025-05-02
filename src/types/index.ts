export type ComponentCategory = 
  | 'Drive' 
  | 'Controller' 
  | 'Power' 
  | 'Communication' 
  | 'Software' 
  | 'Object Manipulation' 
  | 'Sensors' 
  | 'Chassis';

export type Component = {
  id: string;
  name: string;
  category: ComponentCategory;
  type: string;
  description: string;
  specifications: Record<string, string | number>;
  riskFactors: RiskFactor[];
  compatibility?: string[];
  image?: string;
};

export type RiskFactor = {
  id: string;
  name: string;
  severity: 1 | 2 | 3 | 4 | 5;
  probability: 1 | 2 | 3 | 4 | 5;
  description: string;
  mitigationStrategy?: string;
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

export type Project = {
  id: string;
  name: string;
  description: string;
  components: Component[];
  riskAssessments: RiskAssessment[];
  createdAt: Date;
  updatedAt: Date;
};

export type Machine = {
  id: string;
  name: string;
  description: string;
  type: MachineType;
  status: MachineStatus;
  components: Component[];
  riskAssessment?: RiskAssessment;
  maintenanceSchedule?: MaintenanceSchedule;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type MachineType = 
  | 'Industrial Robot'
  | 'Collaborative Robot'
  | 'Mobile Robot'
  | 'Autonomous Vehicle'
  | 'Drone'
  | 'Custom';

export type MachineStatus = 
  | 'Active'
  | 'Inactive'
  | 'Maintenance'
  | 'Error'
  | 'Offline';

export type MaintenanceSchedule = {
  id: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  tasks: MaintenanceTask[];
  lastCompleted?: Date;
  nextDue: Date;
};

export type MaintenanceTask = {
  id: string;
  name: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedDuration: number; // in minutes
  completed: boolean;
  completedAt?: Date;
  notes?: string;
};