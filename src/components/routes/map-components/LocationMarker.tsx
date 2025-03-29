
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

interface LocationMarkerProps {
  location: {
    id: string | number;
    name: string;
    latitude?: number;
    longitude?: number;
    lat?: number;
    long?: number;
    address: string;
    sequence?: number; // Added sequence for route order display
  };
  onLocationClick?: (locationId: string) => void;
}

export const LocationMarker: React.FC<LocationMarkerProps> = ({ location, onLocationClick }) => {
  const position: [number, number] = [
    location.latitude || location.lat || 0, 
    location.longitude || location.long || 0
  ];
  
  // Create a customer icon
  const customerIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/484/484167.png',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25],
  });

  const handleDelete = async () => {
    try {
      // First check if the location is used in any deliveries
      const { data: deliveries, error: deliveryError } = await supabase
        .from('deliveries')
        .select('id')
        .eq('location_id', location.id.toString());
        
      if (deliveryError) {
        console.error('Error checking deliveries:', deliveryError);
        alert('Could not check if location is used in deliveries');
        return;
      }
      
      // If location is used in deliveries, delete those records first
      if (deliveries && deliveries.length > 0) {
        const { error: deleteDeliveriesError } = await supabase
          .from('deliveries')
          .delete()
          .eq('location_id', location.id.toString());
          
        if (deleteDeliveriesError) {
          console.error('Error deleting delivery records:', deleteDeliveriesError);
          alert('Could not delete associated delivery records');
          return;
        }
      }
      
      // Now delete the location itself
      const { error: deleteLocationError } = await supabase
        .from('locations')
        .delete()
        .eq('id', location.id.toString());
        
      if (deleteLocationError) {
        console.error('Error deleting location:', deleteLocationError);
        alert('Could not delete location');
        return;
      }
      
      alert(`Location "${location.name}" has been deleted`);
      
      // Reload the page to refresh the data
      window.location.reload();
    } catch (error) {
      console.error('Error in handleDelete:', error);
      alert('An error occurred while deleting the location');
    }
  };
  
  // Define the event handlers using the correct format
  const eventHandlers = {
    click: () => {
      if (onLocationClick) {
        onLocationClick(location.id.toString());
      }
    }
  };
  
  return (
    <Marker 
      position={position}
      icon={customerIcon}
      eventHandlers={eventHandlers}
    >
      <Popup>
        <div className="p-1">
          <h3 className="font-medium">{location.name}</h3>
          <p className="text-xs text-muted-foreground">{location.address}</p>
          {location.sequence !== undefined && (
            <p className="text-xs font-medium text-blue-600 mt-1">
              Stop #{location.sequence + 1}
            </p>
          )}
          <div className="mt-2 flex justify-end">
            <button 
              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              onClick={handleDelete}
            >
              Delete Location
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
