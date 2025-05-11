
// Traffic utilities for route visualization and calculation

// Define the TrafficSegment type
export interface TrafficSegment {
  start: [number, number];
  end: [number, number];
  level: 'light' | 'moderate' | 'heavy';
  distance?: number;
  duration?: number;
}

// Get color based on traffic level
export const getTrafficColor = (level: 'light' | 'moderate' | 'heavy'): string => {
  switch (level) {
    case 'light':
      return '#4ade80'; // green-500
    case 'moderate':
      return '#fb923c'; // orange-400
    case 'heavy':
      return '#ef4444'; // red-500
    default:
      return '#fb923c'; // orange-400 as default
  }
};

// Get current traffic condition based on time of day and day of week
export const getCurrentTrafficCondition = (): 'light' | 'moderate' | 'heavy' => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Weekend logic
  if (day === 0 || day === 6) {
    if (hour >= 10 && hour <= 14) return 'moderate';
    return 'light';
  }
  
  // Weekday logic - South African peak hours
  if ((hour >= 6 && hour <= 9) || (hour >= 16 && hour <= 18)) {
    return 'heavy';
  } else if ((hour >= 9 && hour <= 15) || (hour >= 19 && hour <= 20)) {
    return 'moderate';
  }
  
  return 'light';
};

// Calculate realistic travel time based on traffic condition and distance
export const calculateTravelTime = (
  distanceKm: number,
  trafficCondition: 'light' | 'moderate' | 'heavy',
  roadType: 'urban' | 'suburban' | 'rural' | 'highway' = 'urban'
): number => {
  // Base speeds (km/h) for different traffic conditions by road type
  const speeds: Record<string, Record<string, number>> = {
    urban: {
      light: 45,
      moderate: 30,
      heavy: 20
    },
    suburban: {
      light: 55,
      moderate: 40,
      heavy: 25
    },
    rural: {
      light: 70,
      moderate: 55,
      heavy: 40
    },
    highway: {
      light: 100,
      moderate: 80,
      heavy: 60
    }
  };
  
  // Get appropriate speed based on road type and traffic
  const speed = speeds[roadType][trafficCondition];
  
  // Calculate time in hours, then convert to minutes
  const timeHours = distanceKm / speed;
  const timeMinutes = timeHours * 60;
  
  // Add stop time for loading/unloading
  const stopTime = 5;
  
  return Math.max(stopTime, Math.round(timeMinutes));
};

// Format duration in minutes to hours and minutes
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
};

// Calculate travel speed based on distance and duration
export const calculateAvgSpeed = (distanceKm: number, durationMinutes: number): number => {
  if (durationMinutes <= 0) return 0;
  
  // Convert duration to hours
  const durationHours = durationMinutes / 60;
  
  // Calculate speed in km/h
  return distanceKm / durationHours;
};

// Detect traffic conditions based on average speed
export const detectTrafficConditions = (avgSpeedKmh: number): 'light' | 'moderate' | 'heavy' => {
  if (avgSpeedKmh > 60) return 'light';
  if (avgSpeedKmh > 35) return 'moderate';
  return 'heavy';
};

// Generate simulated traffic data for a route
export const generateSimulatedTrafficData = (
  coordinates: [number, number][],
  baseTrafficCondition: 'light' | 'moderate' | 'heavy' = 'moderate'
): TrafficSegment[] => {
  if (!coordinates || coordinates.length < 2) {
    return [];
  }
  
  const segments: TrafficSegment[] = [];
  
  // Create traffic segments with variation
  for (let i = 0; i < coordinates.length - 1; i++) {
    // Generate traffic levels with some randomness but weighted toward base condition
    let segmentTraffic = baseTrafficCondition;
    
    // Add some randomness - 20% chance to be different from base
    const rand = Math.random();
    if (rand > 0.8) {
      if (baseTrafficCondition === 'light') {
        segmentTraffic = 'moderate';
      } else if (baseTrafficCondition === 'heavy') {
        segmentTraffic = 'moderate';
      } else {
        segmentTraffic = rand > 0.5 ? 'light' : 'heavy';
      }
    }
    
    segments.push({
      start: coordinates[i],
      end: coordinates[i + 1],
      level: segmentTraffic
    });
  }
  
  return segments;
};
