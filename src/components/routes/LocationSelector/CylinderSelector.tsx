
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface CylinderSelectorProps {
  cylinders: number;
  setCylinders: (cylinders: number) => void;
  disabled?: boolean;
}

const CylinderSelector = ({ cylinders, setCylinders, disabled = false }: CylinderSelectorProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="cylinders" className="text-white">Number of Cylinders</Label>
        <div className="text-sm font-medium text-white">{cylinders}</div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCylinders(Math.max(1, cylinders - 1))}
          disabled={cylinders <= 1 || disabled}
        >
          -
        </Button>
        <Progress value={(cylinders/25)*100} className="flex-1 h-2" />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCylinders(Math.min(25, cylinders + 1))}
          disabled={cylinders >= 25 || disabled}
        >
          +
        </Button>
      </div>
      <p className="text-xs text-gray-300">Maximum 25 cylinders per location</p>
    </div>
  );
};

export default CylinderSelector;
