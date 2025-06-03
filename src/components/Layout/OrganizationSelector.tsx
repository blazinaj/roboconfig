import React, { useState } from 'react';
import { Building, ChevronDown, ChevronUp, Plus, Users, Settings } from 'lucide-react';
import { useOrganization } from '../../context/OrganizationContext';
import { Organization } from '../../types';

export const OrganizationSelector: React.FC = () => {
  const { 
    organizations, 
    currentOrganization, 
    setCurrentOrganization,
    createOrganization,
    loading
  } = useOrganization();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (showCreateForm) setShowCreateForm(false);
  };

  const handleSelectOrg = (org: Organization) => {
    setCurrentOrganization(org);
    setIsOpen(false);
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    
    try {
      setCreateError(null);
      await createOrganization(newOrgName);
      setNewOrgName('');
      setShowCreateForm(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create organization');
    }
  };

  if (!organizations || organizations.length === 0) {
    return (
      <div className="px-3 py-2">
        {showCreateForm ? (
          <form onSubmit={handleCreateOrganization}>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Create Organization
            </label>
            <div className="flex items-center space-x-1">
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Organization name"
                className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <Plus size={16} />
                )}
              </button>
            </div>
            {createError && (
              <p className="text-xs text-red-400 mt-1">{createError}</p>
            )}
          </form>
        ) : (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full flex items-center px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
          >
            <Plus size={16} className="mr-2" />
            Create Organization
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-between w-full px-3 py-2 text-white bg-gray-800 rounded hover:bg-gray-700"
      >
        <div className="flex items-center">
          <Building size={16} className="mr-2 text-gray-400" />
          <span className="text-sm font-medium truncate max-w-[150px]">
            {currentOrganization?.name || 'Select Organization'}
          </span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-56 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-1">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleSelectOrg(org)}
                className={`w-full text-left px-4 py-2 text-sm ${
                  currentOrganization?.id === org.id
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center">
                  <Building size={16} className="mr-2 text-gray-400" />
                  <span className="truncate">{org.name}</span>
                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
                    {org.role}
                  </span>
                </div>
              </button>
            ))}
            
            <hr className="my-1 border-gray-700" />
            
            {showCreateForm ? (
              <div className="px-4 py-2">
                <form onSubmit={handleCreateOrganization}>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    New Organization
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="Organization name"
                      className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        <Plus size={16} />
                      )}
                    </button>
                  </div>
                  {createError && (
                    <p className="text-xs text-red-400 mt-1">{createError}</p>
                  )}
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-gray-800 flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Create New Organization
              </button>
            )}
            
            {currentOrganization && (
              <>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center"
                >
                  <Users size={16} className="mr-2" />
                  Manage Members
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center"
                >
                  <Settings size={16} className="mr-2" />
                  Organization Settings
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};