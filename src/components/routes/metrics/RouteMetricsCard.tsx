
import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface RouteMetricsCardProps {
  title: string;
  value: string | ReactNode;
  bgColor?: string;
  subtitle?: string | ReactNode;
  tooltip?: string;
}

const RouteMetricsCard = ({ 
  title, 
  value, 
  bgColor = 'bg-black', 
  subtitle, 
  tooltip 
}: RouteMetricsCardProps) => {
  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow ${bgColor}`}>
      <CardContent className="p-4">
        <h3 className="text-sm flex items-center gap-2 font-medium mb-2 text-white">
          <span>{title}</span>
          {tooltip && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full">
                  <Info className="h-3 w-3" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="text-sm">{tooltip}</div>
              </HoverCardContent>
            </HoverCard>
          )}
        </h3>
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtitle && <p className="text-xs text-gray-300">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

export default RouteMetricsCard;
