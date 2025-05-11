
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Add console log to debug the redirection
  useEffect(() => {
    console.log('Index component mounted, redirecting to dashboard');
  }, []);

  return <Navigate to="/dashboard" replace />;
};

export default Index;
