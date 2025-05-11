
// Mapbox utilities for route visualizations

// Store Mapbox token in local storage
export const setMapboxToken = (token: string): void => {
  if (!token) return;
  localStorage.setItem('mapboxToken', token);
};

// Retrieve Mapbox token from local storage
export const getMapboxToken = (): string => {
  const storedToken = localStorage.getItem('mapboxToken');
  // If no token in localStorage, return the default one
  return storedToken || 'pk.eyJ1IjoiZ3Q1MDAiLCJhIjoiY21hank4enU2MGN2bjJpcXYyamM2MGkwZiJ9.hVmRpENHJ7MkFK9neF_9hQ';
};

// Check if we have a valid token
export const hasValidMapboxToken = (): boolean => {
  const token = getMapboxToken();
  return token !== null && token.length > 20 && token.startsWith('pk.');
};

// Get Mapbox style URL based on theme
export const getMapboxStyleUrl = (theme: 'light' | 'dark' | 'satellite' | 'streets' = 'light'): string => {
  const styles = {
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
    streets: 'mapbox://styles/mapbox/streets-v12'
  };
  
  return styles[theme];
};
