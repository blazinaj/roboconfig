import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { useOrganization } from '../context/OrganizationContext';
import { Plus, Users, Settings, Clock, Building, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrganizationsPage: React.FC = () => {
  const {
    organizations,
    currentOrganization,
    organizationMembers,
    setCurrentOrganization,
    createOrganization,
    loading,
    error,
    fetchOrganizations
  } = useOrganization();
  
  const [showNewOrgForm, setShowNewOrgForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    
    try {
      setFormError(null);
      await createOrganization(newOrgName);
      setNewOrgName('');
      setShowNewOrgForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create organization');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">Owner</span>;
      case 'admin':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Admin</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Member</span>;
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
            <p className="text-gray-600">Manage your organizations and team members</p>
          </div>
          <button
            onClick={() => setShowNewOrgForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            New Organization
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {showNewOrgForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Organization</h3>
            <form onSubmit={handleCreateOrg}>
              <div className="mb-4">
                <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  id="org-name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter organization name"
                  required
                />
                {formError && <p className="mt-1 text-sm text-red-600">{formError}</p>}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrgForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Organization'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organizations List */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Organizations</h2>
            {organizations.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <ul>
                  {organizations.map((org) => (
                    <li key={org.id} className="border-b border-gray-200 last:border-0">
                      <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white mr-4">
                            {org.logo_url ? (
                              <img 
                                src={org.logo_url} 
                                alt={org.name} 
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Building size={24} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{org.name}</h3>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock size={14} className="mr-1" />
                              <span>Created {new Date(org.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getRoleBadge(org.role)}
                          <div className="ml-4 flex space-x-2">
                            <button
                              onClick={() => setCurrentOrganization(org)}
                              className={`px-3 py-1 rounded ${
                                currentOrganization?.id === org.id
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {currentOrganization?.id === org.id ? 'Selected' : 'Select'}
                            </button>
                            <button
                              onClick={() => navigate(`/organizations/${org.id}/settings`)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <Settings size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <Building size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations Yet</h3>
                <p className="text-gray-600 mb-4">Create your first organization to start collaborating.</p>
                <button
                  onClick={() => setShowNewOrgForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Organization
                </button>
              </div>
            )}
          </div>

          {/* Members of Current Organization */}
          {currentOrganization && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  <Users size={16} className="inline mr-1" /> Invite Member
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <ul>
                  {organizationMembers.map((member) => (
                    <li key={member.user_id} className="border-b border-gray-200 last:border-0">
                      <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                            <User size={20} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {member.full_name || 'Unnamed User'}
                            </h3>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        <div>
                          {getRoleBadge(member.role)}
                        </div>
                      </div>
                    </li>
                  ))}

                  {organizationMembers.length === 0 && (
                    <li className="p-4 text-center text-gray-500">
                      No members in this organization yet
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default OrganizationsPage;