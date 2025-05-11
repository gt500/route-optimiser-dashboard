
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRouteData } from '@/hooks/fleet/useRouteData';
import { toast } from 'sonner';

interface DeliveryItemProps {
  id: string;
  name: string;
  date: string;
  locationsCount?: number; // Optional to match the data structure
  cylindersCount: number;
  status: string;
}

interface UpcomingDeliveriesProps {
  deliveries?: DeliveryItemProps[];
}

const UpcomingDeliveries: React.FC<UpcomingDeliveriesProps> = ({ deliveries: propDeliveries }) => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DeliveryItemProps[]>([]);
  const { fetchActiveRoutes, isLoading } = useRouteData();
  
  // Fetch active routes directly to ensure sync with routes page
  useEffect(() => {
    const loadActiveRoutes = async () => {
      try {
        const activeRoutes = await fetchActiveRoutes();
        
        // Transform active routes into the delivery format
        const formattedDeliveries = activeRoutes.map(route => ({
          id: route.id,
          name: route.name,
          date: route.date,
          locationsCount: route.stops?.length || 0,
          cylindersCount: route.total_cylinders || 0,
          status: route.status
        })).slice(0, 3); // Take only first 3
        
        setDeliveries(formattedDeliveries);
      } catch (error) {
        console.error('Error loading active routes for dashboard:', error);
        toast.error('Failed to load upcoming deliveries');
        setDeliveries([]);
      }
    };
    
    loadActiveRoutes();
  }, [fetchActiveRoutes]);
  
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
                <div className="font-medium">No deliveries scheduled for today</div>
                <div className="text-sm text-gray-400">Schedule deliveries in the Routes section</div>
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleNavigateToRoutes}
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
