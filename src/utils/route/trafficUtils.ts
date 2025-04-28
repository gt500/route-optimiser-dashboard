
export interface TrafficSegment {
  start: [number, number];
  end: [number, number];
  level: 'light' | 'moderate' | 'heavy';
  distance?: number;
  duration?: number;
}

export const getTrafficColor = (level: 'light' | 'moderate' | 'heavy'): string => {
  switch(level) {
    case 'light': return '#4ade80'; // Green
    case 'moderate': return '#fb923c'; // Orange
    case 'heavy': return '#ef4444'; // Red
    default: return '#4ade80';
  }
};

// Helper function to determine traffic conditions based on time of day
export const getCurrentTrafficCondition = (): 'light' | 'moderate' | 'heavy' => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  
  // Weekend traffic is generally lighter
  if (day === 0 || day === 6) {
    if (hour >= 9 && hour <= 17) return 'moderate';
    return 'light';
  }
  
  // Weekday traffic patterns
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
    return 'heavy';  // Rush hour
  }
  if ((hour > 9 && hour < 16) || (hour > 18 && hour < 22)) {
    return 'moderate'; // Business hours or evening
  }
  return 'light'; // Night time
};
