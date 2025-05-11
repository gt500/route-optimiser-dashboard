
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Add console log to debug the redirection
  useEffect(() => {
    console.log('Index component mounted, redirecting to root dashboard');
  }, []);

  return <Navigate to="/" replace />;
};

export default Index;
