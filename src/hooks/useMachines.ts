import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Machine, Component } from '../types';
import { Database } from '../lib/database.types';
import { useOrganization } from '../context/OrganizationContext';
import { v4 as uuidv4 } from 'uuid';
import { mapDbComponentToComponent } from './useComponents';

type DbMachine = Database['public']['Tables']['machines']['Row'];
type DbMaintenanceSchedule = Database['public']['Tables']['maintenance_schedules']['Row'];
type DbMaintenanceTask = Database['public']['Tables']['maintenance_tasks']['Row'];

const mapDbMachineToMachine = (
  dbMachine: DbMachine,
  components: Component[],
  maintenanceSchedule?: DbMaintenanceSchedule,
  maintenanceTasks?: DbMaintenanceTask[]
): Machine => ({
  id: dbMachine.id,
  name: dbMachine.name,
  description: dbMachine.description || '',
  type: dbMachine.type as Machine['type'],
  status: dbMachine.status as Machine['status'],
  components,
  createdAt: new Date(dbMachine.created_at!),
  updatedAt: new Date(dbMachine.updated_at!),
  organization_id: dbMachine.organization_id || undefined,
  maintenanceSchedule: maintenanceSchedule ? {
    id: maintenanceSchedule.id,
    frequency: maintenanceSchedule.frequency as any,
    lastCompleted: maintenanceSchedule.last_completed ? new Date(maintenanceSchedule.last_completed) : undefined,
    nextDue: maintenanceSchedule.next_due ? new Date(maintenanceSchedule.next_due) : undefined,
    tasks: maintenanceTasks?.map(task => ({
      id: task.id,
      name: task.name,
      description: task.description || '',
      priority: task.priority as any,
      estimatedDuration: task.estimated_duration,
      completed: task.completed || false,
      completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      notes: task.notes || undefined
    })) || []
  } : undefined
});

// Utility function to validate UUID format
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Utility function to ensure a value is a valid Date object
// Returns a proper Date object or null
const ensureDate = (date: any): Date | null => {
  if (!date) return null;
  if (date instanceof Date && !isNaN(date.getTime())) return date;
  
  // If it's a string or number, try to convert it to a Date
  try {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (e) {
    return null;
  }
};

export const useMachines = () => {
  const { currentOrganization } = useOrganization();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        if (!currentOrganization) {
          setMachines([]);
          setLoading(false);
          return;
        }

        // Fetch machines for the current organization
        const { data: machinesData, error: machinesError } = await supabase
          .from('machines')
          .select('*')
          .eq('organization_id', currentOrganization.id);

        if (machinesError) throw machinesError;

        // Fetch all related data in parallel
        const [
          { data: machineComponents },
          { data: components },
          { data: schedules },
          { data: tasks },
          { data: riskFactors }
        ] = await Promise.all([
          supabase.from('machine_components').select('*'),
          supabase.from('components').select('*'),
          supabase.from('maintenance_schedules').select('*'),
          supabase.from('maintenance_tasks').select('*'),
          supabase.from('risk_factors').select('*')
        ]);

        const mappedMachines = machinesData.map(machine => {
          // Get components for this machine
          const machineComponentIds = machineComponents
            ?.filter(mc => mc.machine_id === machine.id)
            .map(mc => mc.component_id) || [];

          // Properly map each component using the shared mapping function
          const machineComponentsData = machineComponentIds.map(componentId => {
            const dbComp = components?.find(c => c.id === componentId);
            if (!dbComp) return null;
            
            const compRiskFactors = riskFactors?.filter(rf => rf.component_id === componentId) || [];
            return mapDbComponentToComponent(dbComp, compRiskFactors);
          }).filter(Boolean) as Component[];

          // Get maintenance schedule and tasks
          const schedule = schedules?.find(s => s.machine_id === machine.id);
          const machineTasks = tasks?.filter(t => t.schedule_id === schedule?.id);

          return mapDbMachineToMachine(
            machine,
            machineComponentsData,
            schedule as any,
            machineTasks as any
          );
        });

        setMachines(mappedMachines);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();

    // Subscribe to changes
    const machinesSubscription = supabase
      .channel('machines_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'machines' }, () => {
        fetchMachines();
      })
      .subscribe();

    return () => {
      machinesSubscription.unsubscribe();
    };
  }, [currentOrganization]);

  const addMachine = async (machine: Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentOrganization) {
      setError('No organization selected');
      throw new Error('No organization selected');
    }

    try {
      // First, ensure all components exist and are properly created in the database
      const organizationId = currentOrganization.id;
      const componentMappings = await ensureComponentsExist(machine.components, organizationId);
      
      // Now insert the machine
      const { data: machineData, error: machineError } = await supabase
        .from('machines')
        .insert([{
          name: machine.name,
          description: machine.description,
          type: machine.type,
          status: machine.status,
          organization_id: currentOrganization.id
        }])
        .select()
        .single();

      if (machineError) throw machineError;

      // Add components if any
      if (componentMappings.length > 0) {
        const { error: componentsError } = await supabase
          .from('machine_components')
          .insert(
            componentMappings.map(mapping => ({
              machine_id: machineData.id,
              component_id: mapping.dbId
            }))
          );

        if (componentsError) throw componentsError;
      }

      // Add maintenance schedule if provided
      if (machine.maintenanceSchedule) {
        // Calculate next due date based on frequency if not provided
        let nextDue = ensureDate(machine.maintenanceSchedule.nextDue);
        if (!nextDue) {
          nextDue = new Date();
          switch (machine.maintenanceSchedule.frequency) {
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
        }

        const { data: scheduleData, error: scheduleError } = await supabase
          .from('maintenance_schedules')
          .insert([{
            machine_id: machineData.id,
            frequency: machine.maintenanceSchedule.frequency,
            last_completed: machine.maintenanceSchedule.lastCompleted ? ensureDate(machine.maintenanceSchedule.lastCompleted)?.toISOString() : null,
            next_due: nextDue ? nextDue.toISOString() : null
          }])
          .select()
          .single();

        if (scheduleError) throw scheduleError;

        // Add maintenance tasks if available
        if (machine.maintenanceSchedule.tasks && machine.maintenanceSchedule.tasks.length > 0) {
          const { error: tasksError } = await supabase
            .from('maintenance_tasks')
            .insert(
              machine.maintenanceSchedule.tasks.map(task => ({
                schedule_id: scheduleData.id,
                name: task.name,
                description: task.description,
                priority: task.priority,
                estimated_duration: task.estimatedDuration,
                completed: task.completed || false,
                completed_at: task.completedAt ? ensureDate(task.completedAt)?.toISOString() : null,
                notes: task.notes
              }))
            );

          if (tasksError) throw tasksError;
        }
      }

      return machineData.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // Helper function to ensure all components exist in the database
  // Returns a mapping of component IDs to their database IDs
  const ensureComponentsExist = async (components: Component[], organizationId: string) => {
    const result = [];
    
    for (const component of components) {
      let dbComponentId;
      
      // Check if the component has a valid UUID
      if (isValidUUID(component.id)) {
        // Check if component already exists in the database by ID
        const { data: existingComponentById } = await supabase
          .from('components')
          .select('id')
          .eq('id', component.id)
          .maybeSingle();
        
        if (existingComponentById) {
          dbComponentId = existingComponentById.id;
        }
      }
      
      // If no component found by ID, try to find by name and category
      if (!dbComponentId) {
        const { data: existingComponentByName } = await supabase
          .from('components')
          .select('id')
          .eq('name', component.name)
          .eq('category', component.category)
          .maybeSingle();
        
        if (existingComponentByName) {
          dbComponentId = existingComponentByName.id;
        }
      }
      
      // If component still doesn't exist, create it
      if (!dbComponentId) {
        // Generate a new UUID for this component
        const newComponentId = uuidv4();
        
        // Create the component in the database
        const { data: newComponent, error: componentError } = await supabase
          .from('components')
          .insert([{
            id: newComponentId,
            name: component.name,
            category: component.category,
            type: component.type,
            description: component.description,
            specifications: component.specifications || {}, // Ensure specifications is always an object
            organization_id: organizationId
          }])
          .select('id')
          .single();
        
        if (componentError) throw componentError;
        
        dbComponentId = newComponent.id;
        
        // Add risk factors if any
        if (component.riskFactors && component.riskFactors.length > 0) {
          await supabase
            .from('risk_factors')
            .insert(
              component.riskFactors.map(rf => ({
                component_id: dbComponentId,
                name: rf.name,
                severity: rf.severity,
                probability: rf.probability,
                description: rf.description
              }))
            );
        }
      }
      
      result.push({ originalId: component.id, dbId: dbComponentId });
    }
    
    return result;
  };

  const updateMachine = async (id: string, updates: Partial<Machine>) => {
    try {
      // Update machine
      const { error: machineError } = await supabase
        .from('machines')
        .update({
          name: updates.name,
          description: updates.description,
          type: updates.type,
          status: updates.status
        })
        .eq('id', id);

      if (machineError) throw machineError;

      // Update components if provided
      if (updates.components) {
        // First ensure all components exist in the database
        const organizationId = currentOrganization?.id;
        if (!organizationId) {
          throw new Error('No organization selected');
        }
        
        const componentMappings = await ensureComponentsExist(updates.components, organizationId);
        
        // Delete existing components
        const { error: deleteError } = await supabase
          .from('machine_components')
          .delete()
          .eq('machine_id', id);

        if (deleteError) throw deleteError;
        
        // Insert new components
        if (componentMappings.length > 0) {
          const { error: componentsError } = await supabase
            .from('machine_components')
            .insert(
              componentMappings.map(mapping => ({
                machine_id: id,
                component_id: mapping.dbId
              }))
            );

          if (componentsError) throw componentsError;
        }
      }

      // Update maintenance schedule if provided
      if (updates.maintenanceSchedule) {
        const { data: existingSchedule, error: scheduleQueryError } = await supabase
          .from('maintenance_schedules')
          .select()
          .eq('machine_id', id)
          .maybeSingle();

        if (scheduleQueryError) throw scheduleQueryError;

        // Calculate next due date based on frequency if not provided
        let nextDue = ensureDate(updates.maintenanceSchedule.nextDue);
        if (!nextDue) {
          nextDue = new Date();
          switch (updates.maintenanceSchedule.frequency) {
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
        }

        const lastCompletedDate = ensureDate(updates.maintenanceSchedule.lastCompleted);

        if (existingSchedule) {
          // Update existing schedule
          const { error: scheduleError } = await supabase
            .from('maintenance_schedules')
            .update({
              frequency: updates.maintenanceSchedule.frequency,
              last_completed: lastCompletedDate ? lastCompletedDate.toISOString() : null,
              next_due: nextDue ? nextDue.toISOString() : null
            })
            .eq('id', existingSchedule.id);

          if (scheduleError) throw scheduleError;

          // Update tasks if provided
          if (updates.maintenanceSchedule.tasks) {
            // Delete existing tasks
            const { error: deleteTasksError } = await supabase
              .from('maintenance_tasks')
              .delete()
              .eq('schedule_id', existingSchedule.id);

            if (deleteTasksError) throw deleteTasksError;

            // Insert new tasks
            if (updates.maintenanceSchedule.tasks.length > 0) {
              const { error: tasksError } = await supabase
                .from('maintenance_tasks')
                .insert(
                  updates.maintenanceSchedule.tasks.map(task => ({
                    schedule_id: existingSchedule.id,
                    name: task.name,
                    description: task.description,
                    priority: task.priority,
                    estimated_duration: task.estimatedDuration,
                    completed: task.completed,
                    completed_at: task.completedAt ? ensureDate(task.completedAt)?.toISOString() : null,
                    notes: task.notes
                  }))
                );

              if (tasksError) throw tasksError;
            }
          }
        } else {
          // Create new schedule
          const { data: scheduleData, error: scheduleError } = await supabase
            .from('maintenance_schedules')
            .insert([{
              machine_id: id,
              frequency: updates.maintenanceSchedule.frequency,
              last_completed: lastCompletedDate ? lastCompletedDate.toISOString() : null,
              next_due: nextDue ? nextDue.toISOString() : null
            }])
            .select()
            .single();

          if (scheduleError) throw scheduleError;

          // Add tasks
          if (updates.maintenanceSchedule.tasks && updates.maintenanceSchedule.tasks.length > 0) {
            const { error: tasksError } = await supabase
              .from('maintenance_tasks')
              .insert(
                updates.maintenanceSchedule.tasks.map(task => ({
                  schedule_id: scheduleData.id,
                  name: task.name,
                  description: task.description,
                  priority: task.priority,
                  estimated_duration: task.estimatedDuration,
                  completed: task.completed,
                  completed_at: task.completedAt ? ensureDate(task.completedAt)?.toISOString() : null,
                  notes: task.notes
                }))
              );

            if (tasksError) throw tasksError;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteMachine = async (id: string) => {
    try {
      const { error } = await supabase
        .from('machines')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  return {
    machines,
    loading,
    error,
    addMachine,
    updateMachine,
    deleteMachine
  };
};