
import { toast } from 'sonner';

/**
 * Standard CORS headers for Supabase edge functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Standard error handler for Supabase operations with logging and user notification
 * @param error Error object from Supabase operation
 * @param message User-friendly error message
 */
export const handleSupabaseError = (error: any, message: string): void => {
  // Log detailed error for debugging
  console.error(`Supabase error: ${message}`, error);
  
  // Show user-friendly toast message
  toast.error(message || 'An error occurred with the database operation');
  
  // Optional: Send to error monitoring service if available
};

/**
 * Validates input data based on provided schema
 * Simple implementation - can be expanded with zod or other validation libraries
 * @param data Data to validate
 * @param requiredFields Fields that must be present and non-empty
 * @returns Validation result
 */
export const validateInput = (
  data: Record<string, any>, 
  requiredFields: string[]
): { isValid: boolean; message?: string } => {
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      return {
        isValid: false,
        message: `Missing required field: ${field}`
      };
    }
  }
  return { isValid: true };
};
