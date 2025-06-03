import React from 'react';
import { CheckCircle, AlertTriangle, Clock, PenTool as Tool } from 'lucide-react';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'text-green-700 bg-green-100 border-green-200';
    case 'Inactive':
      return 'text-gray-700 bg-gray-100 border-gray-200';
    case 'Maintenance':
      return 'text-blue-700 bg-blue-100 border-blue-200';
    case 'Error':
      return 'text-red-700 bg-red-100 border-red-200';
    case 'Offline':
      return 'text-gray-700 bg-gray-100 border-gray-200';
    default:
      return 'text-gray-700 bg-gray-100 border-gray-200';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Active':
      return <CheckCircle size={16} className="text-green-500 mr-2" />;
    case 'Inactive':
      return <AlertTriangle size={16} className="text-gray-500 mr-2" />;
    case 'Maintenance':
      return <Tool size={16} className="text-blue-500 mr-2" />;
    case 'Error':
      return <AlertTriangle size={16} className="text-red-500 mr-2" />;
    case 'Offline':
      return <AlertTriangle size={16} className="text-gray-500 mr-2" />;
    default:
      return null;
  }
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-green-700 bg-green-100">
          <CheckCircle size={16} className="mr-1.5" /> Active
        </span>
      );
    case 'Maintenance':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-blue-700 bg-blue-100">
          <Tool size={16} className="mr-1.5" /> Maintenance
        </span>
      );
    case 'Error':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-red-700 bg-red-100">
          <AlertTriangle size={16} className="mr-1.5" /> Error
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-gray-700 bg-gray-100">
          <Clock size={16} className="mr-1.5" /> {status}
        </span>
      );
  }
};