
import React from 'react';
import { Polyline } from 'react-leaflet';
import { TrafficSegment, getTrafficColor } from '@/utils/route/trafficUtils';

interface TrafficOverlayProps {
  trafficSegments: TrafficSegment[];
  visible: boolean;
}

const TrafficOverlay: React.FC<TrafficOverlayProps> = ({ trafficSegments, visible }) => {
  if (!visible || !trafficSegments.length) return null;

  return (
    <>
      {trafficSegments.map((segment, index) => {
        if (!segment.start || !segment.end) return null;
        
        const color = getTrafficColor(segment.level);
        const positions = [segment.start, segment.end];
        
        return (
          <React.Fragment key={`traffic-segment-${index}`}>
            <Polyline 
              positions={positions}
              pathOptions={{
                color,
                weight: 7,
                opacity: 0.7
              }}
            />
            <Polyline 
              positions={positions}
              pathOptions={{
                color: 'white',
                weight: 3,
                opacity: 0.4,
                dashArray: '6,8'
              }}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

export default TrafficOverlay;
