
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';
import { toast } from 'sonner';

interface OptimizationParametersProps {
  onOptimize: (params: { prioritizeFuel: boolean; avoidTraffic: boolean }) => void;
}

const OptimizationParameters = ({ onOptimize }: OptimizationParametersProps) => {
  const [prioritizeFuel, setPrioritizeFuel] = useState(false);
  const [avoidTraffic, setAvoidTraffic] = useState(true);
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Optimization Parameters</CardTitle>
        <CardDescription>Configure how the route should be optimized</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <div className="font-medium">Prioritize Fuel Efficiency</div>
            <div className="text-xs text-muted-foreground">May result in longer travel times</div>
          </div>
          <Button 
            variant={prioritizeFuel ? "default" : "outline"} 
            size="sm"
            onClick={() => setPrioritizeFuel(!prioritizeFuel)}
          >
            {prioritizeFuel ? "On" : "Off"}
          </Button>
        </div>
        
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <div className="font-medium">Avoid Traffic</div>
            <div className="text-xs text-muted-foreground">Uses real-time traffic data</div>
          </div>
          <Button 
            variant={avoidTraffic ? "default" : "outline"} 
            size="sm"
            onClick={() => setAvoidTraffic(!avoidTraffic)}
          >
            {avoidTraffic ? "On" : "Off"}
          </Button>
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={() => {
              onOptimize({ prioritizeFuel, avoidTraffic });
              toast.success("Route optimization settings updated");
            }} 
            className="w-full gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Apply Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizationParameters;
