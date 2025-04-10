
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface RouteItemProps {
  id: string;
  name: string;
  date: string;
  total_distance?: number;
  estimated_cost?: number;
}

interface RecentRoutesProps {
  routes: RouteItemProps[];
}

const RecentRoutes: React.FC<RecentRoutesProps> = ({ routes }) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
      <CardHeader>
        <CardTitle>Recent Routes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {routes.length > 0 ? (
            routes.map((route) => (
              <div key={route.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-800">
                <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{route.name}</div>
                  <div className="text-sm text-gray-400">
                    {route.total_distance?.toFixed(1) || '0'} km • {new Date(route.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-xs font-medium bg-gray-700 text-white py-1 px-2 rounded-full">
                  R{route.estimated_cost?.toFixed(2) || '0.00'}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-800">
              <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">No recent routes</div>
                <div className="text-sm text-gray-400">Complete routes to see them here</div>
              </div>
              <div className="text-xs font-medium bg-gray-700 text-white py-1 px-2 rounded-full">
                R0.00
              </div>
            </div>
          )}
          <Button variant="outline" className="w-full">View All</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentRoutes;
