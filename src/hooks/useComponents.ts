import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Component } from '../types';
import { Database } from '../lib/database.types';
import { useSampleData } from '../context/SampleDataContext';

type DbComponent = Database['public']['Tables']['components']['Row'];
type DbRiskFactor = Database['public']['Tables']['risk_factors']['Row'];

const mapDbComponentToComponent = (
  dbComponent: DbComponent,
  riskFactors: DbRiskFactor[]
): Component => ({
  id: dbComponent.id,
  name: dbComponent.name,
  category: dbComponent.category as Component['category'],
  type: dbComponent.type,
  description: dbComponent.description || '',
  specifications: dbComponent.specifications as Record<string, string | number>,
  riskFactors: riskFactors.map(rf => ({
    id: rf.id,
    name: rf.name,
    severity: rf.severity as 1 | 2 | 3 | 4 | 5,
    probability: rf.probability as 1 | 2 | 3 | 4 | 5,
    description: rf.description || ''
  }))
});

export const useComponents = () => {
  const { useSampleData: useSample, getSampleComponents } = useSampleData();
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (useSample) {
      setComponents(getSampleComponents());
      setLoading(false);
      return;
    }

    const fetchComponents = async () => {
      try {
        const { data: componentsData, error: componentsError } = await supabase
          .from('components')
          .select('*');

        if (componentsError) throw componentsError;

        const { data: riskFactorsData, error: riskFactorsError } = await supabase
          .from('risk_factors')
          .select('*');

        if (riskFactorsError) throw riskFactorsError;

        const mappedComponents = componentsData.map(component => 
          mapDbComponentToComponent(
            component,
            riskFactorsData.filter(rf => rf.component_id === component.id)
          )
        );

        setComponents(mappedComponents);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();

    // Subscribe to changes
    const componentsSubscription = supabase
      .channel('components_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'components' }, () => {
        fetchComponents();
      })
      .subscribe();

    return () => {
      componentsSubscription.unsubscribe();
    };
  }, [useSample]);

  const addComponent = async (component: Omit<Component, 'id'>) => {
    if (useSample) {
      setError('Cannot modify sample data');
      throw new Error('Cannot modify sample data');
    }

    try {
      const { data: componentData, error: componentError } = await supabase
        .from('components')
        .insert([{
          name: component.name,
          category: component.category,
          type: component.type,
          description: component.description,
          specifications: component.specifications
        }])
        .select()
        .single();

      if (componentError) throw componentError;

      if (component.riskFactors.length > 0) {
        const { error: riskFactorsError } = await supabase
          .from('risk_factors')
          .insert(
            component.riskFactors.map(rf => ({
              component_id: componentData.id,
              name: rf.name,
              severity: rf.severity,
              probability: rf.probability,
              description: rf.description
            }))
          );

        if (riskFactorsError) throw riskFactorsError;
      }

      return componentData.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateComponent = async (id: string, updates: Partial<Component>) => {
    if (useSample) {
      setError('Cannot modify sample data');
      throw new Error('Cannot modify sample data');
    }

    try {
      const { error: componentError } = await supabase
        .from('components')
        .update({
          name: updates.name,
          category: updates.category,
          type: updates.type,
          description: updates.description,
          specifications: updates.specifications
        })
        .eq('id', id);

      if (componentError) throw componentError;

      if (updates.riskFactors) {
        // Delete existing risk factors
        const { error: deleteError } = await supabase
          .from('risk_factors')
          .delete()
          .eq('component_id', id);

        if (deleteError) throw deleteError;

        // Insert new risk factors
        const { error: insertError } = await supabase
          .from('risk_factors')
          .insert(
            updates.riskFactors.map(rf => ({
              component_id: id,
              name: rf.name,
              severity: rf.severity,
              probability: rf.probability,
              description: rf.description
            }))
          );

        if (insertError) throw insertError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteComponent = async (id: string) => {
    if (useSample) {
      setError('Cannot modify sample data');
      throw new Error('Cannot modify sample data');
    }

    try {
      const { error } = await supabase
        .from('components')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  return {
    components,
    loading,
    error,
    addComponent,
    updateComponent,
    deleteComponent
  };
};