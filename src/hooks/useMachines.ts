import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Machine, Component } from '../types';
import { Database } from '../lib/database.types';
import { useSampleData } from '../context/SampleDataContext';

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
  maintenanceSchedule: maintenanceSchedule ? {
    id: maintenanceSchedule.id,
    frequency: maintenanceSchedule.frequency as any,
    lastCompleted: maintenanceSchedule.last_completed ? new Date(maintenanceSchedule.last_completed) : undefined,
    nextDue: new Date(maintenanceSchedule.next_due!),
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

export const useMachines = () => {
  const { useSampleData: useSample, getSampleMachines } = useSampleData();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (useSample) {
      setMachines(getSampleMachines());
      setLoading(false);
      return;
    }

    const fetchMachines = async () => {
      try {
        // Fetch machines
        const { data: machinesData, error: machinesError } = await supabase
          .from('machines')
          .select('*');

        if (machinesError) throw machinesError;

        // Fetch all related data in parallel
        const [
          { data: machineComponents },
          { data: components },
          { data: schedules },
          { data: tasks }
        ] = await Promise.all([
          supabase.from('machine_components').select('*'),
          supabase.from('components').select('*, risk_factors(*)'),
          supabase.from('maintenance_schedules').select('*'),
          supabase.from('maintenance_tasks').select('*')
        ]);

        const mappedMachines = machinesData.map(machine => {
          // Get components for this machine
          const machineComponentIds = machineComponents
            ?.filter(mc => mc.machine_id === machine.id)
            .map(mc => mc.component_id) || [];

          const machineComponentsData = components
            ?.filter(c => machineComponentIds.includes(c.id))
            .map(component => ({
              ...component,
              riskFactors: component.risk_factors
            })) || [];

          // Get maintenance schedule and tasks
          const schedule = schedules?.find(s => s.machine_id === machine.id);
          const machineTasks = tasks?.filter(t => t.schedule_id === schedule?.id);

          return mapDbMachineToMachine(
            machine,
            machineComponentsData as any,
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
  }, [useSample]);

  const addMachine = async (machine: Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (useSample) {
      setError('Cannot modify sample data');
      throw new Error('Cannot modify sample data');
    }

    try {
      // Insert machine
      const { data: machineData, error: machineError } = await supabase
        .from('machines')
        .insert([{
          name: machine.name,
          description: machine.description,
          type: machine.type,
          status: machine.status
        }])
        .select()
        .single();

      if (machineError) throw machineError;

      // Add components
      if (machine.components.length > 0) {
        const { error: componentsError } = await supabase
          .from('machine_components')
          .insert(
            machine.components.map(component => ({
              machine_id: machineData.id,
              component_id: component.id
            }))
          );

        if (componentsError) throw componentsError;
      }

      // Add maintenance schedule if provided
      if (machine.maintenanceSchedule) {
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('maintenance_schedules')
          .insert([{
            machine_id: machineData.id,
            frequency: machine.maintenanceSchedule.frequency,
            last_completed: machine.maintenanceSchedule.lastCompleted?.toISOString(),
            next_due: machine.maintenanceSchedule.nextDue.toISOString()
          }])
          .select()
          .single();

        if (scheduleError) throw scheduleError;

        // Add maintenance tasks
        if (machine.maintenanceSchedule.tasks.length > 0) {
          const { error: tasksError } = await supabase
            .from('maintenance_tasks')
            .insert(
              machine.maintenanceSchedule.tasks.map(task => ({
                schedule_id: scheduleData.id,
                name: task.name,
                description: task.description,
                priority: task.priority,
                estimated_duration: task.estimatedDuration,
                completed: task.completed,
                completed_at: task.completedAt?.toISOString(),
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

  const updateMachine = async (id: string, updates: Partial<Machine>) => {
    if (useSample) {
      setError('Cannot modify sample data');
      throw new Error('Cannot modify sample data');
    }

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
        // Delete existing components
        const { error: deleteError } = await supabase
          .from('machine_components')
          .delete()
          .eq('machine_id', id);

        if (deleteError) throw deleteError;

        // Insert new components
        const { error: componentsError } = await supabase
          .from('machine_components')
          .insert(
            updates.components.map(component => ({
              machine_id: id,
              component_id: component.id
            }))
          );

        if (componentsError) throw componentsError;
      }

      // Update maintenance schedule if provided
      if (updates.maintenanceSchedule) {
        const { data: existingSchedule } = await supabase
          .from('maintenance_schedules')
          .select()
          .eq('machine_id', id)
          .single();

        if (existingSchedule) {
          // Update existing schedule
          const { error: scheduleError } = await supabase
            .from('maintenance_schedules')
            .update({
              frequency: updates.maintenanceSchedule.frequency,
              last_completed: updates.maintenanceSchedule.lastCompleted?.toISOString(),
              next_due: updates.maintenanceSchedule.nextDue.toISOString()
            })
            .eq('id', existingSchedule.id);

          if (scheduleError) throw scheduleError;

          // Update tasks
          if (updates.maintenanceSchedule.tasks) {
            // Delete existing tasks
            const { error: deleteTasksError } = await supabase
              .from('maintenance_tasks')
              .delete()
              .eq('schedule_id', existingSchedule.id);

            if (deleteTasksError) throw deleteTasksError;

            // Insert new tasks
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
                  completed_at: task.completedAt?.toISOString(),
                  notes: task.notes
                }))
              );

            if (tasksError) throw tasksError;
          }
        } else {
          // Create new schedule
          const { data: scheduleData, error: scheduleError } = await supabase
            .from('maintenance_schedules')
            .insert([{
              machine_id: id,
              frequency: updates.maintenanceSchedule.frequency,
              last_completed: updates.maintenanceSchedule.lastCompleted?.toISOString(),
              next_due: updates.maintenanceSchedule.nextDue.toISOString()
            }])
            .select()
            .single();

          if (scheduleError) throw scheduleError;

          // Add tasks
          if (updates.maintenanceSchedule.tasks.length > 0) {
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
                  completed_at: task.completedAt?.toISOString(),
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
    if (useSample) {
      setError('Cannot modify sample data');
      throw new Error('Cannot modify sample data');
    }

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