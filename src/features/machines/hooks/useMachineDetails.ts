import { useState, useEffect } from 'react';
import { Machine, MaintenanceTask, MaintenanceFrequency } from '../../../types';
import { useMachines } from '../../../hooks/useMachines';
import { ensureDate } from '../utils/dateUtils';
import { MACHINE_AVATARS, DEFAULT_AVATARS } from '../utils/avatarUtils';

export function useMachineDetails(machineId: string | undefined) {
  const { machines, updateMachine, loading: machinesLoading, error: machinesError } = useMachines();
  
  const [machine, setMachine] = useState<Machine | null>(null);
  const [updatedMachine, setUpdatedMachine] = useState<Machine | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    components: true,
    metrics: true,
    status: true,
    maintenance: true
  });

  // Fetch and initialize machine data
  useEffect(() => {
    if (machines.length > 0 && machineId) {
      const foundMachine = machines.find(m => m.id === machineId);
      if (foundMachine) {
        // Ensure dates are properly converted when machine is loaded
        const machineWithDates = {
          ...foundMachine,
          maintenanceSchedule: foundMachine.maintenanceSchedule ? {
            ...foundMachine.maintenanceSchedule,
            nextDue: ensureDate(foundMachine.maintenanceSchedule.nextDue),
            lastCompleted: ensureDate(foundMachine.maintenanceSchedule.lastCompleted),
            tasks: foundMachine.maintenanceSchedule.tasks ?
              foundMachine.maintenanceSchedule.tasks.map(task => ({
                ...task,
                completedAt: ensureDate(task.completedAt)
              })) :
              []
          } : undefined
        };
        
        setMachine(machineWithDates);
        setUpdatedMachine(JSON.parse(JSON.stringify(machineWithDates)));
        
        // Set avatar URL based on machine type
        const machineType = foundMachine.type as keyof typeof MACHINE_AVATARS;
        const avatarOptions = MACHINE_AVATARS[machineType] || DEFAULT_AVATARS;
        setAvatarUrl(avatarOptions[0]);
      }
    }
  }, [machines, machineId]);

  const toggleExpanded = (section: string) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleEditMode = () => {
    if (isEditing) {
      // Discard changes and return to view mode
      setUpdatedMachine(machine ? JSON.parse(JSON.stringify(machine)) : null);
      setSuccess(null);
      setError(null);
    }
    setIsEditing(!isEditing);
  };

  const handleRemoveComponent = (componentId: string) => {
    if (!isEditing || !updatedMachine) return;
    
    const updatedComponents = updatedMachine.components.filter(c => c.id !== componentId);
    setUpdatedMachine({
      ...updatedMachine,
      components: updatedComponents
    });
  };

  const handleAddTask = (newTask: Partial<MaintenanceTask>) => {
    if (!updatedMachine) return;
    
    // Create a deep copy of updatedMachine to avoid mutation issues
    const updatedMachineCopy = JSON.parse(JSON.stringify(updatedMachine));
    
    if (!updatedMachineCopy.maintenanceSchedule) {
      updatedMachineCopy.maintenanceSchedule = {
        frequency: 'Monthly',
        tasks: [],
        nextDue: new Date(new Date().setMonth(new Date().getMonth() + 1))
      };
    }
    
    if (!updatedMachineCopy.maintenanceSchedule.tasks) {
      updatedMachineCopy.maintenanceSchedule.tasks = [];
    }
    
    updatedMachineCopy.maintenanceSchedule.tasks.push({
      ...newTask,
      id: crypto.randomUUID()
    });
    
    setUpdatedMachine(updatedMachineCopy);
  };

  const handleToggleTaskComplete = (taskId: string) => {
    if (!updatedMachine) return;
    
    // Create a deep copy of updatedMachine to avoid mutation issues
    const updatedMachineCopy = JSON.parse(JSON.stringify(updatedMachine));
    
    if (updatedMachineCopy.maintenanceSchedule?.tasks) {
      const taskIndex = updatedMachineCopy.maintenanceSchedule.tasks.findIndex((t: MaintenanceTask) => t.id === taskId);
      if (taskIndex >= 0) {
        const task = updatedMachineCopy.maintenanceSchedule.tasks[taskIndex];
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date() : undefined;
        updatedMachineCopy.maintenanceSchedule.tasks[taskIndex] = task;
        
        if (task.completed) {
          // Check if all tasks are complete, then update lastCompleted
          const allTasksComplete = updatedMachineCopy.maintenanceSchedule.tasks.every((t: MaintenanceTask) => t.completed);
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

  const handleUpdateStatus = (status: Machine['status']) => {
    if (!isEditing || !updatedMachine) return;
    
    setUpdatedMachine({
      ...updatedMachine,
      status
    });
  };

  const handleChangeMaintenanceFrequency = (frequency: MaintenanceFrequency) => {
    if (!isEditing || !updatedMachine) return;
    
    const updatedMachineCopy = { ...updatedMachine };
    
    if (!updatedMachineCopy.maintenanceSchedule) {
      updatedMachineCopy.maintenanceSchedule = {
        frequency,
        tasks: [],
        nextDue: new Date(new Date().setMonth(new Date().getMonth() + 1))
      };
    } else {
      updatedMachineCopy.maintenanceSchedule.frequency = frequency;
    }
    
    setUpdatedMachine(updatedMachineCopy);
  };

  const handleApplySuggestions = (suggestions: Partial<Machine>) => {
    if (!updatedMachine) return;
    
    // Apply AI suggestions to the machine
    setUpdatedMachine(prev => {
      if (!prev) return prev;
      
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
        if (!newMachine.maintenanceSchedule) {
          newMachine.maintenanceSchedule = {
            frequency: suggestions.maintenanceSchedule.frequency,
            tasks: suggestions.maintenanceSchedule.tasks || [],
            nextDue: suggestions.maintenanceSchedule.nextDue ? ensureDate(suggestions.maintenanceSchedule.nextDue) : new Date()
          };
        } else {
          newMachine.maintenanceSchedule = {
            ...newMachine.maintenanceSchedule,
            ...suggestions.maintenanceSchedule,
            nextDue: suggestions.maintenanceSchedule.nextDue ? ensureDate(suggestions.maintenanceSchedule.nextDue) : newMachine.maintenanceSchedule.nextDue,
            tasks: [
              ...(newMachine.maintenanceSchedule.tasks || []),
              ...(suggestions.maintenanceSchedule.tasks || [])
            ]
          };
        }
      }
      
      return newMachine;
    });
    
    // If not in edit mode, enter edit mode
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleSaveChanges = async () => {
    if (!updatedMachine) return;
    
    setSaveLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!updatedMachine.name) throw new Error('Machine name is required');
      if (!updatedMachine.description) throw new Error('Machine description is required');
      if (!updatedMachine.type) throw new Error('Machine type is required');
      
      await updateMachine(updatedMachine.id, updatedMachine);
      setSuccess('Machine updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      setIsEditing(false);
      setMachine(updatedMachine); // Update the local machine state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the machine');
    } finally {
      setSaveLoading(false);
    }
  };

  return {
    machine,
    updatedMachine,
    isEditing,
    showReport,
    showAIAssistant,
    saveLoading,
    error,
    success,
    avatarUrl,
    showAvatarSelector,
    expanded,
    machinesLoading,
    machinesError,
    setMachine,
    setUpdatedMachine,
    setIsEditing,
    setShowReport,
    setShowAIAssistant,
    setAvatarUrl,
    setShowAvatarSelector,
    toggleExpanded,
    toggleEditMode,
    handleRemoveComponent,
    handleAddTask,
    handleToggleTaskComplete,
    handleUpdateStatus,
    handleChangeMaintenanceFrequency,
    handleApplySuggestions,
    handleSaveChanges
  };
}