
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Cylinder } from 'lucide-react';

interface CylinderSelectorProps {
  cylinders: number;
  setCylinders: (cylinders: number) => void;
  disabled?: boolean;
}

const CylinderSelector = ({ cylinders, setCylinders, disabled = false }: CylinderSelectorProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="cylinders" className="text-white flex items-center gap-1">
          <Cylinder className="h-4 w-4" />
          Cylinders to Deliver
        </Label>
        <div className="text-sm font-medium text-white bg-blue-700 rounded-full h-6 w-6 flex items-center justify-center">
          {cylinders}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCylinders(Math.max(1, cylinders - 1))}
          disabled={cylinders <= 1 || disabled}
          className="bg-white hover:bg-slate-100 text-blue-900"
        >
          -
        </Button>
        <Progress value={(cylinders/25)*100} className="flex-1 h-2 bg-blue-300" />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCylinders(Math.min(25, cylinders + 1))}
          disabled={cylinders >= 25 || disabled}
          className="bg-white hover:bg-slate-100 text-blue-900"
        >
          +
        </Button>
      </div>
      <p className="text-xs text-gray-300">Maximum 25 cylinders per location</p>
    </div>
  );
};

export default CylinderSelector;
