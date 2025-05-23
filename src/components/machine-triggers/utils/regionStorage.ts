
import { CountryRegion } from '../types';

// Default regions to use if no regions are found in storage
const DEFAULT_REGIONS: CountryRegion[] = [
  {
    country: 'South Africa',
    regions: ['Western Cape', 'Gauteng', 'KwaZulu-Natal', 'Eastern Cape', 'Free State']
  },
  {
    country: 'United States',
    regions: ['California', 'Texas', 'Florida', 'New York', 'Washington']
  }
];

// Key used for local storage
const STORAGE_KEY = 'countryRegions';

// Get country regions from localStorage or return default if not found
export const getStoredCountryRegions = (): CountryRegion[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (!storedData) {
      console.log('No stored regions found, using defaults');
      saveCountryRegions(DEFAULT_REGIONS);
      return DEFAULT_REGIONS;
    }
    
    const parsedData = JSON.parse(storedData) as CountryRegion[];
    
    // Check if the data is valid
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      console.warn('Invalid stored regions data, using defaults');
      saveCountryRegions(DEFAULT_REGIONS);
      return DEFAULT_REGIONS;
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error retrieving regions from localStorage:', error);
    
    // Ensure defaults are stored for next time
    try {
      saveCountryRegions(DEFAULT_REGIONS);
    } catch (e) {
      console.error('Failed to save default regions to localStorage:', e);
    }
    
    return DEFAULT_REGIONS;
  }
};

// Save country regions to localStorage
export const saveCountryRegions = (regions: CountryRegion[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(regions));
  } catch (error) {
    console.error('Error saving regions to localStorage:', error);
  }
};

// Reset to default regions
export const resetToDefaultRegions = (): CountryRegion[] => {
  try {
    saveCountryRegions(DEFAULT_REGIONS);
    return DEFAULT_REGIONS;
  } catch (error) {
    console.error('Error resetting to default regions:', error);
    return DEFAULT_REGIONS;
  }
};

// Add a new country if it doesn't exist
export const addCountry = (country: string): CountryRegion[] => {
  const regions = getStoredCountryRegions();
  
  if (!regions.some(r => r.country === country)) {
    const updatedRegions = [
      ...regions,
      { country, regions: [] }
    ];
    saveCountryRegions(updatedRegions);
    return updatedRegions;
  }
  
  return regions;
};

// Get all available countries
export const getAvailableCountries = (): string[] => {
  const regions = getStoredCountryRegions();
  return regions.map(r => r.country);
};

// Get all regions for a specific country
export const getRegionsForCountry = (country: string): string[] => {
  const regions = getStoredCountryRegions();
  const countryData = regions.find(r => r.country === country);
  return countryData?.regions || [];
};
