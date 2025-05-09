
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

/**
 * Calculate route between two points using Mapbox Directions API
 * @param start Start coordinates [lng, lat]
 * @param end End coordinates [lng, lat]
 * @param waypoints Optional array of waypoint coordinates [[lng, lat], ...]
 * @returns Promise with route data
 */
export const calculateRoute = async (
  start: [number, number], 
  end: [number, number], 
  waypoints: [number, number][] = []
) => {
  const token = getMapboxAccessToken();
  if (token === 'pk.placeholder') {
    throw new Error('Valid Mapbox token required for route calculation');
  }
  
  // Construct waypoints string
  const coordinates = [start, ...waypoints, end]
    .map(coord => `${coord[0]},${coord[1]}`)
    .join(';');
  
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinates}?access_token=${token}&steps=true&geometries=geojson&overview=full`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error calculating route:', error);
    throw error;
  }
};

/**
 * Create a Mapbox-compatible coordinates array from a Leaflet latLng
 * @param latLng Leaflet LatLng object
 * @returns [lng, lat] array for Mapbox
 */
export const latLngToCoordinates = (latLng: { lat: number, lng: number }): [number, number] => {
  return [latLng.lng, latLng.lat];
};

/**
 * Convert Mapbox coordinates to Leaflet LatLng format
 * @param coords Mapbox [lng, lat] coordinates
 * @returns {lat: number, lng: number} Leaflet format
 */
export const coordinatesToLatLng = (coords: [number, number]): { lat: number, lng: number } => {
  return { lat: coords[1], lng: coords[0] };
};
