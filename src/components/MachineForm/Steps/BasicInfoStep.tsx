import React from 'react';
import { MachineType } from '../../../types';
import { MachineFormData } from '../MachineForm';

interface BasicInfoStepProps {
  formData: MachineFormData;
  setFormData: React.Dispatch<React.SetStateAction<MachineFormData>>;
}

const machineTypes: { type: MachineType; description: string }[] = [
  {
    type: 'Industrial Robot',
    description: 'Heavy-duty robots for manufacturing and assembly lines'
  },
  {
    type: 'Collaborative Robot',
    description: 'Robots designed to work alongside humans safely'
  },
  {
    type: 'Mobile Robot',
    description: 'Autonomous robots for transportation and logistics'
  },
  {
    type: 'Autonomous Vehicle',
    description: 'Self-driving vehicles for various applications'
  },
  {
    type: 'Drone',
    description: 'Aerial robots for surveillance and delivery'
  },
  {
    type: 'Custom',
    description: 'Custom robot configuration for specific needs'
  }
];

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Machine Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter machine name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Machine Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {machineTypes.map(({ type, description }) => (
            <div
              key={type}
              onClick={() => setFormData({ ...formData, type })}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.type === type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <h3 className="font-medium text-gray-900">{type}</h3>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Describe the purpose and functionality of this machine"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Initial Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as MachineFormData['status'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Inactive">Inactive</option>
          <option value="Active">Active</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Error">Error</option>
          <option value="Offline">Offline</option>
        </select>
      </div>
    </div>
  );
};

export default BasicInfoStep;