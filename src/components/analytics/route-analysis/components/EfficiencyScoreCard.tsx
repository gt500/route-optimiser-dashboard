
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export interface EfficiencyScore {
  score: number;
  label: string;
  recommendation: string;
}

interface EfficiencyScoreCardProps {
  title: string;
  value: number;
  average: number;
  best: number;
  efficiency: EfficiencyScore;
}

const EfficiencyScoreCard: React.FC<EfficiencyScoreCardProps> = ({
  title,
  value,
  average,
  best,
  efficiency
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 75) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 50) return <Info className="h-5 w-5 text-amber-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  const formatValue = (value: number, title: string) => {
    if (title.includes('Cost')) return `R${value.toFixed(2)}`;
    if (title.includes('Time')) return `${Math.round(value)} min`;
    if (title.includes('Distance')) return `${value.toFixed(1)} km`;
    if (title.includes('Volume') || title.includes('Delivery')) return `${Math.round(value)} cylinders`;
    return value.toFixed(1);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{title}</span>
          <span className={getScoreColor(efficiency.score)}>
            {Math.round(efficiency.score)}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Route Average:</span>
          <span className="font-medium">{formatValue(value, title)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Fleet Average:</span>
          <span className="font-medium">{formatValue(average, title)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Best Performance:</span>
          <span className="font-medium">{formatValue(best, title)}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex gap-2 items-start">
          {getScoreIcon(efficiency.score)}
          <p className="text-sm">{efficiency.recommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EfficiencyScoreCard;
