import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import CategoryGrid from '../components/CategoryGrid';
import ComponentCard from '../components/ComponentCard';
import ComponentDetails from '../components/ComponentDetails';
import { Component, ComponentCategory } from '../types';
import { useComponents } from '../hooks/useComponents';
import { Search, Filter, X, Loader2 } from 'lucide-react';

const ComponentsPage: React.FC = () => {
  const { components, loading, error, updateComponent } = useComponents();
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  
  const handleSelectCategory = (category: ComponentCategory) => {
    setSelectedCategory(category);
  };
  
  const filteredComponents = components.filter((component) => {
    // First filter by selected category if any
    const matchesCategory = selectedCategory ? component.category === selectedCategory : true;
    
    // Then filter by search query
    const matchesSearch = searchQuery === '' || 
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.type.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesCategory && matchesSearch;
  });

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleUpdateComponent = async (updatedComponent: Component) => {
    try {
      await updateComponent(updatedComponent.id, updatedComponent);
      setSelectedComponent(null);
    } catch (err) {
      console.error('Failed to update component:', err);
      // You might want to show an error notification here
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-red-600 mb-2">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Components</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Components</h1>
            <p className="text-gray-600">Browse and configure robotics components</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
              <Filter size={20} />
            </button>
          </div>
        </div>
        
        {(selectedCategory || searchQuery) && (
          <div className="flex items-center mb-4">
            <span className="text-sm text-gray-600 mr-2">Filters:</span>
            {selectedCategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2">
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mr-2">
                "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 text-gray-600 hover:text-gray-800"
                >
                  <X size={14} />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
      
      {!selectedCategory && !searchQuery ? (
        <CategoryGrid onSelectCategory={handleSelectCategory} />
      ) : (
        <>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedCategory ? `${selectedCategory} Components` : 'Search Results'}
            </h2>
            <p className="text-sm text-gray-600">
              {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComponents.map((component) => (
              <ComponentCard 
                key={component.id} 
                component={component} 
                onSelect={setSelectedComponent}
              />
            ))}
          </div>
          
          {filteredComponents.length === 0 && (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="text-gray-400 mb-3">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No components found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}
      
      {selectedComponent && (
        <ComponentDetails
          component={selectedComponent}
          onClose={() => setSelectedComponent(null)}
          onUpdate={handleUpdateComponent}
        />
      )}
    </MainLayout>
  );
};

export default ComponentsPage;