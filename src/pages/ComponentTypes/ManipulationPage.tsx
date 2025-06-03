import React, { useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { Component } from '../../types';
import ComponentDetails from '../../components/ComponentDetails';
import ManipulationForm from '../../components/ComponentForms/ManipulationForm';
import { useComponents } from '../../hooks/useComponents';
import ComponentListLayout from '../../features/components/ComponentListLayout';

const ManipulationPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const { components, loading, error, addComponent, updateComponent, refreshComponents } = useComponents();

  // Filter for Object Manipulation components from the database
  const manipulationComponents = components.filter(
    component => component.category === 'Object Manipulation'
  );

  const filteredComponents = manipulationComponents.filter(component =>
    component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (componentData: Partial<Component>) => {
    try {
      if (selectedComponent) {
        await updateComponent(selectedComponent.id, componentData);
      } else {
        await addComponent(componentData as Omit<Component, 'id'>);
      }
      setShowForm(false);
      setSelectedComponent(null);
    } catch (error) {
      console.error('Error saving component:', error);
    }
  };

  const handleUpdateComponent = async (updatedComponent: Component) => {
    try {
      await updateComponent(updatedComponent.id, updatedComponent);
      setSelectedComponent(null);
    } catch (error) {
      console.error('Error updating component:', error);
    }
  };

  const handleAddComponents = async (components: Component[]) => {
    try {
      for (const component of components) {
        await addComponent({
          name: component.name,
          category: component.category,
          type: component.type,
          description: component.description,
          specifications: component.specifications,
          riskFactors: component.riskFactors,
        });
      }
      
      // After adding all components, refresh the component list
      await refreshComponents();
    } catch (error) {
      console.error('Error adding components:', error);
    }
  };

  return (
    <MainLayout>
      {showForm ? (
        <ManipulationForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          initialData={selectedComponent || undefined}
        />
      ) : (
        <ComponentListLayout
          title="Manipulation Components"
          description="Manage robotic arms, grippers, and manipulation tools"
          componentCategory="Object Manipulation"
          components={components}
          filteredComponents={filteredComponents}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showAIAssistant={showAIAssistant}
          setShowAIAssistant={setShowAIAssistant}
          setShowForm={setShowForm}
          setSelectedComponent={setSelectedComponent}
          onAddComponents={handleAddComponents}
          loading={loading}
          error={error}
        />
      )}

      {selectedComponent && !showForm && (
        <ComponentDetails
          component={selectedComponent}
          onClose={() => setSelectedComponent(null)}
          onUpdate={handleUpdateComponent}
        />
      )}
    </MainLayout>
  );
};

export default ManipulationPage;