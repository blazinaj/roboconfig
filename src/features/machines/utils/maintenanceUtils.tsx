import React from 'react';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';
import { Machine } from '../../../types';
import { ensureDate } from './dateUtils';

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return 'text-red-700 bg-red-100';
    case 'High':
      return 'text-orange-700 bg-orange-100';
    case 'Medium':
      return 'text-yellow-700 bg-yellow-100';
    default:
      return 'text-green-700 bg-green-100';
  }
};

export const getMaintenanceStatus = (machine: Machine) => {
  if (!machine || !machine.maintenanceSchedule) return null;

  const now = new Date();
  // Ensure nextDue is a Date object
  const nextDueDate = ensureDate(machine.maintenanceSchedule.nextDue);
  if (!nextDueDate) return null;
  
  const daysUntilDue = Math.ceil((nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) {
    return {
      label: 'Overdue',
      color: 'text-red-700 bg-red-100',
      icon: <AlertTriangle size={16} />
    };
  } else if (daysUntilDue <= 7) {
    return {
      label: 'Due Soon',
      color: 'text-yellow-700 bg-yellow-100',
      icon: <Clock size={16} />
    };
  } else {
    return {
      label: `Due in ${daysUntilDue} days`,
      color: 'text-green-700 bg-green-100',
      icon: <Calendar size={16} />
    };
  }
};

export const getMaintenanceStatusBadge = (machine: Machine) => {
  const status = getMaintenanceStatus(machine);
  
  if (!status) return null;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
      {status.icon}
      <span className="ml-1.5">{status.label}</span>
    </span>
  );
};