
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FuelCostEditorProps {
  currentCost: number;
  onChange: (newCost: number) => void;
  fuelConsumption?: number;
  isDisabled?: boolean;
}

const FuelCostEditor: React.FC<FuelCostEditorProps> = ({
  currentCost,
  onChange,
  fuelConsumption,
  isDisabled = false
}) => {
  const [localCost, setLocalCost] = useState(currentCost);
  
  const handleSliderChange = (value: number[]) => {
    const newCost = value[0];
    setLocalCost(newCost);
    onChange(newCost);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setLocalCost(value);
      onChange(value);
    }
  };
  
  const incrementCost = () => {
    const newCost = Math.round((localCost + 0.1) * 100) / 100;
    setLocalCost(newCost);
    onChange(newCost);
  };
  
  const decrementCost = () => {
    if (localCost > 0.1) {
      const newCost = Math.round((localCost - 0.1) * 100) / 100;
      setLocalCost(newCost);
      onChange(newCost);
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Input
            type="number"
            value={localCost}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className="pl-7"
            disabled={isDisabled}
          />
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            R
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={incrementCost}
            disabled={isDisabled}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={decrementCost}
            disabled={isDisabled || localCost <= 0.1}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Slider
        value={[localCost]}
        min={15}
        max={30}
        step={0.01}
        onValueChange={handleSliderChange}
        disabled={isDisabled}
      />
      {fuelConsumption && (
        <p className="text-xs text-muted-foreground">
          Vehicle consumption rate: {fuelConsumption.toFixed(1)}L/100km
        </p>
      )}
    </div>
  );
};

export default FuelCostEditor;
