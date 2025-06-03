import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabase } from './SupabaseContext';
import { Organization, OrganizationMember } from '../types';

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  organizationMembers: OrganizationMember[];
  setCurrentOrganization: (org: Organization) => void;
  createOrganization: (name: string) => Promise<Organization>;
  updateOrganization: (id: string, updates: Partial<Organization>) => Promise<void>;
  inviteMember: (email: string, role: 'admin' | 'member') => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  fetchOrganizations: () => Promise<Organization[]>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useSupabase();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch organizations whenever the session changes
  useEffect(() => {
    if (session) {
      fetchOrganizations();
    } else {
      setOrganizations([]);
      setCurrentOrganization(null);
      setOrganizationMembers([]);
    }
  }, [session]);

  // Fetch members whenever the current organization changes
  useEffect(() => {
    if (currentOrganization) {
      fetchOrganizationMembers(currentOrganization.id);
    }
  }, [currentOrganization]);

  const fetchOrganizations = async (): Promise<Organization[]> => {
    if (!session) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      // Query organization_members first to get the organizations the user belongs to
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', session.user.id);
        
      if (memberError) throw memberError;
      
      if (!memberData || memberData.length === 0) {
        setOrganizations([]);
        setCurrentOrganization(null);
        return [];
      }
      
      // Get the organization IDs the user belongs to
      const orgIds = memberData.map(member => member.organization_id);
      
      // Create a map of organization ID to role for later use
      const roleMap = memberData.reduce((acc, member) => {
        acc[member.organization_id] = member.role;
        return acc;
      }, {});
      
      // Now fetch the actual organization data
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .in('id', orgIds)
        .order('created_at', { ascending: false });
        
      if (orgError) throw orgError;
      
      // Add the role to each organization
      const orgsWithRoles = orgData.map(org => ({
        ...org,
        role: roleMap[org.id]
      }));
      
      setOrganizations(orgsWithRoles || []);
      
      // Set current organization to the first one if not already set
      if (orgsWithRoles && orgsWithRoles.length > 0 && !currentOrganization) {
        setCurrentOrganization(orgsWithRoles[0]);
      }
      
      return orgsWithRoles || [];
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationMembers = async (orgId: string) => {
    if (!session) return;
    
    try {
      // Use organization_members table directly instead of the organization_users view
      // to avoid permission issues with the auth.users table
      const { data, error } = await supabase
        .from('organization_members')
        .select('id, user_id, role, created_at')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to match the expected OrganizationMember type
      const transformedData = data.map(member => ({
        organization_id: orgId,
        user_id: member.user_id,
        email: '', // We cannot access this due to permissions
        full_name: '', // We cannot access this due to permissions
        role: member.role,
        joined_at: member.created_at
      }));
      
      setOrganizationMembers(transformedData || []);
    } catch (err) {
      console.error('Error fetching organization members:', err);
    }
  };

  const createOrganization = async (name: string): Promise<Organization> => {
    if (!session) throw new Error('You must be logged in to create an organization');
    
    setLoading(true);
    setError(null);
    
    try {
      // Call the Edge Function instead of RPC
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-organization`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ name })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create organization');
      }
      
      const result = await response.json();
      
      // Fetch the updated list of organizations
      const updatedOrgs = await fetchOrganizations();
      
      // Find the newly created organization
      const newOrg = updatedOrgs.find(org => org.id === result.id);
      
      if (!newOrg) {
        throw new Error('Organization created but not found in the updated list');
      }
      
      // Set the new organization as current
      setCurrentOrganization(newOrg);
      
      return newOrg;
    } catch (err) {
      console.error('Error creating organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to create organization');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    if (!session) throw new Error('You must be logged in to update an organization');
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update the current organization if it's the one being updated
      if (currentOrganization && currentOrganization.id === id) {
        setCurrentOrganization({
          ...currentOrganization,
          ...updates
        });
      }
      
      // Refresh the list of organizations
      await fetchOrganizations();
    } catch (err) {
      console.error('Error updating organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to update organization');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (email: string, role: 'admin' | 'member') => {
    if (!session || !currentOrganization) {
      throw new Error('You must be logged in and have an active organization to invite members');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call the invite-member Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-member`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            organizationId: currentOrganization.id,
            email,
            role
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to invite member');
      }
      
      // Refresh the members list
      await fetchOrganizationMembers(currentOrganization.id);
    } catch (err) {
      console.error('Error inviting member:', err);
      setError(err instanceof Error ? err.message : 'Failed to invite member');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (userId: string) => {
    if (!session || !currentOrganization) {
      throw new Error('You must be logged in and have an active organization to remove members');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', currentOrganization.id)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // Refresh the members list
      await fetchOrganizationMembers(currentOrganization.id);
    } catch (err) {
      console.error('Error removing member:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove member');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    organizations,
    currentOrganization,
    organizationMembers,
    setCurrentOrganization,
    createOrganization,
    updateOrganization,
    inviteMember,
    removeMember,
    loading,
    error,
    fetchOrganizations
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};