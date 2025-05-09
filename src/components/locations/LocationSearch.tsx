
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface LocationSearchProps {
  searchTerm: string;
  onChange: (value: string) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ searchTerm, onChange }) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search locations..."
        className="pl-8"
        value={searchTerm}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default LocationSearch;
