
import { useState, useCallback } from 'react';
import { LocationType } from '@/types/location';

const useCylinderState = (
  availableLocations: LocationType[],
  onAddLocationToRoute: (location: LocationType & { cylinders: number }) => void
) => {
  // State for cylinder counts for each location
  const [locationCylinders, setLocationCylinders] = useState<{[key: string]: number}>({});

  const handleChangeCylinderCount = useCallback((locationId: string, change: number) => {
    setLocationCylinders(prev => {
      const current = prev[locationId] || 10;
      const newCount = Math.max(1, Math.min(25, current + change));
      return { ...prev, [locationId]: newCount };
    });
  }, []);

  const getCylinderCount = useCallback((locationId: string) => {
    return locationCylinders[locationId] || 10;
  }, [locationCylinders]);

  const addLocationWithCylinders = useCallback((locationId: string) => {
    const location = availableLocations.find(loc => loc.id.toString() === locationId);
    if (location) {
      const cylinderCount = getCylinderCount(locationId);
      onAddLocationToRoute({ ...location, cylinders: cylinderCount });
    }
  }, [availableLocations, getCylinderCount, onAddLocationToRoute]);

  return {
    locationCylinders,
    handleChangeCylinderCount,
    getCylinderCount,
    addLocationWithCylinders
  };
};

export default useCylinderState;
