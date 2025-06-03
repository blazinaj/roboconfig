import React, { useState } from 'react';
import { Loader2, RefreshCw, ExternalLink, AlertTriangle, ShoppingCart } from 'lucide-react';
import { Component } from '../types';
import { useComponentPricing } from '../hooks/useComponentPricing';
import { formatPrice, getSourceLogo } from '../lib/priceEstimation';
import ComponentPriceChart from './ComponentPriceChart';

interface PriceEstimationTabContentProps {
  component: Component;
}

const PriceEstimationTabContent: React.FC<PriceEstimationTabContentProps> = ({ component }) => {
  const { prices, loading, error, priceStats, fetchPrices } = useComponentPricing(component);
  const [sortBy, setSortBy] = useState<'price' | 'source'>('price');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  const handleRefresh = () => {
    fetchPrices(true); // Force refresh
  };
  
  const handleSort = (column: 'price' | 'source') => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };
  
  const sortedPrices = [...prices].sort((a, b) => {
    if (sortBy === 'price') {
      return sortDir === 'asc' ? a.price - b.price : b.price - a.price;
    } else { // sortBy === 'source'
      return sortDir === 'asc' 
        ? a.source.localeCompare(b.source) 
        : b.source.localeCompare(a.source);
    }
  });
  
  if (loading && prices.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={32} className="text-blue-500 animate-spin mr-2" />
        <p className="text-gray-600">Fetching price data...</p>
      </div>
    );
  }
  
  if (error && prices.length === 0) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-center">
        <AlertTriangle size={32} className="mx-auto text-red-500 mb-2" />
        <p className="text-red-600 font-medium">{error}</p>
        <button 
          onClick={handleRefresh}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center mx-auto"
        >
          <RefreshCw size={16} className="mr-1.5" />
          Try Again
        </button>
      </div>
    );
  }
  
  if (prices.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600 mb-4">No price information available for this component.</p>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm inline-flex items-center"
        >
          <RefreshCw size={16} className="mr-1.5" />
          Fetch Price Information
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Price Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="text-xs text-blue-600 mb-1">Average Price</div>
          <div className="text-xl font-bold text-gray-900">{formatPrice(priceStats.avg!)}</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="text-xs text-green-600 mb-1">Lowest Price</div>
          <div className="text-xl font-bold text-gray-900">{formatPrice(priceStats.min!)}</div>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
          <div className="text-xs text-amber-600 mb-1">Highest Price</div>
          <div className="text-xl font-bold text-gray-900">{formatPrice(priceStats.max!)}</div>
        </div>
      </div>
      
      {/* Price Chart - Smaller size */}
      <ComponentPriceChart component={component} priceResults={prices} />
      
      {/* Price List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium text-gray-800">Product Listings</h3>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs flex items-center"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="mr-1.5 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw size={14} className="mr-1.5" />
                Refresh
              </>
            )}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('source')}
                >
                  Source
                  {sortBy === 'source' && (
                    <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  Price
                  {sortBy === 'price' && (
                    <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPrices.map((price, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      {price.imageUrl && (
                        <img 
                          src={price.imageUrl} 
                          alt={price.title || 'Product'} 
                          className="w-10 h-10 object-contain mr-3 bg-gray-100"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">{price.title || component.name}</div>
                        <div className="text-xs text-gray-500">
                          {price.inStock ? (
                            <span className="text-green-600">In Stock</span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 capitalize">{price.source}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{formatPrice(price.price)}</div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <a
                      href={price.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center text-sm"
                    >
                      <ShoppingCart size={14} className="mr-1" />
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t border-gray-200">
          <p className="italic">* Prices shown are pulled from Amazon Products API and may vary based on location and availability</p>
        </div>
      </div>
    </div>
  );
};

export default PriceEstimationTabContent;