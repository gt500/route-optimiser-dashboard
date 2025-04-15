
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

interface OverallScoreCardProps {
  score: number;
  onPrint: () => void;
  onEmail: () => void;
}

const OverallScoreCard: React.FC<OverallScoreCardProps> = ({ 
  score, 
  onPrint, 
  onEmail 
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number): string => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreDescription = (score: number): string => {
    if (score >= 80) {
      return 'This route is performing excellently compared to others. Maintain current operations.';
    } else if (score >= 65) {
      return 'This route is performing well but has room for improvement in specific areas.';
    } else if (score >= 50) {
      return 'This route has average performance. Consider implementing the recommendations below.';
    } else {
      return 'This route is performing below average and needs significant optimization.';
    }
  };

  return (
    <Card className="border-t-4 border-primary">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex justify-between items-center">
          <span>Overall Efficiency Score</span>
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {Math.round(score)}%
          </span>
        </CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onPrint}
            className="flex items-center gap-1"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEmail}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Email
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Progress 
          value={score} 
          className="h-3"
          indicatorClassName={getProgressColor(score)}
        />
        <p className="mt-4 text-sm text-muted-foreground">
          {getScoreDescription(score)}
        </p>
      </CardContent>
    </Card>
  );
};

export default OverallScoreCard;
