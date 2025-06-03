import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Dashboard from '../components/Dashboard';
import { Gauge } from 'lucide-react';

const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Gauge className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <p className="text-gray-600">Monitor and manage your robotics systems</p>
      </div>

      <Dashboard />
    </MainLayout>
  );
};

export default DashboardPage;