
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { depotIcon, endIcon } from './Icons';

interface DepotMarkerProps {
  name: string;
  position: [number, number];
  isStart?: boolean;
  isEnd?: boolean;
}

const DepotMarker: React.FC<DepotMarkerProps> = ({ name, position, isStart, isEnd }) => {
  const icon = isEnd ? endIcon : depotIcon;
  
  return (
    <Marker 
      position={position} 
      icon={icon as any}
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
