
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface CostSummaryProps {
  costSummary: {
    variableTotal: number;
    fixedTotal: number;
    monthlyTotal: number;
    twoVehiclesTotal: number;
    costPerKm: number;
    costPerKgLPG: number;
  };
}

const CostSummaryCard: React.FC<CostSummaryProps> = ({ costSummary }) => {
  return (
    <Card>
      <CardHeader className="bg-black text-white">
        <CardTitle>Cost Summary</CardTitle>
        <CardDescription className="text-gray-300">Key operational cost metrics</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-100 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-1">Total Cost per Month</h3>
            <div className="text-2xl font-bold">R {costSummary.monthlyTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Single vehicle</p>
          </div>
          
          <div className="bg-slate-100 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-1">Total for Fleet</h3>
            <div className="text-2xl font-bold">R {costSummary.twoVehiclesTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cost for 2 vehicles</p>
          </div>
          
          <div className="bg-slate-100 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-1">Cost per KM</h3>
            <div className="text-2xl font-bold">R {costSummary.costPerKm.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Using 10,000km average</p>
          </div>
        </div>
        
        <div className="mt-4 bg-slate-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-1">Cost per KG of LPG</h3>
          <div className="text-2xl font-bold">R {costSummary.costPerKgLPG.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Variable and fixed costs included</p>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-lg">
          <h3 className="font-medium">Cost Calculation Formula:</h3>
          <p className="text-sm mt-1">
            Cost per Km = (Variable cost / Total Distance) + (Fixed cost / Total Distance)
          </p>
          <p className="text-sm mt-1">
            = (R57,930 / 10,000) + (R5,100 / 10,000) ≈ R7.47 per km
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostSummaryCard;
