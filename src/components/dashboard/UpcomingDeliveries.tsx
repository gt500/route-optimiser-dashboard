
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeliveryData, DeliveryData } from '@/hooks/delivery/useDeliveryData';

const UpcomingDeliveries: React.FC = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const { isLoading, fetchDeliveries } = useDeliveryData();
  
  useEffect(() => {
    const loadDeliveries = async () => {
      const fetchedDeliveries = await fetchDeliveries();
      // Take only the first 3 deliveries for display
      setDeliveries(fetchedDeliveries.slice(0, 3));
    };
    
    loadDeliveries();
  }, [fetchDeliveries]);
  
  const handleNavigateToRoutes = () => {
    // Navigate to routes page with active tab selected
    navigate('/routes', { state: { activeTab: 'active' } });
  };

  const handleNavigateToDelivery = (deliveryId: string) => {
    // Navigate to routes page with specific delivery highlighted
    navigate('/routes', { state: { activeTab: 'active', highlightDelivery: deliveryId } });
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
      <CardHeader>
        <CardTitle>Upcoming Deliveries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-800">
              <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                <Truck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Loading deliveries...</div>
              </div>
            </div>
          ) : deliveries.length > 0 ? (
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
                <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                  delivery.status === 'in_progress' 
                    ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                    : 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100'
                }`}>
                  {delivery.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleNavigateToDelivery(delivery.id)}
                  aria-label={`View delivery ${delivery.name}`}
                >
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
                <div className="font-medium">No deliveries scheduled</div>
                <div className="text-sm text-gray-400">Schedule deliveries in the Routes section</div>
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleNavigateToRoutes}
                aria-label="Go to routes"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleNavigateToRoutes}
          >
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingDeliveries;
