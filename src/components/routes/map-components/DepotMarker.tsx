
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { startIcon, endIcon } from './Icons';

interface DepotMarkerProps {
  name: string;
  position: [number, number];
  isStart?: boolean;
  isEnd?: boolean;
}

const DepotMarker: React.FC<DepotMarkerProps> = ({ name, position, isStart, isEnd }) => {
  const icon = isStart ? startIcon : isEnd ? endIcon : startIcon;

  return (
    <Marker 
      position={position} 
      icon={icon}
    >
      <Popup>
        <div className="p-2">
          <div className="font-medium">{name}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {isStart ? 'Starting point' : isEnd ? 'End point' : 'Depot'}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default DepotMarker;
