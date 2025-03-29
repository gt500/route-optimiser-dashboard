
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
      <TabsList className="bg-black text-white">
        <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
          All Locations ({allLocations.length})
        </TabsTrigger>
        <TabsTrigger value="customers" className="data-[state=active]:bg-primary data-[state=active]:text-white">
          Customers ({customerCount})
        </TabsTrigger>
        <TabsTrigger value="storage" className="data-[state=active]:bg-primary data-[state=active]:text-white">
          Storage ({storageCount})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="space-y-4">
        <LocationMap locations={filteredLocations} />
        
        <Card className="bg-black">
          <CardHeader>
            <CardTitle className="text-white">All Locations ({filteredLocations.length})</CardTitle>
            <CardDescription className="text-gray-300">
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
        <Card className="bg-black">
          <CardHeader>
            <CardTitle className="text-white">Customer Locations</CardTitle>
            <CardDescription className="text-gray-300">All customer delivery locations</CardDescription>
          </CardHeader>
          <LocationGrid 
            locations={filteredLocations} 
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Card>
      </TabsContent>
      
      <TabsContent value="storage" className="space-y-4">
        <Card className="bg-black">
          <CardHeader>
            <CardTitle className="text-white">Storage Locations</CardTitle>
            <CardDescription className="text-gray-300">All storage and depot locations</CardDescription>
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
