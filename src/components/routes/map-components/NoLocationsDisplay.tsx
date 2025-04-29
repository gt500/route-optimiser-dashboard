
import React from 'react';
import { MapPin } from 'lucide-react';

const NoLocationsDisplay: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
      <div className="text-center p-4">
        <MapPin className="h-12 w-12 mx-auto text-slate-400" />
        <p className="mt-2 text-slate-500">
          Add at least two locations to view the route
        </p>
      </div>
    </div>
  );
};

export default NoLocationsDisplay;
