
/**
 * Mapbox utilities for route calculation and traffic data
 */

// This is a placeholder for the Mapbox access token
// In production, this should be fetched from Supabase Edge Function Secrets
// or managed through a secure environment variable
let _mapboxAccessToken: string | null = null;

/**
 * Get the Mapbox access token
 * @returns The Mapbox access token
 */
export const getMapboxAccessToken = (): string => {
  // For development purposes only - in production this should use a secure method
  if (!_mapboxAccessToken) {
    // Check if token is in localStorage (only for development)
    const storedToken = localStorage.getItem('mapbox_token');
    if (storedToken) {
      _mapboxAccessToken = storedToken;
    } else {
      console.warn('Mapbox access token not found. Using placeholder value.');
      _mapboxAccessToken = 'pk.placeholder';
    }
  }
  
  return _mapboxAccessToken;
};

/**
 * Set the Mapbox access token
 * @param token The Mapbox access token
 */
export const setMapboxAccessToken = (token: string): void => {
  _mapboxAccessToken = token;
  // Store in localStorage for development purposes only
  localStorage.setItem('mapbox_token', token);
};

/**
 * Check if a valid Mapbox access token is set
 * @returns true if a non-placeholder token is set
 */
export const hasValidMapboxToken = (): boolean => {
  const token = getMapboxAccessToken();
  return token !== 'pk.placeholder' && token.length > 20;
};

/**
 * Get Mapbox routing options based on traffic preferences
 * @param avoidTraffic Whether to avoid traffic when calculating routes
 * @returns Mapbox routing options
 */
export const getMapboxRoutingOptions = (avoidTraffic: boolean = true) => {
  return {
    profile: avoidTraffic ? 'mapbox/driving-traffic' : 'mapbox/driving',
    language: 'en',
    alternatives: false,
    useHints: true,
    steps: true
  };
};
