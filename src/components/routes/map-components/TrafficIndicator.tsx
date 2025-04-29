
import React from 'react';
import { getTrafficColor, getCurrentTrafficCondition } from '@/utils/route/trafficUtils';

const TrafficIndicator: React.FC = () => {
  const currentTraffic = getCurrentTrafficCondition();
  const trafficColor = getTrafficColor(currentTraffic);
  
  return (
    <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md z-10">
      <div className="flex items-center gap-1 text-xs">
        <span className="font-medium">Traffic:</span>
        <div className={`${trafficColor} w-2 h-2 rounded-full`}></div>
        <span>{currentTraffic}</span>
      </div>
    </div>
  );
};

export default TrafficIndicator;
