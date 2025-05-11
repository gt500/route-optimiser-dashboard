
import React from 'react';

interface RouteHeaderTitleProps {
  title?: string;
}

const RouteHeaderTitle: React.FC<RouteHeaderTitleProps> = ({ title = 'Route Planning' }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">
        Create, optimize and manage delivery routes
      </p>
    </div>
  );
};

export default RouteHeaderTitle;
