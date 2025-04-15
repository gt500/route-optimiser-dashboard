
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, TruckIcon, Fuel, Route, Package } from 'lucide-react';

interface MetricsCardsProps {
  deliveries: number;
  deliveriesChange: number;
  fuelCost: number;
  fuelCostChange: number;
  routeLength: number;
  routeLengthChange: number;
  cylinders: number;
  cylindersChange: number;
  onCardClick: (type: 'deliveries' | 'fuel' | 'route' | 'cylinders') => void;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({
  deliveries,
  deliveriesChange,
  fuelCost,
  fuelCostChange,
  routeLength,
  routeLengthChange,
  cylinders,
  cylindersChange,
  onCardClick
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card 
        className="hover:shadow-md transition-shadow duration-300 cursor-pointer bg-black text-white"
        onClick={() => onCardClick('deliveries')}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-white/90">Total Deliveries</CardTitle>
          <TruckIcon className="h-4 w-4 text-white/60" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{deliveries.toLocaleString()}</div>
          <div className="flex items-center pt-1">
            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-xs text-green-500 mr-1">{deliveriesChange}%</span>
            <span className="text-xs text-white/60">from previous period</span>
          </div>
        </CardContent>
      </Card>
      
      <Card 
        className="hover:shadow-md transition-shadow duration-300 cursor-pointer bg-black text-white"
        onClick={() => onCardClick('fuel')}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-white/90">Fuel Costs</CardTitle>
          <Fuel className="h-4 w-4 text-white/60" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">R{fuelCost.toFixed(2)}</div>
          <div className="flex items-center pt-1">
            <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-xs text-red-500 mr-1">{fuelCostChange}%</span>
            <span className="text-xs text-white/60">from previous period</span>
          </div>
        </CardContent>
      </Card>
      
      <Card 
        className="hover:shadow-md transition-shadow duration-300 cursor-pointer bg-black text-white"
        onClick={() => onCardClick('route')}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-white/90">Avg. Route Length</CardTitle>
          <Route className="h-4 w-4 text-white/60" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{routeLength.toFixed(1)} km</div>
          <div className="flex items-center pt-1">
            <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-xs text-green-500 mr-1">{routeLengthChange}%</span>
            <span className="text-xs text-white/60">from previous period</span>
          </div>
        </CardContent>
      </Card>
      
      <Card 
        className="hover:shadow-md transition-shadow duration-300 cursor-pointer bg-black text-white"
        onClick={() => onCardClick('cylinders')}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-white/90">Cylinders Delivered</CardTitle>
          <Package className="h-4 w-4 text-white/60" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{cylinders.toLocaleString()}</div>
          <div className="flex items-center pt-1">
            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-xs text-green-500 mr-1">{cylindersChange}%</span>
            <span className="text-xs text-white/60">from previous period</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsCards;
