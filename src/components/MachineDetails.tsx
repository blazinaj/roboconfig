import React, { useMemo, useState } from 'react';
import { Machine, Component, RiskFactor, MaintenanceTask } from '../types';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Settings, 
  PenTool as Tool, 
  Calendar, 
  Shield, 
  ChevronRight, 
  FileText,
  Cog,
  Cpu,
  Battery,
  MessageSquare,
  Code,
  Hand,
  Eye,
  Package,
  Clock,
  Plus,
  X
} from 'lucide-react';
import ReportModal from './Reports/ReportModal';

interface MachineDetailsProps {
  machine: Machine;
  onClose: () => void;
}

const getComponentIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'drive':
      return <Cog className="text-blue-600" size={20} />;
    case 'controller':
      return <Cpu className="text-purple-600" size={20} />;
    case 'power':
      return <Battery className="text-green-600" size={20} />;
    case 'communication':
      return <MessageSquare className="text-orange-600" size={20} />;
    case 'software':
      return <Code className="text-indigo-600" size={20} />;
    case 'manipulation':
      return <Hand className="text-red-600" size={20} />;
    case 'sensors':
      return <Eye className="text-teal-600" size={20} />;
    case 'chassis':
      return <Package className="text-gray-600" size={20} />;
    default:
      return <Settings className="text-gray-600" size={20} />;
  }
};

const MachineDetails: React.FC<MachineDetailsProps> = ({ machine, onClose }) => {
  const [showReport, setShowReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'configuration'>('overview');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState<Partial<MaintenanceTask>>({
    name: '',
    description: '',
    priority: 'Medium',
    estimatedDuration: 30,
    completed: false
  });

  const calculateMachineMetrics = () => {
    let totalWeight = 0;
    let totalPowerConsumption = 0;

    machine.components.forEach(component => {
      // Extract weight from specifications
      const weightStr = component.specifications.weight as string;
      if (weightStr) {
        const weight = parseFloat(weightStr);
        if (!isNaN(weight)) {
          // Assume weight is in grams if unit is not specified
          if (weightStr.toLowerCase().includes('kg')) {
            totalWeight += weight * 1000;
          } else {
            totalWeight += weight;
          }
        }
      }

      // Calculate power consumption from voltage and current if available
      const voltage = parseFloat(component.specifications.voltage as string);
      const current = parseFloat(component.specifications.current as string);
      if (!isNaN(voltage) && !isNaN(current)) {
        totalPowerConsumption += voltage * current;
      } else if (component.specifications.power) {
        // If power is directly specified
        const power = parseFloat(component.specifications.power as string);
        if (!isNaN(power)) {
          totalPowerConsumption += power;
        }
      }
    });

    return {
      weight: totalWeight > 1000 ? `${(totalWeight / 1000).toFixed(2)} kg` : `${totalWeight.toFixed(2)} g`,
      power: totalPowerConsumption > 1000 ? `${(totalPowerConsumption / 1000).toFixed(2)} kW` : `${totalPowerConsumption.toFixed(2)} W`
    };
  };

  const metrics = calculateMachineMetrics();

  const getMaintenanceStatus = () => {
    if (!machine.maintenanceSchedule) return null;

    const now = new Date();
    const nextDue = new Date(machine.maintenanceSchedule.nextDue);
    const daysUntilDue = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

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

  const handleAddTask = () => {
    if (!newTask.name || !newTask.description) return;
    
    // In a real app, this would make an API call
    console.log('Adding new task:', newTask);
    setShowNewTaskForm(false);
    setNewTask({
      name: '',
      description: '',
      priority: 'Medium',
      estimatedDuration: 30,
      completed: false
    });
  };

  const handleToggleTaskComplete = (taskId: string) => {
    // In a real app, this would make an API call
    console.log('Toggling task completion:', taskId);
  };

  const getPriorityColor = (priority: string) => {
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

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-700 mb-2">
            <Settings size={18} className="mr-2" />
            <h3 className="font-medium">Type</h3>
          </div>
          <p className="text-gray-900">{machine.type}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-700 mb-2">
            <Tool size={18} className="mr-2" />
            <h3 className="font-medium">Last Maintenance</h3>
          </div>
          <p className="text-gray-900">
            {machine.lastMaintenance?.toLocaleDateString() || 'Not available'}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-700 mb-2">
            <Calendar size={18} className="mr-2" />
            <h3 className="font-medium">Next Maintenance</h3>
          </div>
          <p className="text-gray-900">
            {machine.nextMaintenance?.toLocaleDateString() || 'Not scheduled'}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-700 mb-2">
            <Shield size={18} className="mr-2" />
            <h3 className="font-medium">Components</h3>
          </div>
          <p className="text-gray-900">{machine.components.length} configured</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-700 mb-2">
            <Package size={18} className="mr-2" />
            <h3 className="font-medium">Total Weight</h3>
          </div>
          <p className="text-gray-900">{metrics.weight}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-700 mb-2">
            <Battery size={18} className="mr-2" />
            <h3 className="font-medium">Power Usage</h3>
          </div>
          <p className="text-gray-900">{metrics.power}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Components</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            Manage Components <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {machine.components.map((component) => (
            <div key={component.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getComponentIcon(component.category)}
                  <div>
                    <h4 className="font-medium text-gray-900">{component.name}</h4>
                    <p className="text-sm text-gray-500">{component.category}</p>
                  </div>
                </div>
              </div>
              
              <p className="mt-2 text-sm text-gray-600">{component.description}</p>
              
              {component.specifications && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Specifications</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(component.specifications).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-gray-500">{key}: </span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMaintenanceTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <Tool size={20} className="text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Maintenance Schedule</h3>
          </div>
          {getMaintenanceStatus() && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getMaintenanceStatus()?.color}`}>
              {getMaintenanceStatus()?.icon}
              <span className="ml-2">{getMaintenanceStatus()?.label}</span>
            </span>
          )}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500">Frequency</p>
              <p className="font-medium">{machine.maintenanceSchedule?.frequency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Completed</p>
              <p className="font-medium">
                {machine.maintenanceSchedule?.lastCompleted?.toLocaleDateString() || 'Never'}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-gray-700">Maintenance Tasks</h4>
              <button
                onClick={() => setShowNewTaskForm(true)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus size={16} className="mr-1" />
                Add Task
              </button>
            </div>

            {showNewTaskForm && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Name
                    </label>
                    <input
                      type="text"
                      value={newTask.name}
                      onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as MaintenanceTask['priority'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        value={newTask.estimatedDuration}
                        onChange={(e) => setNewTask({ ...newTask, estimatedDuration: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowNewTaskForm(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {machine.maintenanceSchedule?.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border ${
                    task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className={`font-medium ${task.completed ? 'text-gray-500' : 'text-gray-900'}`}>
                          {task.name}
                        </h4>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className={`text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {task.description}
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Clock size={14} className="mr-1" />
                        {task.estimatedDuration} minutes
                        {task.completed && task.completedAt && (
                          <span className="ml-3">
                            Completed: {task.completedAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleTaskComplete(task.id)}
                      className={`ml-4 p-2 rounded-full ${
                        task.completed
                          ? 'text-green-600 bg-green-100 hover:bg-green-200'
                          : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <CheckCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfigurationTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Machine Configuration</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Machine Name
              </label>
              <input
                type="text"
                value={machine.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <input
                type="text"
                value={machine.type}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={machine.description}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              rows={3}
              readOnly
            />
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Component Configuration</h4>
            <div className="space-y-4">
              {machine.components.map((component) => (
                <div key={component.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <h5 className="font-medium text-gray-900">{component.name}</h5>
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {component.category}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{component.description}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800">
                      <Settings size={16} />
                    </button>
                  </div>
                  
                  {component.specifications && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h6 className="text-xs font-medium text-gray-700 mb-2">Specifications</h6>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(component.specifications).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-gray-500">{key}: </span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Safety Configuration</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">Emergency Stop</h5>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Configured
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Response Time:</span>
                    <span className="ml-1 font-medium">100ms</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Coverage:</span>
                    <span className="ml-1 font-medium">All Components</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">Safety Zones</h5>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Partial
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Zones Defined:</span>
                    <span className="ml-1 font-medium">3</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Monitoring:</span>
                    <span className="ml-1 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:rounded-lg md:shadow-xl md:max-w-4xl overflow-hidden flex flex-col">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{machine.name}</h2>
            <p className="text-sm text-gray-600">{machine.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowReport(true)}
              className="hidden sm:flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <FileText size={16} className="mr-1" />
              Generate Report
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex whitespace-nowrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'maintenance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Maintenance
            </button>
            <button
              onClick={() => setActiveTab('configuration')}
              className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'configuration'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Configuration
            </button>
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'maintenance' && renderMaintenanceTab()}
            {activeTab === 'configuration' && renderConfigurationTab()}
          </div>
        </div>

        <div className="sm:hidden border-t border-gray-200 p-4 flex justify-center">
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FileText size={16} className="mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {showReport && (
        <ReportModal 
          machine={machine} 
          onClose={() => setShowReport(false)} 
        />
      )}
    </div>
  );
};

export default MachineDetails;