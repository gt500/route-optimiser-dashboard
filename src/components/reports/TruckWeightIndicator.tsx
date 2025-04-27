
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Weight } from 'lucide-react';
import ReportMetricsCard from '@/components/reports/ReportMetricsCard';
import { MAX_CYLINDERS, CYLINDER_WEIGHT_KG, EMPTY_CYLINDER_WEIGHT_KG } from '@/hooks/routes/types';
import { calculateTotalWeight } from '@/utils/route/weightUtils';
import { LocationType } from '@/types/location';

interface TruckWeightIndicatorProps {
  totalCylinders: number;
  maxCylinders?: number;
  cylinderWeight?: number;
  emptyCylinders?: number;
  locations?: LocationType[];
}

const TruckWeightIndicator: React.FC<TruckWeightIndicatorProps> = ({
  totalCylinders,
  maxCylinders = MAX_CYLINDERS,
  cylinderWeight = CYLINDER_WEIGHT_KG,
  emptyCylinders = 0,
  locations = []
}) => {
  // Use smart calculation if locations are provided
  const currentWeight = locations.length > 0 
    ? calculateTotalWeight(locations) 
    : 0; // Default to 0 weight if no locations are set

  const maxWeight = maxCylinders * cylinderWeight;
  const weightPercentage = maxWeight > 0 ? (currentWeight / maxWeight) * 100 : 0;
  const isOverweight = currentWeight > maxWeight;

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
        value={`${Math.round(currentWeight)} kg`}
        icon={<Weight />}
        color={getWeightStatusColor()}
        tooltip={`
          Max load: ${maxWeight} kg (${maxCylinders} cylinders: full=${cylinderWeight}kg, empty=${EMPTY_CYLINDER_WEIGHT_KG}kg).
          Shows maximum weight during route accounting for cylinder exchanges.
        `}
      />
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
          <AlertDescription className="text-red-600 font-bold">
            Current load: {Math.round(currentWeight)} kg. Max allowed: {maxWeight} kg. Please adjust route.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TruckWeightIndicator;
