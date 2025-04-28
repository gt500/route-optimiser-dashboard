
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Check } from 'lucide-react';

interface FuelCostEditorProps {
  value: number;
  onUpdate: (newCost: number) => void;
}

const FuelCostEditor: React.FC<FuelCostEditorProps> = ({ value, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const handleEdit = () => {
    setIsEditing(true);
    setInputValue(value.toString());
  };

  const handleSave = () => {
    const parsedValue = parseFloat(inputValue);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      onUpdate(parsedValue);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <span>Fuel price (R/L):</span>
      {isEditing ? (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-20 h-7 text-right"
            step="0.01"
            min="0"
          />
          <Button variant="ghost" size="icon" onClick={handleSave} className="h-7 w-7">
            <Check className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <span>R{value.toFixed(2)}</span>
          <Button variant="ghost" size="icon" onClick={handleEdit} className="h-7 w-7">
            <Edit className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FuelCostEditor;
