
import React from "react";
import { RefreshCw } from "lucide-react";

interface AnalysisLoadingStateProps {
  isLoading: boolean;
}

const AnalysisLoadingState: React.FC<AnalysisLoadingStateProps> = ({ isLoading }) =>
  isLoading ? (
    <div className="flex justify-center items-center py-12">
      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Analyzing route performance...</span>
    </div>
  ) : (
    <div className="flex justify-center items-center py-12">
      <p>No data available for analysis.</p>
    </div>
  );

export default AnalysisLoadingState;
