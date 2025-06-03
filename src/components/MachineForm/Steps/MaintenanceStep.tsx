import React from 'react';
import { MachineFormData } from '../MachineForm';
import { Plus, X } from 'lucide-react';

interface MaintenanceStepProps {
  formData: MachineFormData;
  setFormData: React.Dispatch<React.SetStateAction<MachineFormData>>;
}

const MaintenanceStep: React.FC<MaintenanceStepProps> = ({ formData, setFormData }) => {
  const [newTask, setNewTask] = React.useState({
    name: '',
    description: '',
    priority: 'Medium' as const,
    estimatedDuration: 30
  });

  const handleFrequencyChange = (frequency: typeof formData.maintenanceSchedule.frequency) => {
    setFormData({
      ...formData,
      maintenanceSchedule: {
        ...formData.maintenanceSchedule,
        frequency
      }
    });
  };

  const handleAddTask = () => {
    if (!newTask.name || !newTask.description) return;

    setFormData({
      ...formData,
      maintenanceSchedule: {
        ...formData.maintenanceSchedule,
        tasks: [...formData.maintenanceSchedule.tasks, newTask]
      }
    });

    setNewTask({
      name: '',
      description: '',
      priority: 'Medium',
      estimatedDuration: 30
    });
  };

  const handleRemoveTask = (index: number) => {
    setFormData({
      ...formData,
      maintenanceSchedule: {
        ...formData.maintenanceSchedule,
        tasks: formData.maintenanceSchedule.tasks.filter((_, i) => i !== index)
      }
    });
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Schedule</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const).map(frequency => (
            <button
              key={frequency}
              onClick={() => handleFrequencyChange(frequency)}
              className={`p-4 text-center rounded-lg border transition-colors ${
                formData.maintenanceSchedule.frequency === frequency
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              {frequency}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Tasks</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Name
              </label>
              <input
                type="text"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter task name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={2}
              placeholder="Describe the maintenance task"
            />
          </div>
          <button
            onClick={handleAddTask}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus size={16} className="mr-2" />
            Add Task
          </button>
        </div>

        <div className="space-y-3">
          {formData.maintenanceSchedule.tasks.map((task, index) => (
            <div key={index} className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">{task.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className="text-sm text-gray-500">
                    {task.estimatedDuration} min
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              </div>
              <button
                onClick={() => handleRemoveTask(index)}
                className="ml-4 text-gray-400 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          {formData.maintenanceSchedule.tasks.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No maintenance tasks added yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceStep;