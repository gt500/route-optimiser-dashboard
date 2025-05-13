
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeliveryData, DashboardDeliveryData } from '@/hooks/useDeliveryData';
import { Skeleton } from '@/components/ui/skeleton';

const UpcomingDeliveries: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardDeliveries, setDashboardDeliveries] = useState<DashboardDeliveryData[]>([]);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const { isLoading: isHookLoading, fetchDeliveries } = useDeliveryData();

  // Use useCallback to prevent unnecessary re-creation of this function on re-renders
  const loadDeliveries = useCallback(async () => {
    if (isLocalLoading) return; // Prevent multiple simultaneous loadings
    
    try {
      setIsLocalLoading(true);
      const fetchedDeliveries = await fetchDeliveries();
      
      // Transform the fetched data to DashboardDeliveryData format
      const transformedForDashboard = fetchedDeliveries.map(delivery => ({
        id: delivery.id,
        name: delivery.siteName,
        date: delivery.date,
        locationsCount: 1,
        cylindersCount: delivery.cylinders,
        status: 'scheduled'
      }));
      
      // Take only the first 3 deliveries for display
      setDashboardDeliveries(transformedForDashboard.slice(0, 3));
    } catch (error) {
      console.error("Error loading deliveries for dashboard:", error);
    } finally {
      setIsLocalLoading(false);
    }
  }, [fetchDeliveries]);
  
  // Load data only once when component mounts
  useEffect(() => {
    loadDeliveries();
    // We don't need to refresh this data frequently, so no dependencies here
    // This prevents unnecessary re-fetching
  }, []);

  const handleNavigateToRoutes = () => {
    navigate('/routes', { state: { activeTab: 'active' } });
  };

  const handleNavigateToDelivery = (deliveryId: string) => {
    navigate('/routes', { state: { activeTab: 'active', highlightDelivery: deliveryId } });
  };

  // Determine if we're in a loading state
  const isLoading = isHookLoading || isLocalLoading;

  return (
    <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
      <CardHeader>
        <CardTitle>Upcoming Deliveries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            // Show loading skeletons instead of loading text
            <>
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-gray-800">
                  <Skeleton className="w-10 h-10 rounded-full bg-gray-700" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2 bg-gray-700" />
                    <Skeleton className="h-3 w-5/6 bg-gray-700" />
                  </div>
                </div>
              ))}
            </>
          ) : dashboardDeliveries.length > 0 ? (
            dashboardDeliveries.map((delivery) => (
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
