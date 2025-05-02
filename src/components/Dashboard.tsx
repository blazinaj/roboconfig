import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, CheckCircle, Info, Notebook as Robot, Cog, Package, Gauge, ArrowRight, Plus } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock data
  const stats = {
    machines: {
      total: 12,
      active: 8,
      maintenance: 3,
      error: 1
    },
    components: {
      total: 124,
      critical: 15,
      warning: 28,
      healthy: 81
    },
    risks: {
      total: 45,
      high: 8,
      medium: 22,
      low: 15
    }
  };

  const recentMachines = [
    { id: '1', name: 'Assembly Line Robot A1', status: 'Active', riskLevel: 'Low', lastUpdated: '2 hours ago' },
    { id: '2', name: 'Warehouse Bot W1', status: 'Maintenance', riskLevel: 'Medium', lastUpdated: '1 day ago' },
    { id: '3', name: 'Quality Control Bot Q1', status: 'Error', riskLevel: 'High', lastUpdated: '3 days ago' }
  ];

  const criticalComponents = [
    { id: 'drive-servo-1', name: 'High-Torque Servo', category: 'Drive', issue: 'Overheating risk', severity: 'High' },
    { id: 'controller-ecu-1', name: 'Main Controller ECU', category: 'Controller', issue: 'Software vulnerability', severity: 'Medium' },
    { id: 'power-battery-1', name: 'LiPo Battery Pack', category: 'Power', issue: 'Capacity degradation', severity: 'Medium' }
  ];

  const getRiskBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return <span className="flex items-center text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium">
          <AlertTriangle size={12} className="mr-1" /> High
        </span>;
      case 'medium':
        return <span className="flex items-center text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
          <Info size={12} className="mr-1" /> Medium
        </span>;
      default:
        return <span className="flex items-center text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
          <CheckCircle size={12} className="mr-1" /> Low
        </span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">Active</span>;
      case 'maintenance':
        return <span className="text-blue-700 bg-blue-100 px-2 py-1 rounded-full text-xs font-medium">Maintenance</span>;
      case 'error':
        return <span className="text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-medium">Error</span>;
      default:
        return <span className="text-gray-700 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const handleComponentClick = (category: string, id: string) => {
    const categoryRoutes: Record<string, string> = {
      'Drive': '/components/drive',
      'Controller': '/components/controller',
      'Power': '/components/power',
    };
    navigate(categoryRoutes[category] || '/components');
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Machines Overview */}
        <div 
          onClick={() => navigate('/machines')}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Robot className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Machines</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.machines.total}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Active</span>
              <span className="font-medium text-green-600">{stats.machines.active}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Maintenance</span>
              <span className="font-medium text-blue-600">{stats.machines.maintenance}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Error</span>
              <span className="font-medium text-red-600">{stats.machines.error}</span>
            </div>
          </div>
        </div>

        {/* Components Overview */}
        <div 
          onClick={() => navigate('/components')}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Components</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.components.total}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Healthy</span>
              <span className="font-medium text-green-600">{stats.components.healthy}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Warning</span>
              <span className="font-medium text-yellow-600">{stats.components.warning}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Critical</span>
              <span className="font-medium text-red-600">{stats.components.critical}</span>
            </div>
          </div>
        </div>

        {/* Reports Overview */}
        <div 
          onClick={() => navigate('/reports')}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Reports</h3>
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.risks.total}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">High Risk</span>
              <span className="font-medium text-red-600">{stats.risks.high}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Medium Risk</span>
              <span className="font-medium text-yellow-600">{stats.risks.medium}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Low Risk</span>
              <span className="font-medium text-green-600">{stats.risks.low}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Machines & Critical Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Machines */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Machines</h3>
            <button 
              onClick={() => navigate('/machines')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View All <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {recentMachines.map((machine) => (
                <div 
                  key={machine.id}
                  onClick={() => navigate(`/machines?id=${machine.id}`)}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{machine.name}</h4>
                    <p className="text-xs text-gray-500">Updated {machine.lastUpdated}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(machine.status)}
                    {getRiskBadge(machine.riskLevel)}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/machines')}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
            >
              <Plus size={16} className="mr-2" />
              Add New Machine
            </button>
          </div>
        </div>

        {/* Critical Components */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Critical Components</h3>
            <button 
              onClick={() => navigate('/components')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View All <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {criticalComponents.map((component) => (
                <div 
                  key={component.id}
                  onClick={() => handleComponentClick(component.category, component.id)}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{component.name}</h4>
                    <p className="text-xs text-gray-500">{component.category}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">{component.issue}</span>
                    {getRiskBadge(component.severity)}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/components')}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
            >
              <Gauge size={16} className="mr-2" />
              View All Components
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/machines')}
              className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors"
            >
              <Robot className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Add Machine</h4>
              <p className="text-sm text-gray-600 mt-1">Configure a new robotic system</p>
            </button>
            
            <button
              onClick={() => navigate('/components')}
              className="p-4 bg-purple-50 rounded-lg text-left hover:bg-purple-100 transition-colors"
            >
              <Cog className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Add Component</h4>
              <p className="text-sm text-gray-600 mt-1">Add new components to inventory</p>
            </button>
            
            <button
              onClick={() => navigate('/reports')}
              className="p-4 bg-amber-50 rounded-lg text-left hover:bg-amber-100 transition-colors"
            >
              <ShieldCheck className="h-6 w-6 text-amber-600 mb-2" />
              <h4 className="font-medium text-gray-900">View Reports</h4>
              <p className="text-sm text-gray-600 mt-1">Access system reports and analytics</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;