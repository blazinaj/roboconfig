import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Supplier } from '../types';
import { useOrganization } from '../context/OrganizationContext';

export const useSuppliers = () => {
  const { currentOrganization } = useOrganization();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers();

    // Subscribe to changes
    const suppliersSubscription = supabase
      .channel('suppliers_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'suppliers' }, 
        () => fetchSuppliers()
      )
      .subscribe();

    return () => {
      suppliersSubscription.unsubscribe();
    };
  }, [currentOrganization]);

  const fetchSuppliers = async () => {
    try {
      if (!currentOrganization) {
        setSuppliers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('name');

      if (error) throw error;

      // Format dates
      const formattedSuppliers = data.map(supplier => ({
        ...supplier,
        created_at: new Date(supplier.created_at),
        updated_at: new Date(supplier.updated_at)
      }));

      setSuppliers(formattedSuppliers);
      setError(null);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    if (!currentOrganization) {
      throw new Error('No organization selected');
    }

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{
          ...supplier,
          organization_id: currentOrganization.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchSuppliers();
      return data;
    } catch (err) {
      console.error('Error adding supplier:', err);
      throw err;
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchSuppliers();
    } catch (err) {
      console.error('Error updating supplier:', err);
      throw err;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchSuppliers();
    } catch (err) {
      console.error('Error deleting supplier:', err);
      throw err;
    }
  };

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier
  };
};