
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { createIcon, createLocationIcon } from './Icons';

interface DepotMarkerProps {
  name: string;
  position: [number, number];
  isStart?: boolean;
  isEnd?: boolean;
}

const DepotMarker: React.FC<DepotMarkerProps> = ({ name, position, isStart, isEnd }) => {
  const iconType = isEnd ? 'end' : 'depot';
  const icon = createIcon(createLocationIcon({ 
    type: iconType, 
    label: isEnd ? 'E' : 'S'
  }), [28, 28]);
  
  // Create a Leaflet icon
  const markerIcon = new L.DivIcon({
    className: 'custom-div-icon',
    html: icon as string,
    iconSize: [28, 28] as L.PointExpression,
    iconAnchor: [14, 14] as L.PointExpression
  });
  
  return (
    <Marker 
      position={position}
      icon={markerIcon}
    >
      <Popup>
        <div className="p-2">
          <div className="font-medium">{name}</div>
          <div className={`text-xs ${isStart ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} px-2 py-1 rounded-sm mt-1 inline-block`}>
            {isStart ? 'Starting Point' : 'End Point'}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default DepotMarker;
