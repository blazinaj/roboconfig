import React, { useState } from 'react';
import { Component } from '../../types';
import { useForm } from '../../hooks/useForm';
import { Cpu, Plus, X, AlertTriangle, Loader2, Bot } from 'lucide-react';
import AIComponentAssistant from './AIComponentAssistant';

interface ControllerFormProps {
  onSubmit: (component: Partial<Component>) => void;
  onCancel: () => void;
  initialData?: Component;
}

const ControllerForm: React.FC<ControllerFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const {
    formData,
    setFormData,
    loading,
    error,
    handleSubmit,
    addRiskFactor,
    removeRiskFactor,
    updateSpecification
  } = useForm(initialData);

  const [showRiskForm, setShowRiskForm] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [riskFormData, setRiskFormData] = useState({
    name: '',
    description: '',
    severity: 1,
    probability: 1
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set category explicitly before submission
    setFormData(prev => ({
      ...prev,
      category: 'Controller'
    }));
    
    const success = await handleSubmit();
    if (success) {
      onSubmit({...formData, category: 'Controller'});
    }
  };

  const handleAddRiskFactor = () => {
    addRiskFactor(riskFormData);
    setRiskFormData({
      name: '',
      description: '',
      severity: 1,
      probability: 1
    });
    setShowRiskForm(false);
  };

  const handleApplySuggestions = (suggestions: Partial<Component>) => {
    if (suggestions.name) {
      setFormData(prev => ({ ...prev, name: suggestions.name! }));
    }
    
    if (suggestions.type) {
      setFormData(prev => ({ ...prev, type: suggestions.type! }));
    }
    
    if (suggestions.description) {
      setFormData(prev => ({ ...prev, description: suggestions.description! }));
    }
    
    if (suggestions.specifications) {
      Object.entries(suggestions.specifications).forEach(([key, value]) => {
        updateSpecification(key, value);
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Cpu className="text-blue-500 mr-2" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Controller Component</h2>
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

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <AlertTriangle size={20} className="mr-2" />
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <form onSubmit={handleFormSubmit} className="space-y-6">
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
                <option value="">Select a type</option>
                <option value="ECU">ECU</option>
                <option value="PLC">PLC</option>
                <option value="Serial BUS">Serial BUS</option>
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
                  <label className="block text-sm text-gray-600 mb-1">Processor</label>
                  <input
                    type="text"
                    value={formData.specifications?.processor || ''}
                    onChange={(e) => updateSpecification('processor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., ARM Cortex-M7"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Memory</label>
                  <input
                    type="text"
                    value={formData.specifications?.memory || ''}
                    onChange={(e) => updateSpecification('memory', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 512KB"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Interfaces</label>
                  <input
                    type="text"
                    value={formData.specifications?.interfaces || ''}
                    onChange={(e) => updateSpecification('interfaces', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., CAN, SPI, I2C, UART"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Operating Voltage</label>
                  <input
                    type="text"
                    value={formData.specifications?.operatingVoltage || ''}
                    onChange={(e) => updateSpecification('operatingVoltage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5V"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700">Risk Factors</h3>
                <button
                  type="button"
                  onClick={() => setShowRiskForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Risk Factor
                </button>
              </div>

              {showRiskForm && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Risk Name
                      </label>
                      <input
                        type="text"
                        value={riskFormData.name}
                        onChange={(e) => setRiskFormData({ ...riskFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Severity (1-5)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={riskFormData.severity}
                          onChange={(e) => setRiskFormData({ ...riskFormData, severity: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Probability (1-5)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={riskFormData.probability}
                          onChange={(e) => setRiskFormData({ ...riskFormData, probability: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={riskFormData.description}
                      onChange={(e) => setRiskFormData({ ...riskFormData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowRiskForm(false)}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddRiskFactor}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add Risk Factor
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {formData.riskFactors?.map((risk, index) => (
                  <div
                    key={risk.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{risk.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                        <div className="mt-2 flex space-x-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            Severity: {risk.severity}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            Probability: {risk.probability}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRiskFactor(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
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
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Component'
                )}
              </button>
            </div>
          </form>
        </div>

        {showAIAssistant && (
          <div className="w-80 flex-shrink-0 lg:border-l lg:border-0 border-t lg:border-t-0 border-gray-200">
            <AIComponentAssistant
              componentCategory="Controller"
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

export default ControllerForm;