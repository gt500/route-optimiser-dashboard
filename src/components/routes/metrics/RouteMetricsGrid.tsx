
import React, { useState, useEffect } from 'react';
import RouteMetricsCard from './RouteMetricsCard';
import { Info, MapPin, TruckIcon, AlertTriangle, Clock, CircleCheck, CircleX, ChevronsDown, ChevronsUp, Fuel } from 'lucide-react';

interface RouteMetricsGridProps {
  distance: number;
  duration: number;
  fuelConsumption: number;
  fuelCost: number;
  cylinders: number;
  locations: number;
  totalWeight?: number;
  fuelCostPerLiter?: number;
  trafficConditions?: 'light' | 'moderate' | 'heavy';
  usingRealTimeData?: boolean;
  onFuelCostChange?: (newCost: number) => void;
}

// New: Card "detail" dialog. Kept as simple modal at bottom for now.
const DetailDialog = ({ open, title, detail, onClose } : { open: boolean, title: string, detail: React.ReactNode, onClose: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative">
        <button className="absolute top-2 right-3 text-gray-500 hover:text-primary" onClick={onClose}>
          <span aria-label="close">&times;</span>
        </button>
        <h2 className="text-lg font-semibold mb-2">{title} Details</h2>
        <div>{detail}</div>
      </div>
    </div>
  );
};

const RouteMetricsGrid: React.FC<RouteMetricsGridProps> = ({
  distance = 0,
  duration = 0,
  fuelConsumption = 0,
  fuelCost = 0,
  cylinders = 0,
  locations = 0,
  totalWeight = 0,
  fuelCostPerLiter = 0,
  trafficConditions = 'moderate',
  usingRealTimeData = true,
  onFuelCostChange
}) => {
  const [localFuelCost, setLocalFuelCost] = useState(fuelCost);
  const [localFuelCostPerLiter, setLocalFuelCostPerLiter] = useState(fuelCostPerLiter);
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  useEffect(() => {
    setLocalFuelCost(fuelCost);
    if (fuelCostPerLiter) setLocalFuelCostPerLiter(fuelCostPerLiter);
  }, [fuelCost, fuelCostPerLiter]);

  // Format utility functions
  const formatDistance = (km: number): string => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Calculate fuel saved compared to non-optimized route (estimated 15% saving from optimization)
  const calculateFuelSaved = (): number => {
    // Assume non-optimized route would use ~15% more fuel
    const nonOptimizedFuel = fuelConsumption / 0.85;
    return nonOptimizedFuel - fuelConsumption;
  };

  // Calculate CO2 emissions - about 2.3 kg CO2 per liter of diesel
  const calculateCO2Emissions = (): number => {
    return fuelConsumption * 2.3; // kg of CO2
  };

  const estimatedMaintenanceCost = distance * 0.85; // R0.85 per km for maintenance
  const totalOperatingCost = localFuelCost + estimatedMaintenanceCost;
  const fuelSaved = calculateFuelSaved();

  const getTrafficStatus = (): JSX.Element => {
    switch(trafficConditions) {
      case 'light':
        return (
          <div className="flex items-center gap-1 text-green-500">
            <ChevronsDown className="h-4 w-4" /> 
            <span className="truncate">Light traffic</span>
          </div>
        );
      case 'moderate':
        return (
          <div className="flex items-center gap-1 text-yellow-500">
            <Clock className="h-4 w-4" /> 
            <span className="truncate">Moderate traffic</span>
          </div>
        );
      case 'heavy':
        return (
          <div className="flex items-center gap-1 text-red-500">
            <ChevronsUp className="h-4 w-4" /> 
            <span className="truncate">Heavy traffic</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-yellow-500">
            <Clock className="h-4 w-4" /> 
            <span className="truncate">Moderate traffic</span>
          </div>
        );
    }
  };

  // Card details for dialog
  const details = {
    distance: (
      <div>
        <div className="mb-1 font-semibold">Total Distance: {formatDistance(distance)}</div>
        <div>Based on {usingRealTimeData ? "real-time data" : "map calculation"} for all route segments.</div>
      </div>
    ),
    duration: (
      <div>
        <div className="mb-1 font-semibold">Estimated Time: {formatTime(duration)}</div>
        <div>Includes estimated traffic ({trafficConditions}) at each route segment.</div>
      </div>
    ),
    cost: (
      <div>
        <div className="mb-1 font-semibold">Operating Cost: R {totalOperatingCost.toFixed(2)}</div>
        <div>Fuel cost: R{localFuelCost.toFixed(2)}<br />
          Maintenance: R{estimatedMaintenanceCost.toFixed(2)}</div>
        <div>Fuel Saved: {fuelSaved.toFixed(1)}L (R{(fuelSaved * localFuelCostPerLiter).toFixed(2)})</div>
        <div>CO₂ Emissions: {calculateCO2Emissions().toFixed(1)}kg</div>
      </div>
    ),
    load: (
      <div>
        <div className="mb-1 font-semibold">{cylinders > 0 ? `${cylinders} Cylinders` : "No Load"}</div>
        {totalWeight > 0 ? <>
          <div>Total weight: {totalWeight.toFixed(0)} kg</div>
          {totalWeight > 1000 && <div className="text-amber-600 flex items-center"><AlertTriangle className="h-4 w-4 mr-2" />High load</div>}
        </> : <div>No weight data for this route.</div>}
      </div>
    )
  };

  // Responsive 2x2 for >= sm and 1 column for mobile
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      <RouteMetricsCard 
        title="Total Distance"
        value={formatDistance(distance)}
        icon={<MapPin className="h-5 w-5" />}
        color="bg-blue-600"
        onClick={() => setOpenDialog("distance")}
        subtitle={
          <div className="truncate">
            {usingRealTimeData ? "Based on real-time data" : "Based on map calculation"}
          </div>
        }
        tooltip="Total distance of the optimized route"
      />
      <RouteMetricsCard 
        title="Estimated Time"
        value={formatTime(duration)}
        icon={<Clock className="h-5 w-5" />}
        color="bg-amber-600"
        onClick={() => setOpenDialog("duration")}
        subtitle={getTrafficStatus()}
        tooltip="Estimated driving time with current traffic conditions"
      />
      <RouteMetricsCard 
        title="Operating Cost"
        value={`R ${totalOperatingCost.toFixed(2)}`}
        icon={<Fuel className="h-5 w-5" />}
        color="bg-green-600"
        onClick={() => setOpenDialog("cost")}
        subtitle={
          <div className="space-y-1 text-xs">
            <div className="truncate">Fuel: R{localFuelCost.toFixed(2)} • Maintenance: R{estimatedMaintenanceCost.toFixed(2)}</div>
            <div className="text-green-700 flex items-center gap-1">
              <CircleCheck className="h-3 w-3" /> 
              <span className="truncate">Fuel Saved: {fuelSaved.toFixed(1)}L (R{(fuelSaved * localFuelCostPerLiter).toFixed(2)})</span>
            </div>
            <div className="text-green-700 truncate">
              CO₂: {calculateCO2Emissions().toFixed(1)}kg
            </div>
          </div>
        }
        tooltip="Total operating cost including fuel and maintenance"
      />
      <RouteMetricsCard 
        title="Load Details"
        value={cylinders > 0 ? `${cylinders} Cylinders` : "No Load"}
        icon={<TruckIcon className="h-5 w-5" />}
        color="bg-indigo-600"
        onClick={() => setOpenDialog("load")}
        subtitle={
          totalWeight > 0 ? 
          <div className={`${totalWeight > 1000 ? "text-amber-600 font-medium" : ""} truncate`}>
            {totalWeight.toFixed(0)} kg total weight
            {totalWeight > 1000 && <AlertTriangle className="h-3 w-3 inline ml-1" />}
          </div> : 
          "No weight data"
        }
        tooltip="Total number of cylinders and weight in the vehicle"
      />
      {/* Detail dialog */}
      <DetailDialog 
        open={!!openDialog}
        title={
          openDialog === "distance" ? "Total Distance" :
          openDialog === "duration" ? "Estimated Time" :
          openDialog === "cost" ? "Operating Cost" : 
          openDialog === "load" ? "Load Details" : ""
        }
        detail={openDialog ? (details as any)[openDialog] : null}
        onClose={() => setOpenDialog(null)}
      />
    </div>
  );
};

export default RouteMetricsGrid;

