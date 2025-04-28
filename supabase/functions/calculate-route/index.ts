
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { waypoints } = await req.json();
    
    if (!waypoints || waypoints.length < 2) {
      throw new Error('At least 2 waypoints are required');
    }

    // Format waypoints for Google Maps API
    const origin = `${waypoints[0].latitude},${waypoints[0].longitude}`;
    const destination = `${waypoints[waypoints.length - 1].latitude},${waypoints[waypoints.length - 1].longitude}`;
    
    // Format intermediate waypoints if any
    let waypointsParam = '';
    if (waypoints.length > 2) {
      const intermediatePoints = waypoints
        .slice(1, -1)
        .map(wp => `${wp.latitude},${wp.longitude}`)
        .join('|');
      waypointsParam = `&waypoints=optimize:true|${intermediatePoints}`;
    }

    // Call Google Maps Directions API
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${waypointsParam}&departure_time=now&traffic_model=best_guess&key=${GOOGLE_MAPS_API_KEY}`;
    
    console.log('Calling Google Maps API with URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Maps API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    // Process the response
    const route = data.routes[0];
    const legs = route.legs;
    
    // Calculate total distance and duration
    const totalDistance = legs.reduce((sum: number, leg: any) => sum + leg.distance.value / 1000, 0);
    const totalDuration = legs.reduce((sum: number, leg: any) => sum + leg.duration_in_traffic?.value || leg.duration.value, 0) / 60;

    // Generate waypoint data for each stop
    const waypointData = legs.map((leg: any) => ({
      distance: leg.distance.value / 1000, // Convert to kilometers
      duration: (leg.duration_in_traffic?.value || leg.duration.value) / 60, // Convert to minutes
    }));

    // Determine traffic conditions based on duration ratio
    const trafficCondition = legs.reduce((worst: string, leg: any) => {
      const normalDuration = leg.duration.value;
      const actualDuration = leg.duration_in_traffic?.value || normalDuration;
      const ratio = actualDuration / normalDuration;

      if (ratio > 1.5 || worst === 'heavy') return 'heavy';
      if (ratio > 1.2 || worst === 'moderate') return 'moderate';
      return 'light';
    }, 'light') as 'light' | 'moderate' | 'heavy';

    // Extract the path coordinates
    const coordinates = route.overview_path || 
      route.overview_polyline.points.split('.').map((point: string) => {
        const [lat, lng] = point.split(',').map(Number);
        return [lat, lng] as [number, number];
      });

    console.log('Route calculated successfully:', {
      distance: totalDistance,
      duration: totalDuration,
      stops: waypointData.length,
      traffic: trafficCondition
    });

    return new Response(
      JSON.stringify({
        distance: totalDistance,
        duration: totalDuration,
        coordinates,
        waypointData,
        trafficConditions: trafficCondition
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error calculating route:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
