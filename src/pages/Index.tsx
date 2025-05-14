
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const Index = () => {
  const location = useLocation();
  
  // Add console log to debug the redirection
  useEffect(() => {
    console.log('Index component mounted, redirecting to root dashboard', location);
  }, [location]);

  // Make sure we're not in an infinite redirect loop
  if (location.pathname === '/index') {
    return <Navigate to="/" replace />;
  }

  return null;
};

export default Index;
