
// Route calculation constants

// Default max number of cylinders for vehicle
export const MAX_CYLINDERS = 230;

// Weight of a cylinder in kg
export const CYLINDER_WEIGHT_KG = 14.5;

// Road correction factors for direct distance to road distance
export const ROUTE_DISTANCE_CORRECTION = {
  URBAN: 1.5,     // City streets with many turns
  SUBURBAN: 1.3,  // Mix of main roads and streets
  RURAL: 1.25,    // Country roads
  HIGHWAY: 1.1    // Highway/motorway routes
};

// Average speeds (km/h)
export const AVG_SPEED_URBAN_KM_H = 30;
export const AVG_SPEED_SUBURBAN_KM_H = 50;
export const AVG_SPEED_RURAL_KM_H = 70;
export const AVG_SPEED_HIGHWAY_KM_H = 100;

// Minimum time in minutes spent at a stop
export const MIN_STOP_TIME_MINUTES = 5;

// Base fuel consumption for empty vehicle (L/100km)
export const BASE_FUEL_CONSUMPTION = 12;

// Fuel consumption increase per 100kg (L/100km)
export const FUEL_CONSUMPTION_PER_100KG = 0.5;
