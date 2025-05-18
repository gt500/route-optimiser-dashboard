
import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Add console log to debug the redirection
  useEffect(() => {
    console.log('Index component mounted, redirecting to root dashboard', location);
    
    // Check if we were trying to access routes but got redirected
    const wasAttemptingRoutes = sessionStorage.getItem('attempting_routes');
    
    if (wasAttemptingRoutes) {
      console.log('Detected attempted routes access, redirecting back to routes');
      sessionStorage.removeItem('attempting_routes');
      navigate('/routes', { replace: true });
      return;
    }
  }, [location, navigate]);

  // Make sure we're not in an infinite redirect loop
  if (location.pathname === '/index') {
    return <Navigate to="/" replace />;
  }

  return null;
};

export default Index;
