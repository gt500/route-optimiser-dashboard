
import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface RouteMetricsCardProps {
  title: string;
  value: string | ReactNode;
  icon: ReactNode;
  color?: string;
  ringColor?: string;
  subtitle?: ReactNode;
  tooltip?: string;
  onClick?: () => void;
}

const RouteMetricsCard: React.FC<RouteMetricsCardProps> = ({
  title,
  value,
  icon,
  color = "bg-primary",
  ringColor,
  subtitle,
  tooltip,
  onClick
}) => {
  // Format numeric values to ensure they're always properly displayed
  const formatValue = (val: string | ReactNode): ReactNode => {
    if (typeof val === 'number') {
      if (isNaN(val) || val === 0) {
        return '—';
      }
      // Format depending on the value size
      if (val < 0.1) {
        return val.toFixed(2);
      } else if (val < 10) {
        return val.toFixed(1);
      } else {
        return Math.round(val);
      }
    }
    return val;
  };

  const formattedValue = formatValue(value);

  return (
    <Card 
      className={`flex flex-col p-4 h-full overflow-hidden transition-all ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <h3 className="text-sm font-medium text-muted-foreground truncate">{title}</h3>
        {tooltip && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex items-center gap-3 mb-1.5">
        <div className={`${color} rounded-full p-2.5 text-white ${ringColor ? `ring-2 ${ringColor}` : ''}`}>
          {icon}
        </div>
        <div className="text-xl font-bold">{formattedValue}</div>
      </div>
      
      {subtitle && (
        <div className="mt-auto">
          {subtitle}
        </div>
      )}
    </Card>
  );
};

export default RouteMetricsCard;
