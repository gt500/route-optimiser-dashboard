
import { useState } from 'react';

/**
 * Hook for managing route confirmation state
 */
export const useRouteConfirmationState = () => {
  const [isLoadConfirmed, setIsLoadConfirmed] = useState(false);
  
  return {
    isLoadConfirmed,
    setIsLoadConfirmed
  };
};
