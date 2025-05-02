import React, { useState } from 'react';
import { Machine, MachineType, Component } from '../../types';
import { Notebook as Robot, ArrowRight, X } from 'lucide-react';
import BasicInfoStep from './Steps/BasicInfoStep';
import ComponentSelectionStep from './Steps/ComponentSelectionStep';
import MaintenanceStep from './Steps/MaintenanceStep';
import ReviewStep from './Steps/ReviewStep';

interface MachineFormProps {
  onSubmit: (machine: Partial<Machine>) => void;
  onCancel: () => void;
  initialData?: Machine;
}

export type MachineFormData = {
  name: string;
  type: MachineType;
  description: string;
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Error' | 'Offline';
  components: Component[];
  maintenanceSchedule?: {
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
    tasks: {
      name: string;
      description: string;
      priority: 'Low' | 'Medium' | 'High' | 'Critical';
      estimatedDuration: number;
    }[];
  };
};

const MachineForm: React.FC<MachineFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<MachineFormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'Industrial Robot',
    description: initialData?.description || '',
    status: initialData?.status || 'Inactive',
    components: initialData?.components || [],
    maintenanceSchedule: initialData?.maintenanceSchedule || {
      frequency: 'Monthly',
      tasks: []
    }
  });

  const steps = [
    { title: 'Basic Information', component: BasicInfoStep },
    { title: 'Component Selection', component: ComponentSelectionStep },
    { title: 'Maintenance Schedule', component: MaintenanceStep },
    { title: 'Review', component: ReviewStep }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <Robot className="text-blue-600 mr-2" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {initialData ? 'Edit Machine' : 'New Machine'}
              </h2>
              <p className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Progress Steps */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between relative">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center relative z-10"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className={`mt-2 text-sm ${
                    index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
              <div
                className="absolute top-4 left-0 h-0.5 bg-gray-200 w-full -z-10"
                style={{ transform: 'translateY(-50%)' }}
              >
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <CurrentStepComponent
              formData={formData}
              setFormData={setFormData}
            />
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={handleBack}
              className={`px-4 py-2 text-gray-600 hover:text-gray-800 ${
                currentStep === 0 ? 'invisible' : ''
              }`}
            >
              Back
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              {currentStep === steps.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                >
                  Create Machine
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                >
                  Next <ArrowRight size={16} className="ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineForm;