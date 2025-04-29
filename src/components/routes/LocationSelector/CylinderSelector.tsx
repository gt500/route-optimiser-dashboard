
import React from 'react';
import { Button } from '@/components/ui/button';
import { Cylinder } from 'lucide-react';
import { MAX_CYLINDERS } from '@/hooks/routes/types';

interface CylinderSelectorProps {
  cylinders: number;
  setCylinders: (cylinders: number) => void;
  maxCylinders?: number;
}

const CylinderSelector: React.FC<CylinderSelectorProps> = ({ 
  cylinders, 
  setCylinders, 
  maxCylinders = MAX_CYLINDERS 
}) => {
  const handleIncrease = () => {
    console.log(`Increasing cylinders from ${cylinders} to ${Math.min(cylinders + 1, maxCylinders)}`);
    setCylinders(Math.min(cylinders + 1, maxCylinders));
  };

  const handleDecrease = () => {
    console.log(`Decreasing cylinders from ${cylinders} to ${Math.max(1, cylinders - 1)}`);
    setCylinders(Math.max(1, cylinders - 1));
  };
  
  return (
    <div className="bg-blue-800 rounded-md p-3">
      <div className="flex justify-between items-center mb-2">
        <div className="text-white text-sm font-medium flex items-center gap-1.5">
          <Cylinder className="h-4 w-4" />
          Select Cylinders
        </div>
        <div className="text-blue-300 text-xs">Max: {maxCylinders}</div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          onClick={handleDecrease}
          disabled={cylinders <= 1}
          variant="secondary" 
          size="icon"
        >
          -
        </Button>
        
        <div className="flex-1 bg-blue-700 rounded-md p-2 text-center">
          <div className="text-2xl font-bold text-white">{cylinders}</div>
          <div className="text-xs text-blue-300">Cylinders</div>
        </div>
        
        <Button 
          onClick={handleIncrease}
          disabled={cylinders >= maxCylinders}
          variant="secondary" 
          size="icon"
        >
          +
        </Button>
      </div>
    </div>
  );
};

export default CylinderSelector;
