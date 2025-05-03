
import React from 'react';
import RouteHistoryTab from '../RouteHistoryTab';

interface HistoryTabContentProps {
  onCreateRoute: () => void;
}

const HistoryTabContent: React.FC<HistoryTabContentProps> = ({
  onCreateRoute
}) => {
  return (
    <RouteHistoryTab onCreateRoute={onCreateRoute} />
  );
};

export default HistoryTabContent;
