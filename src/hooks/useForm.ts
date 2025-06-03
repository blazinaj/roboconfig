import { useState } from 'react';
import { Component, RiskFactor } from '../types';
import { useComponents } from './useComponents';

export const useForm = (initialData?: Component) => {
  const { addComponent, updateComponent } = useComponents();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Component>>({
    name: initialData?.name || '',
    type: initialData?.type || '',
    description: initialData?.description || '',
    category: initialData?.category,
    specifications: initialData?.specifications || {},
    riskFactors: initialData?.riskFactors || []
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate all required fields
      if (!formData.name || formData.name.trim() === '') {
        throw new Error('Component name is required');
      }
      
      if (!formData.type || formData.type.trim() === '') {
        throw new Error('Component type is required');
      }
      
      if (!formData.description || formData.description.trim() === '') {
        throw new Error('Component description is required');
      }
      
      if (!formData.category) {
        throw new Error('Component category is required');
      }
      
      // Form is valid, proceed with submission
      if (initialData?.id) {
        await updateComponent(initialData.id, formData as Component);
      } else {
        await addComponent(formData as Omit<Component, 'id'>);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addRiskFactor = (riskFactor: Omit<RiskFactor, 'id'>) => {
    setFormData(prev => ({
      ...prev,
      riskFactors: [...(prev.riskFactors || []), { ...riskFactor, id: crypto.randomUUID() }]
    }));
  };

  const removeRiskFactor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      riskFactors: prev.riskFactors?.filter((_, i) => i !== index)
    }));
  };

  const updateSpecification = (key: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...(prev.specifications || {}),
        [key]: value
      }
    }));
  };

  return {
    formData,
    setFormData,
    loading,
    error,
    handleSubmit,
    addRiskFactor,
    removeRiskFactor,
    updateSpecification
  };
};