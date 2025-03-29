
import React from 'react';
import { Marker as LeafletMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createDepotIcon } from './Icons';

interface DepotMarkerProps {
  name: string;
  position: [number, number];
  isStart?: boolean;
  isEnd?: boolean;
}

const DepotMarker: React.FC<DepotMarkerProps> = ({ name, position, isStart, isEnd }) => {
  // Skip rendering if position contains NaN or zeros
  if (position.some(coord => isNaN(coord) || coord === 0)) {
    console.warn(`Skipping depot marker for ${name} due to invalid coordinates:`, position);
    return null;
  }
  
  const label = isStart ? 'S' : isEnd ? 'E' : 'D';
  
  // Create a custom icon
  const customIcon = createDepotIcon({ label, isStart, isEnd });
  const icon = new L.DivIcon({
    className: 'custom-div-icon',
    html: customIcon,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  return (
    <LeafletMarker 
      position={position} 
      icon={icon}
    >
      <Popup>
        <div className="text-sm">
          <strong>{isStart ? 'Start: ' : isEnd ? 'End: ' : ''}{name}</strong>
        </div>
      </Popup>
    </LeafletMarker>
  );
};

export default DepotMarker;
