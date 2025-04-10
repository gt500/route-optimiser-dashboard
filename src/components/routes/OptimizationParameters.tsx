
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RotateCw, TimerIcon, FuelIcon, MapIcon, WifiIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface OptimizationParametersProps {
  onOptimize?: (params: { 
    prioritizeFuel: boolean; 
    avoidTraffic: boolean;
    useRealTimeData: boolean;
    optimizeForDistance: boolean;
  }) => void;
}

const OptimizationParameters = ({ onOptimize = () => {} }: OptimizationParametersProps) => {
  const [prioritizeFuel, setPrioritizeFuel] = useState(true);
  const [avoidTraffic, setAvoidTraffic] = useState(true);
  const [useRealTimeData, setUseRealTimeData] = useState(true);
  const [optimizeForDistance, setOptimizeForDistance] = useState(true);
  
  return (
    <Card className="shadow-sm bg-black">
      <CardHeader>
        <CardTitle className="text-base text-white">Optimization Parameters</CardTitle>
        <CardDescription>Configure how the route should be optimized</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex gap-2 items-center">
            <FuelIcon className="h-4 w-4 text-gray-400" />
            <div>
              <div className="font-medium text-white">Prioritize Fuel Efficiency</div>
              <div className="text-xs text-gray-400">Reduces fuel consumption based on current load</div>
            </div>
          </div>
          <Switch 
            checked={prioritizeFuel}
            onCheckedChange={setPrioritizeFuel}
            aria-label="Toggle fuel efficiency"
          />
        </div>
        
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex gap-2 items-center">
            <TimerIcon className="h-4 w-4 text-gray-400" />
            <div>
              <div className="font-medium text-white">Avoid Traffic</div>
              <div className="text-xs text-gray-400">Route around congested areas where possible</div>
            </div>
          </div>
          <Switch 
            checked={avoidTraffic}
            onCheckedChange={setAvoidTraffic}
            aria-label="Toggle avoid traffic"
          />
        </div>
        
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex gap-2 items-center">
            <WifiIcon className="h-4 w-4 text-gray-400" />
            <div>
              <div className="font-medium text-white">Use Real-Time Traffic Data</div>
              <div className="text-xs text-gray-400">
                <span className={useRealTimeData ? "text-emerald-500 font-medium" : ""}>
                  {useRealTimeData ? "Live traffic updates enabled" : "Static routing"}
                </span>
              </div>
            </div>
          </div>
          <Switch 
            checked={useRealTimeData}
            onCheckedChange={(checked) => {
              setUseRealTimeData(checked);
              if (checked) {
                toast.success("Enabled real-time traffic data");
              } else {
                toast.info("Disabled real-time traffic data");
              }
            }}
            aria-label="Toggle real-time data"
          />
        </div>
        
        <div className="flex items-center justify-between pb-3">
          <div className="flex gap-2 items-center">
            <MapIcon className="h-4 w-4 text-gray-400" />
            <div>
              <div className="font-medium text-white">Optimize For Distance</div>
              <div className="text-xs text-gray-400">Find the shortest possible route</div>
            </div>
          </div>
          <Switch 
            checked={optimizeForDistance}
            onCheckedChange={setOptimizeForDistance}
            aria-label="Toggle optimize for distance"
          />
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={() => {
              onOptimize({ 
                prioritizeFuel, 
                avoidTraffic,
                useRealTimeData,
                optimizeForDistance
              });
              
              let optimizationMessage = "Route optimized";
              
              if (useRealTimeData) {
                optimizationMessage += " with real-time traffic data";
              }
              
              if (prioritizeFuel && optimizeForDistance) {
                optimizationMessage += " for both fuel efficiency and shortest distance";
              } else if (prioritizeFuel) {
                optimizationMessage += " for maximum fuel efficiency";
              } else if (optimizeForDistance) {
                optimizationMessage += " for shortest distance";
              }
              
              toast.success(optimizationMessage);
            }} 
            className="w-full gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Apply Optimization
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizationParameters;
