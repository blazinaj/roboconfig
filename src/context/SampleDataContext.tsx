import React, { createContext, useContext, useState } from 'react';
import { componentData } from '../data/componentData';
import { Component, Machine } from '../types';

interface SampleDataContextType {
  useSampleData: boolean;
  toggleSampleData: () => void;
  getSampleComponents: () => Component[];
  getSampleMachines: () => Machine[];
}

const SampleDataContext = createContext<SampleDataContextType>({
  useSampleData: false,
  toggleSampleData: () => {},
  getSampleComponents: () => [],
  getSampleMachines: () => []
});

export const useSampleData = () => useContext(SampleDataContext);

export const SampleDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [useSampleData, setUseSampleData] = useState(false);

  const toggleSampleData = () => {
    setUseSampleData(prev => !prev);
  };

  const getSampleComponents = () => {
    return useSampleData ? componentData : [];
  };

  const getSampleMachines = () => {
    if (!useSampleData) return [];

    return [
      {
        id: '1',
        name: 'Assembly Line Robot A1',
        description: 'Primary assembly line robotic arm for component placement',
        type: 'Industrial Robot',
        status: 'Active',
        components: [
          componentData.find(c => c.id === '1a0b9c8d-7e6f-5d4c-3b2a-1f0e9d8c7b6a')!,
          componentData.find(c => c.id === '4c3b2a1f-0e9d-8c7b-6a5f-4e3d2c1b0a9f')!,
          componentData.find(c => c.id === '5d4c3b2a-1f0e-9d8c-7b6a-5e4d3c2b1a0f')!,
          componentData.find(c => c.id === '9d8c7b6a-5f4e-3d2c-1b0a-9f8e7d6c5b4a')!,
          componentData.find(c => c.id === '8c7d6e5f-4a3b-2c1d-0e9f-8a7b6c5d4e3f')!
        ],
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-02-20'),
        lastMaintenance: new Date('2025-02-15'),
        nextMaintenance: new Date('2025-03-15'),
        maintenanceSchedule: {
          id: 'ms-1',
          frequency: 'Monthly',
          tasks: [
            {
              id: 'mt-1',
              name: 'Calibrate Arm',
              description: 'Perform precision calibration of robotic arm',
              priority: 'High',
              estimatedDuration: 60,
              completed: false,
              notes: 'Focus on joint calibration'
            },
            {
              id: 'mt-2',
              name: 'Check Gripper',
              description: 'Inspect and test gripper mechanism',
              priority: 'Medium',
              estimatedDuration: 30,
              completed: true,
              completedAt: new Date('2025-02-15')
            }
          ],
          lastCompleted: new Date('2025-02-15'),
          nextDue: new Date('2025-03-15')
        }
      },
      {
        id: '2',
        name: 'Warehouse Bot W1',
        description: 'Autonomous warehouse navigation and inventory robot',
        type: 'Mobile Robot',
        status: 'Maintenance',
        components: [
          componentData.find(c => c.id === '3f8e4d1c-2b7a-5f9e-8c6d-1a0b9f7e6d5c')!,
          componentData.find(c => c.id === '6c5d4e3f-2b1a-0c9d-8e7f-6a5b4c3d2e1f')!,
          componentData.find(c => c.id === '0e9f8d7c-6b5a-4e3d-2c1b-0a9f8e7d6c5b')!,
          componentData.find(c => c.id === '7b6a5c4d-3e2f-1a0b-9c8d-7e6f5d4c3b2a')!
        ],
        createdAt: new Date('2025-01-20'),
        updatedAt: new Date('2025-02-18'),
        lastMaintenance: new Date('2025-02-01'),
        nextMaintenance: new Date('2025-03-01'),
        maintenanceSchedule: {
          id: 'ms-2',
          frequency: 'Weekly',
          tasks: [
            {
              id: 'mt-3',
              name: 'Battery Check',
              description: 'Check battery health and charging system',
              priority: 'Critical',
              estimatedDuration: 45,
              completed: false
            }
          ],
          lastCompleted: new Date('2025-02-01'),
          nextDue: new Date('2025-03-01')
        }
      }
    ];
  };

  return (
    <SampleDataContext.Provider value={{ 
      useSampleData, 
      toggleSampleData, 
      getSampleComponents,
      getSampleMachines
    }}>
      {children}
    </SampleDataContext.Provider>
  );
};