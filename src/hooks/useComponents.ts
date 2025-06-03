import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Component } from '../types';
import { Database } from '../lib/database.types';
import { useOrganization } from '../context/OrganizationContext';

type DbComponent = Database['public']['Tables']['components']['Row'];
type DbRiskFactor = Database['public']['Tables']['risk_factors']['Row'];

// Export this function so it can be reused in other hooks
export const mapDbComponentToComponent = (
  dbComponent: DbComponent,
  riskFactors: DbRiskFactor[]
): Component => ({
  id: dbComponent.id,
  name: dbComponent.name,
  category: dbComponent.category as Component['category'],
  type: dbComponent.type,
  description: dbComponent.description || '',
  specifications: (dbComponent.specifications || {}) as Record<string, string | number>,
  organization_id: dbComponent.organization_id || undefined,
  riskFactors: riskFactors.map(rf => ({
    id: rf.id,
    name: rf.name,
    severity: rf.severity as 1 | 2 | 3 | 4 | 5,
    probability: rf.probability as 1 | 2 | 3 | 4 | 5,
    description: rf.description || ''
  }))
});

export const useComponents = () => {
  const { currentOrganization } = useOrganization();
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComponents = async () => {
    try {
      if (!currentOrganization) {
        setComponents([]);
        setLoading(false);
        return;
      }
      
      // Query with organization filter
      const { data: componentsData, error: componentsError } = await supabase
        .from('components')
        .select('*')
        .eq('organization_id', currentOrganization.id);

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

  useEffect(() => {
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
  }, [currentOrganization]);

  const addComponent = async (component: Omit<Component, 'id'>) => {
    if (!currentOrganization) {
      setError('No organization selected');
      throw new Error('No organization selected');
    }

    try {
      const { data: componentData, error: componentError } = await supabase
        .from('components')
        .insert([{
          name: component.name,
          category: component.category,
          type: component.type,
          description: component.description,
          specifications: component.specifications,
          organization_id: currentOrganization.id
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

      // Refresh the component list after adding a new component
      await fetchComponents();
      
      return componentData.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateComponent = async (id: string, updates: Partial<Component>) => {
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

      // Refresh the component list after updating
      await fetchComponents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteComponent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('components')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh the component list after deleting
      await fetchComponents();
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
    deleteComponent,
    refreshComponents: fetchComponents  // Export the refresh function for manual refresh
  };
};