
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface InventoryFieldsProps {
  formData: any;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InventoryFields: React.FC<InventoryFieldsProps> = ({ formData, handleNumberChange }) => {
  if (!formData.isWarehouse) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="fullCylinders">Full Cylinders</Label>
        <Input 
          id="fullCylinders" 
          name="fullCylinders" 
          type="number" 
          value={formData.fullCylinders} 
          onChange={handleNumberChange}
          min="0"
        />
      </div>
      <div>
        <Label htmlFor="emptyCylinders">Empty Cylinders</Label>
        <Input 
          id="emptyCylinders" 
          name="emptyCylinders" 
          type="number" 
          value={formData.emptyCylinders} 
          onChange={handleNumberChange}
          min="0"
        />
      </div>
    </div>
  );
};

export default InventoryFields;
