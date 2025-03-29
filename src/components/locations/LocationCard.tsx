
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Edit, Trash2 } from 'lucide-react';
import { LocationInfo } from '@/types/location';

interface LocationCardProps {
  location: LocationInfo;
  onEdit: (location: LocationInfo) => void;
  onDelete: (id: string) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, onEdit, onDelete }) => {
  return (
    <Card key={location.id} className="hover:shadow-md transition-shadow bg-black text-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-white">{location.name}</CardTitle>
          <Badge 
            variant={location.type === 'Storage' ? "secondary" : "outline"} 
            className="text-white"
          >
            {location.type || 'Customer'}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1 text-gray-300">
          <MapPin className="h-3 w-3" /> 
          {location.address}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            {location.type === 'Storage' && (
              <p className="text-sm text-white">Full cylinders: <span className="font-medium">{location.fullCylinders}</span></p>
            )}
            {location.type === 'Customer' && (
              <p className="text-sm text-white">Empty cylinders: <span className="font-medium">{location.emptyCylinders}</span></p>
            )}
            <p className="text-xs text-gray-300">
              Hours: {location.open_time || '08:00'} - {location.close_time || '17:00'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(location)} className="text-white hover:bg-white/10">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(location.id)} className="text-white hover:bg-white/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationCard;
