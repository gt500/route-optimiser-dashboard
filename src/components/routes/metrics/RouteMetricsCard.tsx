
import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Info } from 'lucide-react';

interface RouteMetricsCardProps {
  title: string;
  value: string | ReactNode;
  color: string;
  icon: ReactNode;
  subtitle?: string | ReactNode;
  tooltip?: string;
  ringColor?: string;
  onClick?: () => void;
}

const RouteMetricsCard: React.FC<RouteMetricsCardProps> = ({
  title,
  value,
  color,
  icon,
  subtitle,
  tooltip,
  ringColor,
  onClick
}) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">
              {title}
              {tooltip && (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Info className="inline-block ml-1 h-3 w-3 cursor-help text-muted-foreground/70" />
                  </HoverCardTrigger>
                  <HoverCardContent side="top" className="w-64 text-sm">
                    {tooltip}
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
            <div className="text-base font-semibold">{value}</div>
          </div>
          <div className={`p-2 rounded-full ${color} bg-opacity-10 ${ringColor ? ringColor : ''} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
        {subtitle && (
          <div className="mt-2">
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteMetricsCard;
