
import { CountryRegion } from '../types';

// Define initial country-region structure
const initialCountryRegions: CountryRegion[] = [
  {
    country: "South Africa",
    regions: ["Western Cape", "Gauteng", "Eastern Cape", "KZN"]
  },
  {
    country: "USA",
    regions: ["Florida", "Oklahoma", "Texas", "Georgia"]
  }
];

// Get country regions from localStorage
export const getStoredCountryRegions = (): CountryRegion[] => {
  try {
    const stored = localStorage.getItem('countryRegions');
    return stored ? JSON.parse(stored) : initialCountryRegions;
  } catch (e) {
    console.error('Failed to load country regions from localStorage', e);
    return initialCountryRegions;
  }
};

// Save country regions to localStorage
export const saveCountryRegions = (countryRegions: CountryRegion[]): void => {
  try {
    localStorage.setItem('countryRegions', JSON.stringify(countryRegions));
  } catch (e) {
    console.error('Failed to save country regions to localStorage', e);
  }
};
