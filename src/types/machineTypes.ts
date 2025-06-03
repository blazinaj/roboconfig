import { Component } from './index';

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

export type MaintenanceFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';

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

export type MaintenanceSchedule = {
  id?: string;
  frequency: MaintenanceFrequency;
  tasks: MaintenanceTask[];
  lastCompleted?: Date;
  nextDue?: Date;
};

export type Machine = {
  id: string;
  name: string;
  description: string;
  type: MachineType;
  status: MachineStatus;
  components: Component[];
  maintenanceSchedule?: MaintenanceSchedule;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  createdAt: Date;
  updatedAt: Date;
  organization_id?: string;
};

export type MachineMetrics = {
  weight: string;
  power: string;
  components: number;
  riskScore: string;
};

export type ScoreResult = {
  score: number;
  level: string;
};