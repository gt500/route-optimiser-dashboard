
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInfoFieldsProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleTypeChange: (value: string) => void;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ 
  formData, 
  handleChange, 
  handleTypeChange 
}) => {
  return (
    <>
      <div>
        <Label htmlFor="name">Location Name*</Label>
        <Input 
          id="name" 
          name="name" 
          value={formData.name} 
          onChange={handleChange}
          placeholder="Enter location name"
        />
      </div>
      
      <div>
        <Label htmlFor="type">Location Type</Label>
        <Select
          value={formData.type || "Customer"}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select location type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Customer">Customer</SelectItem>
            <SelectItem value="Storage">Storage/Warehouse</SelectItem>
            <SelectItem value="Distribution">Distribution Center</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="address">Address*</Label>
        <Textarea 
          id="address" 
          name="address" 
          value={formData.address} 
          onChange={handleChange}
          placeholder="Enter full address"
          className="min-h-[80px]"
        />
      </div>
    </>
  );
};

export default BasicInfoFields;
