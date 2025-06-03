import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { useOrganization } from '../context/OrganizationContext';
import { Building, Users, Trash2, Save, ArrowLeft } from 'lucide-react';

const OrganizationSettingsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    organizations,
    currentOrganization,
    organizationMembers,
    updateOrganization,
    removeMember,
    loading,
    error
  } = useOrganization();
  
  const [orgName, setOrgName] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Find the organization by ID
    const organization = organizations.find(org => org.id === id);
    if (organization) {
      setOrgName(organization.name);
    } else {
      // Redirect if not found
      navigate('/organizations');
    }
  }, [id, organizations, navigate]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      setSaveError(null);
      await updateOrganization(id, { name: orgName });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update organization');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember(userId);
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const organization = organizations.find(org => org.id === id);
  const isOwner = organization?.role === 'owner';
  const isAdmin = organization?.role === 'admin' || isOwner;

  if (!organization) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <p>Organization not found.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <button
          onClick={() => navigate('/organizations')}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Organizations
        </button>

        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
            <p className="text-gray-600">{organization.name}</p>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organization Settings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
              </div>
              <form onSubmit={handleSaveSettings} className="p-6">
                {saveSuccess && (
                  <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-green-800">
                    Settings saved successfully.
                  </div>
                )}
                
                {saveError && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-800">
                    {saveError}
                  </div>
                )}

                <div className="mb-6">
                  <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="org-name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter organization name"
                    required
                    disabled={!isAdmin}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization URL
                  </label>
                  <div className="flex items-center">
                    <span className="bg-gray-100 px-3 py-2 text-gray-500 rounded-l-md border border-r-0 border-gray-300">
                      {window.location.origin}/org/
                    </span>
                    <input
                      type="text"
                      value={organization.slug}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 text-gray-500"
                      readOnly
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Logo
                  </label>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                      {organization.logo_url ? (
                        <img
                          src={organization.logo_url}
                          alt={`${organization.name} logo`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Building size={32} className="text-gray-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                      disabled={!isAdmin}
                    >
                      Upload Logo
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended size: 512x512px. Max file size: 2MB.
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>

            {isOwner && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
                </div>
                <div className="p-6">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h3 className="text-red-800 font-medium mb-2">Delete Organization</h3>
                    <p className="text-red-700 text-sm mb-4">
                      Permanently delete this organization and all its data. This action cannot be undone.
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete Organization
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Members */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Members</h2>
                {isAdmin && (
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Users size={14} className="mr-1" />
                    Invite
                  </button>
                )}
              </div>
              <ul className="divide-y divide-gray-200">
                {organizationMembers.map((member) => (
                  <li key={member.user_id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {member.full_name || 'Unnamed User'}
                        </h3>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs 
                          ${member.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                            member.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'}`}
                        >
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                        
                        {isOwner && member.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveMember(member.user_id)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}

                {organizationMembers.length === 0 && (
                  <li className="p-4 text-center text-gray-500">
                    No members found
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrganizationSettingsPage;