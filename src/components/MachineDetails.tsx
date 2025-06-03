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
  X,
  Edit,
  Save,
  Bot,
  Loader2,
  Trash2
} from 'lucide-react';
import { useMachines } from '../hooks/useMachines';
import ReportModal from './Reports/ReportModal';
import MachineAIAssistant from './MachineDetails/MachineAIAssistant';

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
    case 'object manipulation':
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
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedMachine, setUpdatedMachine] = useState<Machine>(machine);
  const [newTask, setNewTask] = useState<Partial<MaintenanceTask>>({
    name: '',
    description: '',
    priority: 'Medium',
    estimatedDuration: 30,
    completed: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { updateMachine } = useMachines();

  const calculateMachineMetrics = () => {
    let totalWeight = 0;
    let totalPowerConsumption = 0;

    const machineToUse = isEditing ? updatedMachine : machine;

    machineToUse.components.forEach(component => {
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
    const machineToUse = isEditing ? updatedMachine : machine;
    if (!machineToUse.maintenanceSchedule) return null;

    const now = new Date();
    const nextDue = machineToUse.maintenanceSchedule.nextDue instanceof Date
      ? machineToUse.maintenanceSchedule.nextDue
      : new Date(machineToUse.maintenanceSchedule.nextDue);
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
    
    // Create a deep copy of updatedMachine without using JSON.stringify/parse
    const updatedMachineCopy = { ...updatedMachine };
    
    if (!updatedMachineCopy.maintenanceSchedule) {
      const nextDueDate = new Date();
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      
      updatedMachineCopy.maintenanceSchedule = {
        frequency: 'Monthly',
        tasks: [],
        nextDue: nextDueDate
      };
    } else {
      // Make a copy of the maintenance schedule
      updatedMachineCopy.maintenanceSchedule = {
        ...updatedMachineCopy.maintenanceSchedule,
        tasks: [...(updatedMachineCopy.maintenanceSchedule.tasks || [])],
        // Ensure nextDue is a Date object
        nextDue: updatedMachineCopy.maintenanceSchedule.nextDue instanceof Date 
          ? new Date(updatedMachineCopy.maintenanceSchedule.nextDue) 
          : new Date(updatedMachineCopy.maintenanceSchedule.nextDue),
        // Ensure lastCompleted is a Date object if it exists
        lastCompleted: updatedMachineCopy.maintenanceSchedule.lastCompleted
          ? (updatedMachineCopy.maintenanceSchedule.lastCompleted instanceof Date
              ? new Date(updatedMachineCopy.maintenanceSchedule.lastCompleted)
              : new Date(updatedMachineCopy.maintenanceSchedule.lastCompleted))
          : undefined
      };
    }
    
    updatedMachineCopy.maintenanceSchedule.tasks.push({
      ...newTask,
      id: crypto.randomUUID()
    });
    
    setUpdatedMachine(updatedMachineCopy);
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
    // Create a deep copy of updatedMachine without using JSON.stringify/parse
    const updatedMachineCopy = { ...updatedMachine };
    
    if (updatedMachineCopy.maintenanceSchedule?.tasks) {
      // Create a new tasks array
      const tasks = [...updatedMachineCopy.maintenanceSchedule.tasks];
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex >= 0) {
        // Create a new task object
        const task = { ...tasks[taskIndex] };
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date() : undefined;
        tasks[taskIndex] = task;
        
        // Ensure maintenanceSchedule is properly copied
        updatedMachineCopy.maintenanceSchedule = {
          ...updatedMachineCopy.maintenanceSchedule,
          tasks,
          // Ensure dates are Date objects
          nextDue: updatedMachineCopy.maintenanceSchedule.nextDue instanceof Date 
            ? new Date(updatedMachineCopy.maintenanceSchedule.nextDue) 
            : new Date(updatedMachineCopy.maintenanceSchedule.nextDue),
          lastCompleted: updatedMachineCopy.maintenanceSchedule.lastCompleted
            ? (updatedMachineCopy.maintenanceSchedule.lastCompleted instanceof Date
                ? new Date(updatedMachineCopy.maintenanceSchedule.lastCompleted)
                : new Date(updatedMachineCopy.maintenanceSchedule.lastCompleted))
            : undefined
        };
        
        if (task.completed) {
          // Check if all tasks are complete, then update lastCompleted
          const allTasksComplete = tasks.every(t => t.completed);
          if (allTasksComplete) {
            updatedMachineCopy.maintenanceSchedule.lastCompleted = new Date();
            
            // Calculate next due date based on frequency
            let nextDue = new Date();
            switch (updatedMachineCopy.maintenanceSchedule.frequency) {
              case 'Daily':
                nextDue.setDate(nextDue.getDate() + 1);
                break;
              case 'Weekly':
                nextDue.setDate(nextDue.getDate() + 7);
                break;
              case 'Monthly':
                nextDue.setMonth(nextDue.getMonth() + 1);
                break;
              case 'Quarterly':
                nextDue.setMonth(nextDue.getMonth() + 3);
                break;
              case 'Yearly':
                nextDue.setFullYear(nextDue.getFullYear() + 1);
                break;
            }
            updatedMachineCopy.maintenanceSchedule.nextDue = nextDue;
          }
        }
        
        setUpdatedMachine(updatedMachineCopy);
      }
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await updateMachine(updatedMachine.id, updatedMachine);
      setSuccess('Machine updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the machine');
    } finally {
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      // Discard changes and return to view mode
      setUpdatedMachine(machine);
    }
    setIsEditing(!isEditing);
  };

  const handleRemoveComponent = (componentId: string) => {
    if (!isEditing) return;
    
    const updatedComponents = updatedMachine.components.filter(c => c.id !== componentId);
    setUpdatedMachine({
      ...updatedMachine,
      components: updatedComponents
    });
  };

  const handleApplySuggestions = (suggestions: Partial<Machine>) => {
    // Apply AI suggestions to the machine
    setUpdatedMachine(prev => {
      const newMachine = { ...prev };
      
      if (suggestions.name) newMachine.name = suggestions.name;
      if (suggestions.description) newMachine.description = suggestions.description;
      if (suggestions.type) newMachine.type = suggestions.type;
      if (suggestions.status) newMachine.status = suggestions.status;
      
      if (suggestions.components && suggestions.components.length > 0) {
        // Add new components without duplicating
        const existingIds = new Set(newMachine.components.map(c => c.id));
        const newComponents = suggestions.components.filter(c => !existingIds.has(c.id));
        newMachine.components = [...newMachine.components, ...newComponents];
      }
      
      if (suggestions.maintenanceSchedule) {
        // Create or update maintenance schedule
        if (!newMachine.maintenanceSchedule) {
          newMachine.maintenanceSchedule = {
            frequency: 'Monthly',
            tasks: [],
            nextDue: new Date()
          };
        }
        
        // Copy maintenance schedule properties
        if (suggestions.maintenanceSchedule.frequency) {
          newMachine.maintenanceSchedule.frequency = suggestions.maintenanceSchedule.frequency;
        }
        
        // Ensure dates are Date objects
        if (suggestions.maintenanceSchedule.nextDue) {
          newMachine.maintenanceSchedule.nextDue = suggestions.maintenanceSchedule.nextDue instanceof Date
            ? new Date(suggestions.maintenanceSchedule.nextDue)
            : new Date(suggestions.maintenanceSchedule.nextDue);
        }
        
        if (suggestions.maintenanceSchedule.lastCompleted) {
          newMachine.maintenanceSchedule.lastCompleted = suggestions.maintenanceSchedule.lastCompleted instanceof Date
            ? new Date(suggestions.maintenanceSchedule.lastCompleted)
            : new Date(suggestions.maintenanceSchedule.lastCompleted);
        }
        
        // Add new tasks
        if (suggestions.maintenanceSchedule.tasks && suggestions.maintenanceSchedule.tasks.length > 0) {
          if (!newMachine.maintenanceSchedule.tasks) {
            newMachine.maintenanceSchedule.tasks = [];
          }
          
          const existingTaskIds = new Set(newMachine.maintenanceSchedule.tasks.map(t => t.id));
          const newTasks = suggestions.maintenanceSchedule.tasks.filter(t => !existingTaskIds.has(t.id))
            .map(task => ({
              ...task,
              // Ensure completedAt is a Date object if it exists
              completedAt: task.completedAt 
                ? (task.completedAt instanceof Date ? new Date(task.completedAt) : new Date(task.completedAt))
                : undefined
            }));
            
          newMachine.maintenanceSchedule.tasks = [...newMachine.maintenanceSchedule.tasks, ...newTasks];
        }
      }
      
      return newMachine;
    });
    
    // If not in edit mode, enter edit mode
    if (!isEditing) {
      setIsEditing(true);
    }
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

  const handleChangeMaintenanceFrequency = (frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly') => {
    if (!isEditing) return;
    
    const updatedMachineCopy = { ...updatedMachine };
    
    if (!updatedMachineCopy.maintenanceSchedule) {
      // Create new schedule with proper Date object
      const nextDueDate = new Date();
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      
      updatedMachineCopy.maintenanceSchedule = {
        frequency,
        tasks: [],
        nextDue: nextDueDate
      };
    } else {
      // Create a copy of the maintenance schedule
      updatedMachineCopy.maintenanceSchedule = {
        ...updatedMachineCopy.maintenanceSchedule,
        frequency,
        // Ensure nextDue is a Date object
        nextDue: updatedMachineCopy.maintenanceSchedule.nextDue instanceof Date
          ? new Date(updatedMachineCopy.maintenanceSchedule.nextDue)
          : new Date(updatedMachineCopy.maintenanceSchedule.nextDue),
        // Ensure lastCompleted is a Date object if it exists
        lastCompleted: updatedMachineCopy.maintenanceSchedule.lastCompleted
          ? (updatedMachineCopy.maintenanceSchedule.lastCompleted instanceof Date
              ? new Date(updatedMachineCopy.maintenanceSchedule.lastCompleted)
              : new Date(updatedMachineCopy.maintenanceSchedule.lastCompleted))
          : undefined,
        // Create a copy of tasks array
        tasks: updatedMachineCopy.maintenanceSchedule.tasks
          ? [...updatedMachineCopy.maintenanceSchedule.tasks]
          : []
      };
    }
    
    setUpdatedMachine(updatedMachineCopy);
  };

  const handleUpdateStatus = (status: Machine['status']) => {
    if (!isEditing) return;
    
    setUpdatedMachine({
      ...updatedMachine,
      status
    });
  };

  const renderOverviewTab = () => {
    const machineToRender = isEditing ? updatedMachine : machine;
    
    return (
      <div className="space-y-6">
        {/* Status and basic info */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Status and Details</h3>
            {isEditing && (
              <div className="flex space-x-2">
                <select
                  value={updatedMachine.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as Machine['status'])}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Error">Error</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center text-gray-700 mb-2">
                  <Settings size={18} className="mr-2" />
                  <h3 className="font-medium">Type</h3>
                </div>
                {isEditing ? (
                  <select
                    value={updatedMachine.type}
                    onChange={(e) => setUpdatedMachine({...updatedMachine, type: e.target.value as any})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Industrial Robot">Industrial Robot</option>
                    <option value="Collaborative Robot">Collaborative Robot</option>
                    <option value="Mobile Robot">Mobile Robot</option>
                    <option value="Autonomous Vehicle">Autonomous Vehicle</option>
                    <option value="Drone">Drone</option>
                    <option value="Custom">Custom</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{machineToRender.type}</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center text-gray-700 mb-2">
                  <Tool size={18} className="mr-2" />
                  <h3 className="font-medium">Last Maintenance</h3>
                </div>
                <p className="text-gray-900">
                  {machineToRender.lastMaintenance?.toLocaleDateString() || 'Not available'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center text-gray-700 mb-2">
                  <Calendar size={18} className="mr-2" />
                  <h3 className="font-medium">Next Maintenance</h3>
                </div>
                <p className="text-gray-900">
                  {machineToRender.nextMaintenance?.toLocaleDateString() || 'Not scheduled'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center text-gray-700 mb-2">
                  <Shield size={18} className="mr-2" />
                  <h3 className="font-medium">Components</h3>
                </div>
                <p className="text-gray-900">{machineToRender.components.length} configured</p>
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
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Components</h3>
            {isEditing && (
              <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                <Plus size={16} className="mr-1" />
                Add Component
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {machineToRender.components.map((component) => (
              <div key={component.id} className="bg-white p-4 rounded-lg border border-gray-200 relative">
                {isEditing && (
                  <button
                    onClick={() => handleRemoveComponent(component.id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                    title="Remove component"
                  >
                    <X size={16} />
                  </button>
                )}
                <div className="flex items-start space-x-3">
                  {getComponentIcon(component.category)}
                  <div>
                    <h4 className="font-medium text-gray-900">{component.name}</h4>
                    <p className="text-sm text-gray-500">{component.category}</p>
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
  };

  const renderMaintenanceTab = () => {
    const machineToRender = isEditing ? updatedMachine : machine;
    
    return (
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
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Maintenance Frequency</h4>
              {isEditing ? (
                <div className="grid grid-cols-5 gap-2">
                  {(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const).map(frequency => (
                    <button
                      key={frequency}
                      onClick={() => handleChangeMaintenanceFrequency(frequency)}
                      className={`p-2 text-center text-sm rounded-md border ${
                        machineToRender.maintenanceSchedule?.frequency === frequency
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:border-blue-200'
                      }`}
                    >
                      {frequency}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-900 font-medium">{machineToRender.maintenanceSchedule?.frequency || 'Not scheduled'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-500">Last Completed</p>
                <p className="font-medium">
                  {machineToRender.maintenanceSchedule?.lastCompleted instanceof Date 
                    ? machineToRender.maintenanceSchedule.lastCompleted.toLocaleDateString() 
                    : machineToRender.maintenanceSchedule?.lastCompleted
                      ? new Date(machineToRender.maintenanceSchedule.lastCompleted).toLocaleDateString()
                      : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Due</p>
                <p className="font-medium">
                  {machineToRender.maintenanceSchedule?.nextDue instanceof Date 
                    ? machineToRender.maintenanceSchedule.nextDue.toLocaleDateString() 
                    : machineToRender.maintenanceSchedule?.nextDue
                      ? new Date(machineToRender.maintenanceSchedule.nextDue).toLocaleDateString()
                      : 'Not scheduled'}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-gray-700">Maintenance Tasks</h4>
                {isEditing && (
                  <button
                    onClick={() => setShowNewTaskForm(true)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Task
                  </button>
                )}
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
                {machineToRender.maintenanceSchedule?.tasks?.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border ${
                      task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
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
                              Completed: {task.completedAt instanceof Date 
                                ? task.completedAt.toLocaleDateString()
                                : new Date(task.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {isEditing && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleToggleTaskComplete(task.id)}
                            className={`p-2 rounded-full ${
                              task.completed
                                ? 'text-green-600 bg-green-100 hover:bg-green-200'
                                : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                            }`}
                            title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => {
                              // Create new maintenance schedule object with tasks array excluding the current task
                              const updatedTasks = updatedMachine.maintenanceSchedule?.tasks.filter(t => t.id !== task.id) || [];
                              setUpdatedMachine({
                                ...updatedMachine,
                                maintenanceSchedule: {
                                  ...updatedMachine.maintenanceSchedule!,
                                  tasks: updatedTasks,
                                  // Ensure dates are Date objects
                                  nextDue: updatedMachine.maintenanceSchedule?.nextDue instanceof Date 
                                    ? new Date(updatedMachine.maintenanceSchedule.nextDue) 
                                    : new Date(updatedMachine.maintenanceSchedule!.nextDue),
                                  lastCompleted: updatedMachine.maintenanceSchedule?.lastCompleted
                                    ? (updatedMachine.maintenanceSchedule.lastCompleted instanceof Date
                                        ? new Date(updatedMachine.maintenanceSchedule.lastCompleted)
                                        : new Date(updatedMachine.maintenanceSchedule.lastCompleted))
                                    : undefined
                                }
                              });
                            }}
                            className="p-2 rounded-full text-gray-400 bg-gray-100 hover:bg-gray-200 hover:text-red-500"
                            title="Delete task"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                      {!isEditing && (
                        <button
                          onClick={() => handleToggleTaskComplete(task.id)}
                          className={`ml-4 p-2 rounded-full ${
                            task.completed
                              ? 'text-green-600 bg-green-100 hover:bg-green-200'
                              : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                          }`}
                          title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                          disabled={!isEditing}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {(!machineToRender.maintenanceSchedule?.tasks || machineToRender.maintenanceSchedule.tasks.length === 0) && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No maintenance tasks scheduled</p>
                    {isEditing && (
                      <button
                        onClick={() => setShowNewTaskForm(true)}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Add your first task
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConfigurationTab = () => {
    const machineToRender = isEditing ? updatedMachine : machine;
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Machine Configuration</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={updatedMachine.name}
                    onChange={(e) => setUpdatedMachine({...updatedMachine, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={machineToRender.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                {isEditing ? (
                  <select
                    value={updatedMachine.type}
                    onChange={(e) => setUpdatedMachine({...updatedMachine, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Industrial Robot">Industrial Robot</option>
                    <option value="Collaborative Robot">Collaborative Robot</option>
                    <option value="Mobile Robot">Mobile Robot</option>
                    <option value="Autonomous Vehicle">Autonomous Vehicle</option>
                    <option value="Drone">Drone</option>
                    <option value="Custom">Custom</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={machineToRender.type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={updatedMachine.description}
                  onChange={(e) => setUpdatedMachine({...updatedMachine, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              ) : (
                <textarea
                  value={machineToRender.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  rows={3}
                  readOnly
                />
              )}
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Component Configuration</h4>
              <div className="space-y-4">
                {machineToRender.components.map((component) => (
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
                      {isEditing && (
                        <button 
                          onClick={() => handleRemoveComponent(component.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
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
                
                {isEditing && (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={() => {
                        // Open component selector (in a real implementation)
                        // For now, just log
                        console.log("Would open component selector");
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center hover:bg-gray-200"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Component
                    </button>
                  </div>
                )}
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
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:rounded-lg md:shadow-xl md:max-w-6xl overflow-hidden flex flex-col">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-start">
          <div className="pr-12"> {/* Add padding to prevent text from going under buttons */}
            {isEditing ? (
              <input
                type="text"
                value={updatedMachine.name}
                onChange={(e) => setUpdatedMachine({...updatedMachine, name: e.target.value})}
                className="text-lg sm:text-xl font-semibold text-gray-900 w-full border-b border-dashed border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
              />
            ) : (
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{machine.name}</h2>
            )}
            {isEditing ? (
              <textarea
                value={updatedMachine.description}
                onChange={(e) => setUpdatedMachine({...updatedMachine, description: e.target.value})}
                className="text-sm text-gray-600 w-full mt-1 border-b border-dashed border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
                rows={2}
              />
            ) : (
              <p className="text-sm text-gray-600">{machine.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!showAIAssistant && (
              <button
                onClick={() => setShowAIAssistant(true)}
                className="hidden sm:flex items-center px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                title="AI Assistant"
              >
                <Bot size={16} className="mr-1.5" />
                AI Assistant
              </button>
            )}
            
            {!isEditing ? (
              <button
                onClick={toggleEditMode}
                className="hidden sm:flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Edit size={16} className="mr-1" />
                Edit
              </button>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-1" />
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={toggleEditMode}
                  className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            )}
            
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

        {error && (
          <div className="mx-4 sm:mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
            <AlertTriangle size={18} className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-4 sm:mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center">
            <CheckCircle size={18} className="mr-2" />
            <span>{success}</span>
          </div>
        )}

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

        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'maintenance' && renderMaintenanceTab()}
            {activeTab === 'configuration' && renderConfigurationTab()}
          </div>
          
          {showAIAssistant && (
            <div className="w-96 border-l border-gray-200 flex-shrink-0 overflow-hidden">
              <MachineAIAssistant 
                machine={isEditing ? updatedMachine : machine}
                onApplySuggestions={handleApplySuggestions}
                onClose={() => setShowAIAssistant(false)}
              />
            </div>
          )}
        </div>

        {isEditing && (
          <div className="sm:hidden border-t border-gray-200 p-4 flex justify-between">
            <button
              onClick={toggleEditMode}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}

        <div className={`sm:hidden border-t border-gray-200 p-4 ${isEditing ? 'hidden' : 'flex justify-center'}`}>
          {!isEditing && (
            <div className="flex space-x-3">
              <button
                onClick={toggleEditMode}
                className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Edit size={16} className="mr-2" />
                Edit Machine
              </button>
              <button
                onClick={() => setShowAIAssistant(true)}
                className="flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <Bot size={16} className="mr-2" />
                AI Assistant
              </button>
            </div>
          )}
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