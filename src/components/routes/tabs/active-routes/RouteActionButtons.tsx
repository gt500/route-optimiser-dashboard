
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle } from 'lucide-react';

interface RouteActionButtonsProps {
  routeId: string;
  status: string;
  processingRoutes: Record<string, string>;
  onStart: (routeId: string) => void;
  onComplete: (routeId: string) => void;
}

const RouteActionButtons = ({ 
  routeId, 
  status, 
  processingRoutes, 
  onStart, 
  onComplete 
}: RouteActionButtonsProps) => {
  const isStarting = processingRoutes[routeId] === 'starting';
  const isCompleting = processingRoutes[routeId] === 'completing';
  const disabled = isStarting || isCompleting;

  return (
    <div className="flex justify-end gap-1">
      {status === 'scheduled' && (
        <Button 
          variant="outline" 
          size="sm" 
          className={`h-8 px-2 transition-colors ${
            isStarting
              ? 'bg-blue-500 text-white border-blue-600'
              : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log("Start button clicked for route:", routeId);
            onStart(routeId);
          }}
          disabled={disabled}
        >
          <Play className="h-4 w-4 mr-1" />
          {isStarting ? 'Starting...' : 'Start'}
        </Button>
      )}
      {status !== 'completed' && (
        <Button 
          variant="outline" 
          size="sm" 
          className={`h-8 px-2 transition-colors ${
            isCompleting
              ? 'bg-green-500 text-white border-green-600'
              : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log("Complete button clicked for route:", routeId);
            onComplete(routeId);
          }}
          disabled={disabled}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          {isCompleting ? 'Completing...' : 'Complete'}
        </Button>
      )}
    </div>
  );
};

export default RouteActionButtons;
