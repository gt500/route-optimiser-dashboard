
import { useState, useEffect } from 'react';

interface Location {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export const useMapState = (locations: Location[], country?: string, region?: string) => {
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-33.9249, 18.4241]); // Default: Cape Town
  const [zoom, setZoom] = useState(13);

  // This function calculates bounds from locations
  const calculateBounds = (locs: Location[]): [[number, number], [number, number]] | null => {
    // Filter for locations with valid coordinates
    const validLocations = locs.filter(loc => 
      loc.latitude && 
      loc.longitude && 
      !isNaN(loc.latitude) && 
      !isNaN(loc.longitude)
    );
    
    if (validLocations.length === 0) return null;
    
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    
    validLocations.forEach(loc => {
      if (loc.latitude && loc.longitude) {
        minLat = Math.min(minLat, loc.latitude);
        maxLat = Math.max(maxLat, loc.latitude);
        minLng = Math.min(minLng, loc.longitude);
        maxLng = Math.max(maxLng, loc.longitude);
      }
    });
    
    // Only return bounds if we actually found coordinates
    if (minLat === 90 || maxLat === -90) return null;
    
    // Add padding to bounds
    const latPadding = Math.max(0.05, (maxLat - minLat) * 0.2);
    const lngPadding = Math.max(0.05, (maxLng - minLng) * 0.2);
    
    return [
      [minLat - latPadding, minLng - lngPadding], 
      [maxLat + latPadding, maxLng + lngPadding]
    ];
  };
  
  // Calculate initial region-based center if no locations
  useEffect(() => {
    // Only run this if there are no locations and we have region data
    if ((!locations || locations.length === 0) && country && region) {
      const regionCenters: Record<string, [number, number]> = {
        // South Africa regions
        'Western Cape': [-33.9249, 18.4241],
        'Eastern Cape': [-33.0292, 27.8546],
        'Northern Cape': [-28.7282, 24.7499],
        'North West': [-25.8526, 25.6445],
        'Free State': [-29.0852, 26.1596],
        'Gauteng': [-26.2041, 28.0473],
        'Mpumalanga': [-25.4658, 30.9852],
        'Limpopo': [-23.4013, 29.4179],
        'KwaZulu-Natal': [-29.8587, 31.0218],
        // Default to center of South Africa if region not found
        'Default': [-30.5595, 22.9375]
      };
      
      const center = region && regionCenters[region] 
        ? regionCenters[region]  
        : regionCenters['Default'];
      
      setMapCenter(center);
      setZoom(6); // Wider zoom for regional view
    }
  }, [country, region, locations]);

  // Calculate bounds and center when locations change
  useEffect(() => {
    // Only recalculate if we have locations
    if (locations && locations.length > 0) {
      console.log("Calculating bounds for", locations.length, "locations");
      const validLocations = locations.filter(loc => 
        loc.latitude && 
        loc.longitude && 
        !isNaN(loc.latitude) && 
        !isNaN(loc.longitude)
      );
      
      if (validLocations.length === 0) {
        console.warn("No valid locations with coordinates found");
        return;
      }
      
      const newBounds = calculateBounds(locations);
      
      if (newBounds) {
        console.log("New bounds calculated:", newBounds);
        setBounds(newBounds);
        
        // Calculate center from bounds
        const centerLat = (newBounds[0][0] + newBounds[1][0]) / 2;
        const centerLng = (newBounds[0][1] + newBounds[1][1]) / 2;
        
        setMapCenter([centerLat, centerLng]);
        
        // Adjust zoom based on bounds size
        const latDiff = Math.abs(newBounds[1][0] - newBounds[0][0]);
        const lngDiff = Math.abs(newBounds[1][1] - newBounds[0][1]);
        const maxDiff = Math.max(latDiff, lngDiff);
        
        // Rough calculation for zoom level based on bounding box size
        if (maxDiff > 2) setZoom(5);
        else if (maxDiff > 1) setZoom(7);
        else if (maxDiff > 0.5) setZoom(8);
        else if (maxDiff > 0.2) setZoom(9);
        else if (maxDiff > 0.1) setZoom(10);
        else if (maxDiff > 0.05) setZoom(11);
        else if (maxDiff > 0.02) setZoom(12);
        else setZoom(13);
      }
    }
  }, [locations]);

  return { bounds, mapCenter, zoom, setZoom };
};
