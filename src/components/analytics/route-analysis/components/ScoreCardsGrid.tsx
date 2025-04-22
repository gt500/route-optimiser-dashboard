
import React from "react";
import { OverallScoreCard } from "./OverallScoreCard";
import EfficiencyScoreCard from "./EfficiencyScoreCard";
import { RouteAnalysisMetrics } from "../types";

interface ScoreCardsGridProps {
  analysis: RouteAnalysisMetrics;
  onPrint: () => void;
  onEmail: () => void;
}

const ScoreCardsGrid: React.FC<ScoreCardsGridProps> = ({ analysis, onPrint, onEmail }) => (
  <div className="space-y-6">
    <OverallScoreCard
      score={analysis.overallScore}
      onPrint={onPrint}
      onEmail={onEmail}
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <EfficiencyScoreCard
        title="Distance Efficiency"
        value={analysis.distance.value}
        average={analysis.distance.average}
        best={analysis.distance.best}
        efficiency={analysis.distance.efficiency}
      />
      <EfficiencyScoreCard
        title="Time Efficiency"
        value={analysis.duration.value}
        average={analysis.duration.average}
        best={analysis.duration.best}
        efficiency={analysis.duration.efficiency}
      />
      <EfficiencyScoreCard
        title="Cost Efficiency"
        value={analysis.cost.value}
        average={analysis.cost.average}
        best={analysis.cost.best}
        efficiency={analysis.cost.efficiency}
      />
      <EfficiencyScoreCard
        title="Delivery Volume"
        value={analysis.cylinders.value}
        average={analysis.cylinders.average}
        best={analysis.cylinders.best}
        efficiency={analysis.cylinders.efficiency}
      />
    </div>
  </div>
);

export default ScoreCardsGrid;
