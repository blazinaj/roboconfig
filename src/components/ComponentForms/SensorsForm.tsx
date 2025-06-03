import React, { useState } from 'react';
import { Component } from '../../types';
import { Eye, X, Bot } from 'lucide-react';
import AIComponentAssistant from './AIComponentAssistant';

interface SensorsFormProps {
  onSubmit: (component: Partial<Component>) => void;
  onCancel: () => void;
  initialData?: Component;
}

const SensorsForm: React.FC<SensorsFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'vision',
    description: initialData?.description || '',
    specifications: {
      range: initialData?.specifications?.range || '',
      resolution: initialData?.specifications?.resolution || '',
      accuracy: initialData?.specifications?.accuracy || '',
      updateRate: initialData?.specifications?.updateRate || '',
      interface: initialData?.specifications?.interface || '',
    }
  });
  
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      category: 'Sensors'
    });
  };

  const handleApplySuggestions = (suggestions: Partial<Component>) => {
    const updatedData = { ...formData };
    
    if (suggestions.name) {
      updatedData.name = suggestions.name;
    }
    
    if (suggestions.type) {
      updatedData.type = suggestions.type;
    }
    
    if (suggestions.description) {
      updatedData.description = suggestions.description;
    }
    
    if (suggestions.specifications) {
      updatedData.specifications = {
        ...updatedData.specifications,
        ...suggestions.specifications
      };
    }
    
    setFormData(updatedData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Eye className="text-indigo-500 mr-2" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Sensor Component</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${
              showAIAssistant
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="AI Assistant"
          >
            <Bot size={18} className="mr-1.5" />
            <span className="text-sm">AI Assistant</span>
          </button>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Component Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="vision">Vision</option>
                <option value="lidar">LiDAR</option>
                <option value="proximity">Proximity</option>
                <option value="force">Force</option>
                <option value="temperature">Temperature</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                required
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Range</label>
                  <input
                    type="text"
                    value={formData.specifications.range}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, range: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 0-100m"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Resolution</label>
                  <input
                    type="text"
                    value={formData.specifications.resolution}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, resolution: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 1920x1080"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Accuracy</label>
                  <input
                    type="text"
                    value={formData.specifications.accuracy}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, accuracy: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., ±0.1mm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Update Rate</label>
                  <input
                    type="text"
                    value={formData.specifications.updateRate}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, updateRate: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 60Hz"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Interface</label>
                  <input
                    type="text"
                    value={formData.specifications.interface}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, interface: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., USB 3.0, Ethernet"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Component
              </button>
            </div>
          </form>
        </div>

        {showAIAssistant && (
          <div className="w-80 flex-shrink-0 lg:border-l lg:border-0 border-t lg:border-t-0 border-gray-200">
            <AIComponentAssistant
              componentCategory="Sensors"
              currentData={formData}
              onApplySuggestions={handleApplySuggestions}
              onClose={() => setShowAIAssistant(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorsForm;