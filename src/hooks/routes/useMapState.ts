
import { useState, useEffect } from 'react';
import { LocationPoint, NamedCoords } from '@/types/location';
import { getRegionCoordinates } from '@/utils/route/regionUtils';

export const useMapState = (
  locations: LocationPoint[] = [],
  startLocation?: NamedCoords,
  endLocation?: NamedCoords,
  waypoints: NamedCoords[] = [],
  country?: string,
  region?: string
) => {
  const [mapReady, setMapReady] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-33.918861, 18.423300]);
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [routeInitialized, setRouteInitialized] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  const calculateCenter = () => {
    if (locations.length === 0 && !startLocation && !endLocation && waypoints.length === 0) {
      const regionCoords = getRegionCoordinates(country, region);
      setMapZoom(regionCoords.zoom);
      return regionCoords.center;
    }

    const points: [number, number][] = [];

    if (startLocation) {
      points.push(startLocation.coords);
    }

    if (endLocation) {
      points.push(endLocation.coords);
    }

    waypoints.forEach((wp) => {
      if (!isNaN(wp.coords[0]) && !isNaN(wp.coords[1]) && 
          wp.coords[0] !== 0 && wp.coords[1] !== 0) {
        points.push(wp.coords);
      }
    });

    locations.forEach((loc) => {
      if (loc.latitude && loc.longitude) {
        points.push([loc.latitude, loc.longitude]);
      }
    });

    if (points.length === 0) {
      return [-33.918861, 18.423300];
    }

    const validPoints = points.filter(point => 
      !isNaN(point[0]) && !isNaN(point[1]) && 
      point[0] !== 0 && point[1] !== 0
    );
    
    if (validPoints.length === 0) {
      return [-33.918861, 18.423300];
    }

    const lat = validPoints.reduce((sum, point) => sum + point[0], 0) / validPoints.length;
    const lng = validPoints.reduce((sum, point) => sum + point[1], 0) / validPoints.length;
    return [lat, lng] as [number, number];
  };

  useEffect(() => {
    const newCenter = calculateCenter();
    setMapCenter(newCenter);
    
    if (region) {
      const regionCoords = getRegionCoordinates(country, region);
      setMapZoom(regionCoords.zoom);
    }
  }, [locations, startLocation, endLocation, waypoints, country, region]);

  return {
    mapReady,
    setMapReady,
    mapCenter,
    mapZoom,
    routeInitialized,
    setRouteInitialized,
    routeCoordinates,
    setRouteCoordinates
  };
};
