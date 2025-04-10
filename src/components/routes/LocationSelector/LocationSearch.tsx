
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface LocationSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  disabled?: boolean;
}

const LocationSearch = ({ searchTerm, setSearchTerm, disabled = false }: LocationSearchProps) => {
  return (
    <div>
      <Label htmlFor="location" className="text-white">Select Location</Label>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search locations..." 
          className="pl-8 h-9 w-[200px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default LocationSearch;
