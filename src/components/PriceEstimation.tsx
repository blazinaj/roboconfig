import React, { useState, useEffect } from 'react';
import { RefreshCw, DollarSign, ShoppingCart, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';
import { Component } from '../types';
import { searchComponentPrices, calculateAveragePrice, formatPrice, PriceResult } from '../lib/priceEstimation';
import ComponentPriceChart from './ComponentPriceChart';
import PriceEstimationTabContent from './PriceEstimationTabContent';

interface PriceEstimationProps {
  component: Component;
}

const PriceEstimation: React.FC<PriceEstimationProps> = ({ component }) => {
  const [priceResults, setPriceResults] = useState<PriceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch price data when the component loads
  useEffect(() => {
    fetchPrices();
  }, [component.id]);
  
  // Function to fetch prices
  const fetchPrices = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchComponentPrices(component, forceRefresh);
      setPriceResults(results);
    } catch (err) {
      setError('Failed to fetch price information');
      console.error('Error fetching price information:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Use the tab content component for a more detailed view
  return <PriceEstimationTabContent component={component} />;
};

export default PriceEstimation;