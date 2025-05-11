
import { useState } from 'react';

export const useFleetCostState = () => {
  const [fuelCost, setFuelCost] = useState(21.95); // Default fuel cost
  
  const handleFuelCostUpdate = (newCost: number) => {
    setFuelCost(newCost);
    // In a real app, we would also update this in a database or global state
  };
  
  return {
    fuelCost,
    handleFuelCostUpdate
  };
};
