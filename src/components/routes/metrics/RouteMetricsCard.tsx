
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
      className={`h-full min-h-[112px] shadow-md cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/70 border-2 border-transparent flex flex-col justify-between`}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={title}
    >
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-3">
            <div className="flex items-center text-xs font-medium text-muted-foreground mb-1">
              <span className="truncate mr-1">{title}</span>
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
            {/* Always-visible, non-truncated value */}
            <div className="text-base font-semibold break-words">{value}</div>
          </div>
          <div className={`p-2 rounded-full ${color} bg-opacity-10 ${ringColor ? ringColor : ''} flex-shrink-0 flex items-center justify-center`}>
            {icon}
          </div>
        </div>
        {subtitle && (
          <div className="mt-2 text-xs leading-tight">
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteMetricsCard;
