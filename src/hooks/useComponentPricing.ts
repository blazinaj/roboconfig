import { useState, useEffect } from 'react';
import { Component } from '../types';
import { searchComponentPrices, PriceResult } from '../lib/priceEstimation';

export function useComponentPricing(component: Component) {
  const [prices, setPrices] = useState<PriceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch price data when component changes
    fetchPrices();
  }, [component.id]);

  const fetchPrices = async (forceRefresh = false) => {
    if (!component) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchComponentPrices(component, forceRefresh);
      setPrices(results);
    } catch (err) {
      setError('Failed to fetch price information');
      console.error('Error fetching component prices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate the minimum, maximum, and average prices
  const calculatePriceStats = () => {
    if (prices.length === 0) {
      return { min: null, max: null, avg: null };
    }

    const priceValues = prices.map(result => result.price);
    const min = Math.min(...priceValues);
    const max = Math.max(...priceValues);
    const sum = priceValues.reduce((total, price) => total + price, 0);
    const avg = sum / priceValues.length;

    return {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      avg: parseFloat(avg.toFixed(2))
    };
  };

  const priceStats = calculatePriceStats();

  return {
    prices,
    loading,
    error,
    priceStats,
    fetchPrices
  };
}