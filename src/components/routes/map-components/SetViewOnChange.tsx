
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface SetViewOnChangeProps {
  center?: [number, number];
  coordinates?: Array<[number, number]>;
  zoom?: number;
}

export const SetViewOnChange: React.FC<SetViewOnChangeProps> = ({ coordinates = [], center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      try {
        // Make sure we have valid coordinates before creating bounds
        const validCoordinates = coordinates.filter(coord => 
          Array.isArray(coord) && 
          coord.length === 2 && 
          !isNaN(coord[0]) && 
          !isNaN(coord[1]) &&
          coord[0] !== 0 && 
          coord[1] !== 0
        );
        
        if (validCoordinates.length > 0) {
          const bounds = L.latLngBounds(validCoordinates.map(coord => [coord[0], coord[1]]));
          
          // Add a small padding to avoid edge issues
          map.fitBounds(bounds, { 
            padding: [50, 50],
            maxZoom: 12 // Limit maximum zoom to prevent infinite tiles
          });
        } else if (center) {
          // Fall back to center if no valid coordinates
          map.setView(center, zoom || 11);
        }
      } catch (error) {
        console.error("Error fitting map bounds:", error);
        // Fall back to default location if anything goes wrong
        if (center) {
          map.setView(center, zoom || 11);
        }
      }
    } else if (center) {
      // If no coordinates but center is provided, use center
      map.setView(center, zoom || 11);
    }
  }, [coordinates, center, map, zoom]);
  
  return null;
};

// Add this default export to maintain backward compatibility
export default SetViewOnChange;
