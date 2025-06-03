import React, { useState } from 'react';
import { Component } from '../../types';
import { Hand, X, Bot } from 'lucide-react';
import AIComponentAssistant from './AIComponentAssistant';

interface ManipulationFormProps {
  onSubmit: (component: Partial<Component>) => void;
  onCancel: () => void;
  initialData?: Component;
}

const ManipulationForm: React.FC<ManipulationFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'gripper',
    description: initialData?.description || '',
    specifications: {
      payload: initialData?.specifications?.payload || '',
      reach: initialData?.specifications?.reach || '',
      accuracy: initialData?.specifications?.accuracy || '',
      speed: initialData?.specifications?.speed || '',
      dimensions: initialData?.specifications?.dimensions || '',
    }
  });
  
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      category: 'Object Manipulation'
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
          <Hand className="text-red-500 mr-2" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Manipulation Component</h2>
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
                <option value="gripper">Gripper</option>
                <option value="arm">Robotic Arm</option>
                <option value="tool">Tool</option>
                <option value="end effector">End Effector</option>
                <option value="manipulator">Manipulator</option>
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
                  <label className="block text-sm text-gray-600 mb-1">Payload Capacity</label>
                  <input
                    type="text"
                    value={formData.specifications.payload}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, payload: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 10kg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Reach</label>
                  <input
                    type="text"
                    value={formData.specifications.reach}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, reach: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 1000mm"
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
                  <label className="block text-sm text-gray-600 mb-1">Speed</label>
                  <input
                    type="text"
                    value={formData.specifications.speed}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, speed: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 1m/s"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={formData.specifications.dimensions}
                    onChange={(e) => setFormData({
                      ...formData,
                      specifications: { ...formData.specifications, dimensions: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 500 x 300 x 200 mm"
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
              componentCategory="Object Manipulation"
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

export default ManipulationForm;