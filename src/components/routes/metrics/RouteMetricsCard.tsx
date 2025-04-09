
import React from 'react';
import { Card } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { ReactNode } from 'react';

interface RouteMetricsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  tooltip?: string;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  subtitle?: ReactNode;
  ringColor?: string;
}

export const ReportMetricsCard: React.FC<RouteMetricsCardProps> = ({
  title,
  value,
  icon,
  color,
  tooltip,
  className,
  onClick,
  style,
  subtitle,
  ringColor
}) => {
  return (
    <Card 
      className={`${color} text-white shadow-md hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className} ${ringColor ? `ring-2 ${ringColor}` : ''}`}
      onClick={onClick}
      style={style}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white/90">{icon}</span>
          <h3 className="text-lg font-medium text-white/90">
            {title}
            {tooltip && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 rounded-full bg-white/10 hover:bg-white/20 text-white/80">
                    <Info className="h-3 w-3" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="text-sm">{tooltip}</div>
                </HoverCardContent>
              </HoverCard>
            )}
          </h3>
        </div>
        <div className="text-xl font-bold">{value}</div>
        {subtitle && <div className="text-sm mt-1 text-white/80">{subtitle}</div>}
      </div>
    </Card>
  );
};

export default ReportMetricsCard;
