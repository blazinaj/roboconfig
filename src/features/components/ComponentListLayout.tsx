import React, { useState } from 'react';
import { Component, ComponentCategory } from '../../types';
import { Plus, Search, Loader2, AlertTriangle, Bot, Grid, List } from 'lucide-react';
import ComponentCard from './ComponentCard';
import ComponentListItem from './ComponentListItem';
import AIComponentListAssistant from './AIComponentListAssistant';

interface ComponentListLayoutProps {
  title: string;
  description: string;
  componentCategory: ComponentCategory;
  components: Component[];
  filteredComponents: Component[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showAIAssistant: boolean;
  setShowAIAssistant: (show: boolean) => void;
  setShowForm: (show: boolean) => void;
  setSelectedComponent: (component: Component | null) => void;
  onAddComponents: (components: Component[]) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ComponentListLayout: React.FC<ComponentListLayoutProps> = ({
  title,
  description,
  componentCategory,
  components,
  filteredComponents,
  searchQuery,
  setSearchQuery,
  showAIAssistant,
  setShowAIAssistant,
  setShowForm,
  setSelectedComponent,
  onAddComponents,
  loading,
  error
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-2">
          <AlertTriangle size={48} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Components</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className={`flex items-center px-4 py-2 ${
              showAIAssistant 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            } rounded-md hover:bg-blue-50 transition-colors`}
          >
            <Bot size={18} className="mr-2" />
            AI Generator
          </button>
          <button
            onClick={() => {
              setSelectedComponent(null);
              setShowForm(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            New {componentCategory} Component
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="w-full md:w-96">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${componentCategory.toLowerCase()} components...`}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex border border-gray-300 rounded-md overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            title="Grid View"
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            title="List View"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {showAIAssistant ? (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 lg:w-2/5 h-[600px]">
            <AIComponentListAssistant
              componentCategory={componentCategory}
              existingComponents={components}
              onAddComponents={onAddComponents}
              onClose={() => setShowAIAssistant(false)}
            />
          </div>
          <div className="w-full md:w-1/2 lg:w-3/5">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredComponents.map((component) => (
                  <ComponentCard
                    key={component.id}
                    component={component}
                    onSelect={setSelectedComponent}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredComponents.map((component) => (
                  <ComponentListItem
                    key={component.id}
                    component={component}
                    onSelect={setSelectedComponent}
                  />
                ))}
              </div>
            )}
            
            {filteredComponents.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-gray-400 mb-3">
                  <Search size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">No components found</h3>
                <p className="text-gray-500">
                  Try adjusting your search or add a new {componentCategory.toLowerCase()} component.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredComponents.map((component) => (
                <ComponentCard
                  key={component.id}
                  component={component}
                  onSelect={setSelectedComponent}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComponents.map((component) => (
                <ComponentListItem
                  key={component.id}
                  component={component}
                  onSelect={setSelectedComponent}
                />
              ))}
            </div>
          )}

          {filteredComponents.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-gray-400 mb-3">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No components found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or add a new {componentCategory.toLowerCase()} component.
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center">
                <button
                  onClick={() => setShowAIAssistant(true)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 inline-flex items-center justify-center"
                >
                  <Bot size={18} className="mr-2" />
                  Generate with AI
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center justify-center"
                >
                  <Plus size={18} className="mr-2" />
                  Add Manually
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ComponentListLayout;