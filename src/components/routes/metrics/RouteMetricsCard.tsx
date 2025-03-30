
import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface RouteMetricsCardProps {
  title: string;
  value: string | ReactNode;
  icon?: React.ReactNode;
  color?: string;
  bgColor?: string;
  subtitle?: string | ReactNode;
  tooltip?: string;
  ringColor?: string;
}

const RouteMetricsCard = ({ 
  title, 
  value,
  icon,
  color = 'bg-gradient-to-br from-blue-500 to-blue-600',
  bgColor,
  subtitle, 
  tooltip,
  ringColor = 'ring-blue-400/30'
}: RouteMetricsCardProps) => {
  // Use bgColor if provided, otherwise use color
  const backgroundColorClass = bgColor || color;
  
  return (
    <Card className={`shadow-lg hover:shadow-xl transition-all duration-300 ${backgroundColorClass} ring-1 ${ringColor} rounded-xl overflow-hidden`}>
      <CardContent className="p-4">
        <h3 className="text-sm flex items-center gap-2 font-medium mb-2 text-white/90">
          {icon && <span className="flex items-center">{icon}</span>}
          <span>{title}</span>
          {tooltip && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full bg-white/10 hover:bg-white/20 text-white/80">
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
        {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

export default RouteMetricsCard;
