
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RegionFieldsProps {
  region: string | undefined;
  country: string | undefined;
  onRegionChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onAddRegionDialogOpen?: () => void;
}

const RegionFields: React.FC<RegionFieldsProps> = ({
  region,
  country,
  onRegionChange,
  onCountryChange,
  onAddRegionDialogOpen
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="country">Country</Label>
        <Input 
          id="country" 
          name="country" 
          value={country || ''} 
          onChange={(e) => onCountryChange(e.target.value)}
          placeholder="Enter country"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="region">Region</Label>
        <div className="flex gap-2">
          <Input 
            id="region" 
            name="region" 
            value={region || ''} 
            onChange={(e) => onRegionChange(e.target.value)}
            placeholder="Enter region"
            className="flex-1"
          />
          {onAddRegionDialogOpen && (
            <Button 
              type="button" 
              variant="outline"
              size="icon"
              onClick={onAddRegionDialogOpen}
              title="Add new region"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegionFields;
