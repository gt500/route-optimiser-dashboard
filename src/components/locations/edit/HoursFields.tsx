
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface HoursFieldsProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const HoursFields: React.FC<HoursFieldsProps> = ({ formData, handleChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="open_time">Opening Time</Label>
        <Input 
          id="open_time" 
          name="open_time" 
          value={formData.open_time || '08:00'} 
          onChange={handleChange}
          placeholder="e.g. 08:00"
        />
      </div>
      <div>
        <Label htmlFor="close_time">Closing Time</Label>
        <Input 
          id="close_time" 
          name="close_time" 
          value={formData.close_time || '17:00'} 
          onChange={handleChange}
          placeholder="e.g. 17:00"
        />
      </div>
    </div>
  );
};

export default HoursFields;
