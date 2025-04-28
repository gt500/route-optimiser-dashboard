
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

// Get current traffic condition based on time of day
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

// Calculate realistic travel time based on traffic condition
export const calculateTravelTime = (
  distanceKm: number,
  trafficCondition: 'light' | 'moderate' | 'heavy'
): number => {
  // Base speeds (km/h) for different traffic conditions
  const speeds = {
    light: 60,
    moderate: 45,
    heavy: 30
  };
  
  // Calculate time in hours, then convert to minutes
  const timeHours = distanceKm / speeds[trafficCondition];
  const timeMinutes = timeHours * 60;
  
  return Math.max(5, Math.round(timeMinutes));
};

// Format duration in minutes to hours and minutes
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
};
