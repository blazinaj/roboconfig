import React, { useState } from 'react';
import { Plus, Clock, CheckCircle, Trash2, PenTool as Tool, Calendar } from 'lucide-react';
import { Machine, MaintenanceTask } from '../../../types';
import { formatDate } from '../utils/dateUtils';
import { getMaintenanceStatus, getPriorityColor } from '../utils/maintenanceUtils';

interface MaintenanceScheduleProps {
  machine: Machine;
  updatedMachine: Machine | null;
  isEditing: boolean;
  handleToggleTaskComplete: (taskId: string) => void;
  handleChangeMaintenanceFrequency: (frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly') => void;
  handleAddTask: (task: Partial<MaintenanceTask>) => void;
}

const MaintenanceSchedule: React.FC<MaintenanceScheduleProps> = ({
  machine,
  updatedMachine,
  isEditing,
  handleToggleTaskComplete,
  handleChangeMaintenanceFrequency,
  handleAddTask
}) => {
  const machineToDisplay = isEditing && updatedMachine ? updatedMachine : machine;
  const maintenanceStatus = getMaintenanceStatus(machineToDisplay);
  
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState<Partial<MaintenanceTask>>({
    name: '',
    description: '',
    priority: 'Medium',
    estimatedDuration: 30,
    completed: false
  });

  const handleSubmitNewTask = () => {
    if (!newTask.name || !newTask.description) return;
    
    handleAddTask(newTask);
    setShowNewTaskForm(false);
    setNewTask({
      name: '',
      description: '',
      priority: 'Medium',
      estimatedDuration: 30,
      completed: false
    });
  };

  // Function to create a maintenance schedule if one doesn't exist
  const createMaintenanceSchedule = () => {
    if (!updatedMachine) return;
    
    const nextDue = new Date();
    nextDue.setMonth(nextDue.getMonth() + 1); // Default to monthly
    
    setUpdatedMachine({
      ...updatedMachine,
      maintenanceSchedule: {
        frequency: 'Monthly',
        tasks: [],
        nextDue
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Maintenance Schedule</h3>
        {maintenanceStatus && (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${maintenanceStatus.color}`}>
            {maintenanceStatus.icon}
            <span className="ml-2">{maintenanceStatus.label}</span>
          </span>
        )}
      </div>
      
      {/* If no maintenance schedule exists */}
      {!machineToDisplay.maintenanceSchedule ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Maintenance Schedule</h3>
          <p className="text-gray-500 mb-4">
            This machine doesn't have a maintenance schedule set up yet.
          </p>
          {isEditing && (
            <button
              onClick={createMaintenanceSchedule}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus size={16} className="inline mr-2" />
              Create Maintenance Schedule
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className="font-medium text-gray-800">Maintenance Settings</h4>
            </div>
            
            <div className="p-4">
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Maintenance Frequency</h4>
                {isEditing ? (
                  <div className="grid grid-cols-5 gap-2">
                    {(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const).map(frequency => (
                      <button
                        key={frequency}
                        onClick={() => handleChangeMaintenanceFrequency(frequency)}
                        className={`p-2 text-center text-sm rounded-md border ${
                          machineToDisplay.maintenanceSchedule?.frequency === frequency
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:border-blue-200'
                        }`}
                      >
                        {frequency}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-blue-800 font-medium text-lg">
                      {machineToDisplay.maintenanceSchedule?.frequency || 'Not scheduled'}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Last Completed</p>
                  <p className="font-medium text-lg">
                    {formatDate(machineToDisplay.maintenanceSchedule?.lastCompleted) || 'Never'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Next Due</p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={machineToDisplay.maintenanceSchedule?.nextDue 
                        ? new Date(machineToDisplay.maintenanceSchedule.nextDue).toISOString().split('T')[0]
                        : ''}
                      onChange={(e) => {
                        if (!updatedMachine) return;
                        const date = new Date(e.target.value);
                        setUpdatedMachine({
                          ...updatedMachine,
                          maintenanceSchedule: {
                            ...updatedMachine.maintenanceSchedule!,
                            nextDue: date
                          }
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-lg">
                      {formatDate(machineToDisplay.maintenanceSchedule?.nextDue) || 'Not scheduled'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h4 className="font-medium text-gray-800">Maintenance Tasks</h4>
              {isEditing && (
                <button
                  onClick={() => setShowNewTaskForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Task
                </button>
              )}
            </div>
            
            <div className="p-4">
              {showNewTaskForm && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task Name
                      </label>
                      <input
                        type="text"
                        value={newTask.name}
                        onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          min="1"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowNewTaskForm(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitNewTask}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Add Task
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">Upcoming Tasks</h5>
                  {machineToDisplay.maintenanceSchedule?.tasks && machineToDisplay.maintenanceSchedule.tasks.filter(t => !t.completed).length > 0 ? (
                    <div className="space-y-3">
                      {machineToDisplay.maintenanceSchedule.tasks
                        .filter(task => !task.completed)
                        .map((task) => (
                          <div
                            key={task.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <h4 className="font-medium text-gray-900 mr-2">{task.name}</h4>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{task.description}</p>
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <Clock size={14} className="mr-1" />
                                  {task.estimatedDuration} minutes
                                </div>
                              </div>
                              <div className="flex items-center ml-4">
                                {isEditing && (
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => handleToggleTaskComplete(task.id)}
                                      className="p-2 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                      title="Mark as complete"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                    <button
                                      className="p-2 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                      title="Delete task"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                        <Tool size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500">No upcoming maintenance tasks</p>
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
                
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">Completed Tasks</h5>
                  {machineToDisplay.maintenanceSchedule?.tasks && machineToDisplay.maintenanceSchedule.tasks.filter(t => t.completed).length > 0 ? (
                    <div className="space-y-2">
                      {machineToDisplay.maintenanceSchedule.tasks
                        .filter(task => task.completed)
                        .map((task) => (
                          <div
                            key={task.id}
                            className="bg-gray-50 border border-gray-100 rounded-lg p-3"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h4 className="font-medium text-gray-500 line-through mr-2">{task.name}</h4>
                                  <span className="text-xs text-gray-400">
                                    Completed: {formatDate(task.completedAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-400">{task.description}</p>
                              </div>
                              {isEditing && (
                                <button
                                  onClick={() => handleToggleTaskComplete(task.id)}
                                  className="p-1 rounded text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
                                  title="Mark as incomplete"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No completed tasks</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MaintenanceSchedule;