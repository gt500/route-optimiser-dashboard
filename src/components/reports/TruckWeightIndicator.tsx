
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Weight, AlertTriangle } from 'lucide-react';
import { ReportMetricsCard } from '@/components/reports/ReportMetricsCard';
import { MAX_CYLINDERS, CYLINDER_WEIGHT_KG } from '@/hooks/routes/types';

interface TruckWeightIndicatorProps {
  totalCylinders: number;
  maxCylinders?: number;
  cylinderWeight?: number;
}

const TruckWeightIndicator: React.FC<TruckWeightIndicatorProps> = ({
  totalCylinders,
  maxCylinders = MAX_CYLINDERS, // Default using our constant
  cylinderWeight = CYLINDER_WEIGHT_KG // Default to 9kg per cylinder
}) => {
  // Only FULL cylinders (delivered) count towards the weight. Empties are 0kg.
  const currentWeight = totalCylinders * cylinderWeight;
  const maxWeight = maxCylinders * cylinderWeight;
  const weightPercentage = (currentWeight / maxWeight) * 100;
  const isOverweight = totalCylinders > maxCylinders;

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
        value={`${currentWeight} kg`}
        icon={<Weight />}
        color={getWeightStatusColor()}
        tooltip={`Maximum load: ${maxWeight} kg (${maxCylinders} cylinders of 9kg)`}
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
            Current load ({totalCylinders} cylinders, {currentWeight} kg) exceeds the maximum capacity 
            ({maxCylinders} cylinders, {maxWeight} kg). Please remove some locations.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TruckWeightIndicator;
