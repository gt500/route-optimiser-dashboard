
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Truck } from 'lucide-react';

interface DeliveryItemProps {
  id: string;
  name: string;
  date: string;
  locationsCount: number;
  cylindersCount: number;
  status: string;
}

interface UpcomingDeliveriesProps {
  deliveries: DeliveryItemProps[];
}

const UpcomingDeliveries: React.FC<UpcomingDeliveriesProps> = ({ deliveries }) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
      <CardHeader>
        <CardTitle>Upcoming Deliveries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deliveries.length > 0 ? (
            deliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-800">
                <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{delivery.name}</div>
                  <div className="text-sm text-gray-400">
                    {delivery.locationsCount} locations • {delivery.cylindersCount} cylinders • {new Date(delivery.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="px-2 py-1 text-xs font-medium rounded-full bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                  {delivery.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                </div>
                <Button size="sm" variant="ghost">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-800">
              <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                <Truck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">No deliveries scheduled for today</div>
                <div className="text-sm text-gray-400">Schedule deliveries in the Routes section</div>
              </div>
              <Button size="sm" variant="ghost">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button variant="outline" className="w-full">View All</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingDeliveries;
