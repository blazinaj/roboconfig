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
          componentData.find(c => c.id === 'manipulation-arm-1')!,
          componentData.find(c => c.id === 'manipulation-gripper-1')!,
          componentData.find(c => c.id === 'controller-plc-1')!,
          componentData.find(c => c.id === 'sensor-vision-1')!,
          componentData.find(c => c.id === 'power-supply-1')!
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
          componentData.find(c => c.id === 'drive-motor-1')!,
          componentData.find(c => c.id === 'controller-ecu-1')!,
          componentData.find(c => c.id === 'sensor-lidar-1')!,
          componentData.find(c => c.id === 'power-battery-1')!
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