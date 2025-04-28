
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Weight, ChevronDown, ChevronUp, Cylinder, Truck } from 'lucide-react';
import ReportMetricsCard from '@/components/reports/ReportMetricsCard';
import { MAX_CYLINDERS, CYLINDER_WEIGHT_KG, EMPTY_CYLINDER_WEIGHT_KG } from '@/hooks/routes/types';
import { calculateTotalWeight, calculateRouteWeightProfile } from '@/utils/route/weightUtils';
import { LocationType } from '@/types/location';
import { Button } from '@/components/ui/button';

interface TruckWeightIndicatorProps {
  totalCylinders: number;
  maxCylinders?: number;
  cylinderWeight?: number;
  emptyCylinders?: number;
  locations?: LocationType[];
  startLocationId?: string | null;
  endLocationId?: string | null;
}

const TruckWeightIndicator: React.FC<TruckWeightIndicatorProps> = ({
  totalCylinders,
  maxCylinders = MAX_CYLINDERS,
  cylinderWeight = CYLINDER_WEIGHT_KG,
  emptyCylinders = 0,
  locations = [],
  startLocationId = null,
  endLocationId = null
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Use the correct weight calculation when locations are available
  const currentWeight = locations && locations.length > 0 
    ? calculateTotalWeight(locations, startLocationId, endLocationId) 
    : 0;

  const maxWeight = maxCylinders * cylinderWeight;
  const weightPercentage = maxWeight > 0 ? (currentWeight / maxWeight) * 100 : 0;
  const isOverweight = currentWeight > maxWeight;
  
  // Calculate weight at each stop
  const weightProfile = locations && locations.length > 0
    ? calculateRouteWeightProfile(locations, startLocationId, endLocationId)
    : [];

  const getWeightStatusColor = () => {
    if (isOverweight) return "bg-gradient-to-br from-red-500 to-red-600";
    if (weightPercentage > 90) return "bg-gradient-to-br from-amber-500 to-amber-600";
    if (weightPercentage > 70) return "bg-gradient-to-br from-yellow-500 to-yellow-600";
    return "bg-gradient-to-br from-green-500 to-green-600";
  };

  return (
    <div className="space-y-2">
      <ReportMetricsCard
        title="Truck Weight"
        value={`${Math.round(currentWeight)} kg / ${maxWeight} kg`}
        icon={<Truck size={20} />}
        color={getWeightStatusColor()}
        tooltip={`
          Max load: ${maxWeight} kg (${maxCylinders} cylinders).
          Full cylinder: ${cylinderWeight}kg
          Empty cylinder: ${EMPTY_CYLINDER_WEIGHT_KG}kg
          Shows maximum weight during route accounting for cylinder exchanges.
        `}
      />
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {Math.round(weightPercentage)}% of capacity ({Math.round(currentWeight)} of {maxWeight} kg)
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-xs"
        >
          {showDetails ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Hide details
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Show details
            </>
          )}
        </Button>
      </div>
      
      {showDetails && weightProfile.length > 0 && (
        <div className="mt-2 border rounded-md overflow-hidden bg-slate-50">
          <div className="p-2 bg-muted font-medium text-sm">Weight by Stop</div>
          <div className="max-h-60 overflow-y-auto">
            {weightProfile.map((stop, index) => (
              <div 
                key={index}
                className="p-2 border-b flex justify-between items-center"
              >
                <div>
                  <div className="font-medium text-sm">{stop.location}</div>
                  <div className="text-xs flex items-center gap-2">
                    <span className="flex items-center">
                      <Cylinder className="h-3 w-3 mr-1 text-blue-500" /> 
                      {stop.fullCylinders} full
                    </span>
                    <span className="flex items-center">
                      <Cylinder className="h-3 w-3 mr-1 text-gray-400" /> 
                      {stop.emptyCylinders} empty
                    </span>
                  </div>
                </div>
                <div className={`font-medium ${stop.weight > maxWeight ? 'text-red-600' : 'text-green-600'}`}>
                  {Math.round(stop.weight)} kg
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOverweight && (
        <Alert 
          variant="destructive" 
          className="mt-2 py-2 border-2 border-red-500 animate-pulse"
          style={{
            animation: 'pulse 0.8s infinite alternate',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
          }}
        >
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-600 font-bold">Weight limit exceeded!</AlertTitle>
          <AlertDescription className="text-red-600">
            Current load: {Math.round(currentWeight)} kg. Max allowed: {maxWeight} kg ({maxCylinders} cylinders).
            <br />Please adjust route stops to reduce weight.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TruckWeightIndicator;
