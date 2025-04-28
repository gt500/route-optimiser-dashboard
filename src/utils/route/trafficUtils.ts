
/**
 * Traffic utility functions for route calculation
 */

/**
 * Get the current traffic condition based on time of day
 * @returns Traffic condition ('light', 'moderate', 'heavy')
 */
export function getCurrentTrafficCondition(): 'light' | 'moderate' | 'heavy' {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Weekend
  if (day === 0 || day === 6) {
    if (hour >= 10 && hour <= 14) {
      // Weekend midday can be moderately busy
      return 'moderate';
    } else {
      // Most of the weekend is light traffic
      return 'light';
    }
  }
  
  // Weekday
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
    // Rush hours - heavy traffic
    return 'heavy';
  } else if ((hour >= 10 && hour <= 15) || hour === 19) {
    // Business hours - moderate traffic
    return 'moderate';
  } else {
    // Early morning and late night - light traffic
    return 'light';
  }
}

/**
 * Calculate traffic delay factor based on conditions
 * @param trafficCondition Traffic condition
 * @returns Multiplier for travel time (1.0 = no delay, higher means more delay)
 */
export function calculateTrafficDelayFactor(trafficCondition: 'light' | 'moderate' | 'heavy'): number {
  switch (trafficCondition) {
    case 'light':
      return 1.0; // No extra delay
    case 'moderate':
      return 1.25; // 25% longer
    case 'heavy':
      return 1.6; // 60% longer
    default:
      return 1.0;
  }
}

/**
 * Estimate current traffic delay for a specific route in Cape Town
 * @param startLat Starting latitude
 * @param startLng Starting longitude
 * @param endLat Ending latitude
 * @param endLng Ending longitude
 * @returns Traffic delay factor
 */
export function estimateTrafficDelay(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): number {
  // Cape Town CBD coordinates (approximate)
  const cbdLat = -33.92;
  const cbdLng = 18.42;
  
  // Calculate if route is going through the CBD
  const isThroughCBD = isRouteThroughCBD(startLat, startLng, endLat, endLng, cbdLat, cbdLng);
  
  // Get base traffic condition
  const baseCondition = getCurrentTrafficCondition();
  let delayFactor = calculateTrafficDelayFactor(baseCondition);
  
  // Add extra delay if going through the CBD during busy hours
  if (isThroughCBD) {
    const now = new Date();
    const hour = now.getHours();
    
    if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
      // CBD rush hour - add extra delay
      delayFactor *= 1.2;
    }
  }
  
  return delayFactor;
}

/**
 * Simple check if a route likely goes through the CBD
 */
function isRouteThroughCBD(
  startLat: number, 
  startLng: number,
  endLat: number,
  endLng: number,
  cbdLat: number,
  cbdLng: number
): boolean {
  // Simple check: draw a line between start and end points,
  // then check if CBD is near that line
  
  // Calculate distance from the center of the line to the CBD
  const lineMidLat = (startLat + endLat) / 2;
  const lineMidLng = (startLng + endLng) / 2;
  
  // Distance from line midpoint to CBD (simple Euclidean - not geodesic)
  const distToCBD = Math.sqrt(
    Math.pow(lineMidLat - cbdLat, 2) + 
    Math.pow(lineMidLng - cbdLng, 2)
  );
  
  // If the CBD is within this threshold of the route line, assume the route goes through CBD
  return distToCBD < 0.05; // About 5km at Cape Town's latitude
}
