
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisPeriod } from '../types';

interface AnalysisPeriodSelectorProps {
  period: AnalysisPeriod;
  onPeriodChange: (value: AnalysisPeriod) => void;
}

const AnalysisPeriodSelector: React.FC<AnalysisPeriodSelectorProps> = ({ 
  period, 
  onPeriodChange 
}) => {
  return (
    <Tabs 
      value={period} 
      className="w-full"
      onValueChange={(value) => onPeriodChange(value as AnalysisPeriod)}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="day">Daily Analysis</TabsTrigger>
        <TabsTrigger value="week">Weekly Analysis</TabsTrigger>
        <TabsTrigger value="month">Monthly Analysis</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default AnalysisPeriodSelector;
