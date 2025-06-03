import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { Settings, Clock } from 'lucide-react';

const ConfigurationPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration</h1>
        </div>
        <p className="text-gray-600">System-wide configuration and settings</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          The configuration panel is currently being developed and will be available soon.
        </p>
        <p className="text-sm text-blue-600">
          Check back later for system-wide configuration options, integration settings, and more.
        </p>
      </div>
    </MainLayout>
  );
};

export default ConfigurationPage;