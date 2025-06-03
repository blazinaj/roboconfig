import { Component } from '../types';

// Interface for price search results
export interface PriceResult {
  source: string;
  price: number;
  currency: string;
  url: string;
  inStock: boolean;
  lastUpdated: Date;
  imageUrl?: string;
  title?: string;
}

// Cache to store price results to prevent redundant lookups
const priceCache: Record<string, PriceResult[]> = {};

/**
 * Searches for component prices using Amazon Product API and other sources
 * @param component The component to search for
 * @param forceRefresh Whether to force a refresh instead of using cached data
 * @returns An array of price results
 */
export async function searchComponentPrices(
  component: Component,
  forceRefresh = false
): Promise<PriceResult[]> {
  const cacheKey = `${component.category}-${component.type}-${component.name}`;
  
  // Return cached results if available and not forcing refresh
  if (!forceRefresh && priceCache[cacheKey]) {
    return priceCache[cacheKey];
  }

  // In a real implementation, we would call the Amazon Products API
  // For this demo, we'll simulate the API response format
  const results = await fetchAmazonPrices(component);
  
  // Cache the results
  priceCache[cacheKey] = results;
  
  return results;
}

/**
 * Fetches product prices from Amazon Products API (simulated)
 * @param component Component to search for
 * @returns Array of price results from Amazon
 */
async function fetchAmazonPrices(component: Component): Promise<PriceResult[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate search keywords from component properties
  const searchKeywords = [
    component.name,
    component.category,
    component.type,
    ...Object.entries(component.specifications)
      .slice(0, 3)
      .map(([key, value]) => `${key} ${value}`)
  ].join(' ');

  // In a real implementation, we would make an API call like:
  // const response = await fetch(`${apiEndpoint}/products/search?keywords=${encodeURIComponent(searchKeywords)}`);
  // const data = await response.json();

  // For demonstration, we'll simulate Amazon product data
  const simulatedAmazonResults = generateSimulatedAmazonResults(component, searchKeywords);
  
  // Combine with other price sources for comparison
  const otherSources = ['ebay', 'newegg'].map(source => {
    return simulateOtherSourceResults(component, source);
  });
  
  return [...simulatedAmazonResults, ...otherSources];
}

/**
 * Simulates Amazon API responses with realistic product data
 */
function generateSimulatedAmazonResults(component: Component, searchTerms: string): PriceResult[] {
  // Generate a deterministic but seemingly random base price based on component properties
  const nameHash = hashString(component.name);
  const typeHash = hashString(component.type);
  const categoryHash = hashString(component.category);
  
  const basePrice = (nameHash * 0.01 + typeHash * 0.05 + categoryHash * 0.1) % 100;
  
  // Category-based price multipliers similar to previous implementation
  const categoryMultipliers = {
    'Controller': 5.5,
    'Software': 5.5,
    'Drive': 3.8,
    'Object Manipulation': 3.8,
    'Power': 2.5,
    'Sensors': 2.5,
    'Chassis': 4.2,
    'Communication': 1.8
  };
  
  const priceMultiplier = categoryMultipliers[component.category] || 1;
  
  // Calculate final base price
  const price = basePrice * priceMultiplier;
  
  // Generate 1-3 Amazon product results with slight price variations
  const numResults = Math.floor(Math.random() * 3) + 1;
  const results: PriceResult[] = [];
  
  for (let i = 0; i < numResults; i++) {
    // Add some variance to the price for different products
    const variance = (Math.random() - 0.3) * 0.3; // -15% to +15%
    const productPrice = Math.max(1, price * (1 + variance));
    
    // Generate product titles that sound like Amazon listings
    const productTitle = generateProductTitle(component, i);
    
    results.push({
      source: 'amazon',
      price: parseFloat(productPrice.toFixed(2)),
      currency: 'USD',
      url: `https://amazon.com/dp/${generateFakeASIN()}`,
      inStock: Math.random() > 0.2, // 80% chance of being in stock
      lastUpdated: new Date(),
      title: productTitle,
      imageUrl: `https://via.placeholder.com/150?text=${encodeURIComponent(component.category)}`
    });
  }
  
  return results;
}

/**
 * Simulates price results from other sources for comparison
 */
function simulateOtherSourceResults(component: Component, source: string): PriceResult {
  // Generate a deterministic but seemingly random base price based on component properties
  const nameHash = hashString(component.name);
  const typeHash = hashString(component.type);
  const sourceHash = hashString(source);
  
  const basePrice = (nameHash * 0.01 + typeHash * 0.05 + sourceHash * 0.2) % 100;
  
  // Category-based price multipliers
  const categoryMultipliers = {
    'Controller': 5.2,
    'Software': 5.0,
    'Drive': 3.5,
    'Object Manipulation': 4.0,
    'Power': 2.3,
    'Sensors': 2.8,
    'Chassis': 3.9,
    'Communication': 2.0
  };
  
  const priceMultiplier = categoryMultipliers[component.category] || 1;
  
  // Calculate final price
  const productPrice = Math.max(1, basePrice * priceMultiplier);
  
  return {
    source,
    price: parseFloat(productPrice.toFixed(2)),
    currency: 'USD',
    url: `https://${source}.com/item/${generateFakeItemId()}`,
    inStock: Math.random() > 0.3,
    lastUpdated: new Date(),
    title: generateProductTitle(component, 0),
    imageUrl: `https://via.placeholder.com/150?text=${encodeURIComponent(source)}`
  };
}

/**
 * Generates a realistic product title for the given component
 */
function generateProductTitle(component: Component, variant: number): string {
  const brandNames = [
    "TechRobotics", "RoboIndustrial", "MechaWorks", "AutomationPro",
    "NexusRobo", "PrecisionTech", "RoboSolutions", "MechaTronic"
  ];
  
  const brand = brandNames[hashString(component.name + variant) % brandNames.length];
  const model = `${component.type.substring(0, 2).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`;
  
  // Add some specs to the title
  const specs = [];
  if (component.specifications) {
    if (component.specifications.power) specs.push(`${component.specifications.power}W`);
    if (component.specifications.voltage) specs.push(`${component.specifications.voltage}`);
    if (component.specifications.weight) specs.push(`${component.specifications.weight}`);
  }
  
  const specsText = specs.length > 0 ? ` - ${specs.join(', ')}` : '';
  
  return `${brand} ${model} ${component.name} for Industrial Robotics Applications${specsText} - Professional Grade`;
}

/**
 * Generates a fake Amazon Standard Identification Number (ASIN)
 */
function generateFakeASIN(): string {
  // ASINs are 10 characters, usually starting with B0
  return 'B0' + Array.from({ length: 8 }, () => 
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 36)]
  ).join('');
}

/**
 * Generates a fake item ID for non-Amazon sources
 */
function generateFakeItemId(): string {
  return Array.from({ length: 12 }, () => 
    '0123456789abcdef'[Math.floor(Math.random() * 16)]
  ).join('');
}

/**
 * Simple string hashing function to create deterministic "random" numbers
 */
function hashString(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash);
}

/**
 * Calculate the average price from multiple sources
 * @param results Array of price results
 * @returns The average price or null if no prices available
 */
export function calculateAveragePrice(results: PriceResult[]): number | null {
  if (results.length === 0) return null;
  
  const sum = results.reduce((total, result) => total + result.price, 0);
  return parseFloat((sum / results.length).toFixed(2));
}

/**
 * Format a price with appropriate currency symbol
 * @param price The price to format
 * @param currency The currency code
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(price);
}

/**
 * Get the logo URL for a price source
 * @param source The source name
 * @returns URL to the source's logo
 */
export function getSourceLogo(source: string): string {
  switch(source.toLowerCase()) {
    case 'amazon':
      return 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg';
    case 'ebay':
      return 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg';
    case 'newegg':
      return 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Newegg_logo.svg';
    case 'digikey':
      return 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Digi-Key_Electronics_logo.svg';
    case 'mouser':
      return 'https://upload.wikimedia.org/wikipedia/commons/7/79/Mouser_Electronics_logo.svg';
    default:
      return '';
  }
}