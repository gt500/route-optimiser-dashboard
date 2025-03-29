
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import LocationGrid from './LocationGrid';
import LocationMap from './LocationMap';
import { LocationInfo } from '@/types/location';

interface LocationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredLocations: LocationInfo[];
  allLocations: LocationInfo[];
  onEdit: (location: LocationInfo) => void;
  onDelete: (id: string) => void;
}

const LocationTabs: React.FC<LocationTabsProps> = ({
  activeTab,
  setActiveTab,
  filteredLocations,
  allLocations,
  onEdit,
  onDelete
}) => {
  const customerCount = allLocations.filter(l => l.type === 'Customer').length;
  const storageCount = allLocations.filter(l => l.type === 'Storage').length;
  
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="all">All Locations ({allLocations.length})</TabsTrigger>
        <TabsTrigger value="customers">Customers ({customerCount})</TabsTrigger>
        <TabsTrigger value="storage">Storage ({storageCount})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="space-y-4">
        <LocationMap locations={filteredLocations} />
        
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-black">All Locations ({filteredLocations.length})</CardTitle>
            <CardDescription>
              View and manage all your delivery and storage locations
            </CardDescription>
          </CardHeader>
          <LocationGrid 
            locations={filteredLocations} 
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Card>
      </TabsContent>
      
      <TabsContent value="customers" className="space-y-4">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-black">Customer Locations</CardTitle>
            <CardDescription>All customer delivery locations</CardDescription>
          </CardHeader>
          <LocationGrid 
            locations={filteredLocations} 
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Card>
      </TabsContent>
      
      <TabsContent value="storage" className="space-y-4">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-black">Storage Locations</CardTitle>
            <CardDescription>All storage and depot locations</CardDescription>
          </CardHeader>
          <LocationGrid 
            locations={filteredLocations} 
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default LocationTabs;
