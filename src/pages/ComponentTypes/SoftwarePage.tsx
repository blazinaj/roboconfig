import React, { useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { Component } from '../../types';
import { componentData } from '../../data/componentData';
import ComponentCard from '../../components/ComponentCard';
import SoftwareForm from '../../components/ComponentForms/SoftwareForm';
import { Plus, Search } from 'lucide-react';

const SoftwarePage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);

  const softwareComponents = componentData.filter(
    component => component.category === 'Software'
  );

  const filteredComponents = softwareComponents.filter(component =>
    component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (componentData: Partial<Component>) => {
    // Handle component creation/update
    console.log('Component data:', componentData);
    setShowForm(false);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Software Components</h1>
            <p className="text-gray-600">Manage software and control systems</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            New Software Component
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search software components..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {showForm ? (
          <SoftwareForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            initialData={selectedComponent || undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComponents.map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                onSelect={setSelectedComponent}
              />
            ))}
          </div>
        )}

        {!showForm && filteredComponents.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 mb-3">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No components found</h3>
            <p className="text-gray-500">
              Try adjusting your search or add a new software component.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SoftwarePage;