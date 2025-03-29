
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CoordinateFieldsProps {
  formData: any;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CoordinateFields: React.FC<CoordinateFieldsProps> = ({ 
  formData, 
  handleNumberChange 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="lat">Latitude*</Label>
        <Input 
          id="lat" 
          name="lat" 
          type="number"
          step="any"
          value={formData.lat} 
          onChange={handleNumberChange}
          placeholder="e.g. -33.9248"
        />
      </div>
      <div>
        <Label htmlFor="long">Longitude*</Label>
        <Input 
          id="long" 
          name="long" 
          type="number"
          step="any"
          value={formData.long} 
          onChange={handleNumberChange}
          placeholder="e.g. 18.4173"
        />
      </div>
    </div>
  );
};

export default CoordinateFields;
