
import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface RouteMetricsCardProps {
  title: string;
  value: string | ReactNode;
  color: string;
  icon: ReactNode;
  subtitle?: string | ReactNode;
  onClick?: () => void;
}

const RouteMetricsCard: React.FC<RouteMetricsCardProps> = ({
  title,
  value,
  color,
  icon,
  subtitle,
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
            <div className="text-xs font-medium text-muted-foreground">{title}</div>
            <div className="text-base font-semibold">{value}</div>
          </div>
          <div className={`p-2 rounded-full ${color} bg-opacity-10 flex items-center justify-center`}>
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
