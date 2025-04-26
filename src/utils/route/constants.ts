
// Route distance correction factors based on road types
export const ROUTE_DISTANCE_CORRECTION = {
  URBAN: 1.4,    // Urban areas have more turns and traffic lights
  SUBURBAN: 1.3, // Suburban areas have some turns and lights
  RURAL: 1.15,   // Rural areas have fewer turns but may be winding
  HIGHWAY: 1.1   // Highways are mostly straight
};

// Constants for time calculation
export const AVG_SPEED_URBAN_KM_H = 35; // Average speed in urban areas
export const AVG_SPEED_RURAL_KM_H = 60; // Average speed in rural areas
export const MIN_STOP_TIME_MINUTES = 15; // Minimum time at each stop
