
import { useState } from 'react';
import { format, subDays } from 'date-fns';

type DetailType = 'deliveries' | 'fuel' | 'route' | 'cylinders' | null;

const useAnalyticsDetailDialog = ({ routeDataHook }: { routeDataHook: any }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailType, setDetailType] = useState<DetailType>(null);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [detailTitle, setDetailTitle] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);

  const showCardDetail = async (type: DetailType) => {
    if (!type) return;

    setDetailType(type);
    setDetailLoading(true);
    setDetailOpen(true);

    const today = new Date();
    const lastWeek = subDays(today, 7);

    try {
      const routes = await routeDataHook.fetchRouteData();

      const recentRoutes = routes.filter((route: any) => {
        const routeDate = new Date(route.date);
        return routeDate >= lastWeek && routeDate <= today;
      });

      recentRoutes.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const formattedData = recentRoutes.map((route: any) => {
        // Calculate realistic duration based on distance
        // Using an average speed of 40 km/h = 2/3 km per minute
        // So time in minutes = distance / (2/3) = distance * 1.5
        const distance = route.total_distance || 0;
        
        // Calculate duration in minutes with a minimum of 15 minutes per route
        // For longer routes, add extra time for stops (roughly 1 stop per 20 km)
        const estimatedStops = Math.max(1, Math.ceil(distance / 20));
        const stopTimeMinutes = estimatedStops * 15; // 15 minutes per stop
        
        // Driving time calculation with average speed of 40 km/h
        const drivingTimeMinutes = (distance / 40) * 60;
        
        // Total duration is driving time plus stop time
        const calculatedDuration = Math.max(15, Math.round(drivingTimeMinutes + stopTimeMinutes));
        
        return {
          id: route.id,
          name: route.name,
          date: format(new Date(route.date), 'MMM d, yyyy'),
          rawDate: new Date(route.date),
          distance: route.total_distance || 0,
          // Use calculated duration instead of the database value
          duration: calculatedDuration,
          cost: route.estimated_cost || 0,
          cylinders: route.total_cylinders || 0,
          status: route.status
        };
      });

      setDetailData(formattedData);

      switch (type) {
        case 'deliveries':
          setDetailTitle('Recent Deliveries');
          break;
        case 'fuel':
          setDetailTitle('Recent Fuel Costs');
          break;
        case 'route':
          setDetailTitle('Recent Route Lengths');
          break;
        case 'cylinders':
          setDetailTitle('Recent Cylinder Deliveries');
          break;
      }
    } catch (error) {
      console.error('Error fetching detail data:', error);
      setDetailData([]);
    } finally {
      setDetailLoading(false);
    }
  };

  return {
    detailOpen,
    detailType,
    detailData,
    detailTitle,
    detailLoading,
    setDetailOpen,
    showCardDetail,
    setDetailType,
    setDetailTitle,
  };
};

export default useAnalyticsDetailDialog;
