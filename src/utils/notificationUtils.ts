
import { supabase } from '@/integrations/supabase/client';
import { corsHeaders, handleSupabaseError, validateInput } from './supabaseUtils';

export interface NotificationRequest {
  email: string;
  subject: string;
  message: string;
  type: "email" | "sms" | "push";
}

export interface WeeklyReportRequest {
  userId: string;
  email: string;
  reportData: {
    deliveries: number;
    cylinders: number;
    kms: number;
    fuelCost: number;
    weekStart: string;
    weekEnd: string;
  };
}

export interface RouteUpdateRequest {
  userId: string;
  email: string;
  routeId: string;
  routeName: string;
  updateType: "created" | "optimized" | "modified" | "completed";
  details: string;
}

export interface DeliveryUpdateRequest {
  userId: string;
  email: string;
  deliveryId: string;
  locationName: string;
  status: "scheduled" | "in_progress" | "completed" | "delayed";
  details: string;
}

/**
 * Send a basic notification email with improved security
 */
export async function sendNotification(data: NotificationRequest) {
  try {
    // Validate input before sending to edge function
    const validation = validateInput(data, ['email', 'subject', 'message', 'type']);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    
    console.log("Calling send-notification edge function for email notification...");
    const start = performance.now();
    
    // Set request options with timeout
    const options = {
      body: data,
      headers: corsHeaders
    };
    
    const { data: response, error } = await supabase.functions.invoke('send-notification', options);
    
    const duration = performance.now() - start;
    console.log(`Edge function call completed in ${duration.toFixed(0)}ms, response:`, response);
    
    if (error) {
      handleSupabaseError(error, "Failed to send notification");
      throw error;
    }
    
    return response;
  } catch (error) {
    handleSupabaseError(error, "Failed to send notification");
    throw error;
  }
}

/**
 * Send a weekly report email with delivery metrics
 */
export async function sendWeeklyReport(data: WeeklyReportRequest) {
  try {
    // Validate required fields
    const validation = validateInput(data, ['userId', 'email']);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    
    // Additional validation for nested reportData
    if (!data.reportData) {
      throw new Error('Report data is required');
    }
    
    console.log("Sending weekly report email...");
    
    const { data: response, error } = await supabase.functions.invoke('send-notification/weekly-report', {
      body: data,
      headers: corsHeaders
    });
    
    if (error) {
      handleSupabaseError(error, "Error sending weekly report");
      throw error;
    }
    
    return response;
  } catch (error) {
    handleSupabaseError(error, "Failed to send weekly report");
    throw error;
  }
}

/**
 * Send a route update notification
 */
export async function sendRouteUpdate(data: RouteUpdateRequest) {
  try {
    // Validate input
    const validation = validateInput(data, ['userId', 'email', 'routeId', 'routeName', 'updateType']);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    
    console.log("Sending route update notification...");
    
    const { data: response, error } = await supabase.functions.invoke('send-notification/route-update', {
      body: data,
      headers: corsHeaders
    });
    
    if (error) {
      handleSupabaseError(error, "Error sending route update");
      throw error;
    }
    
    return response;
  } catch (error) {
    handleSupabaseError(error, "Failed to send route update");
    throw error;
  }
}

/**
 * Send a delivery status update notification
 */
export async function sendDeliveryUpdate(data: DeliveryUpdateRequest) {
  try {
    // Validate input
    const validation = validateInput(data, ['userId', 'email', 'deliveryId', 'locationName', 'status']);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    
    console.log("Sending delivery update notification...");
    
    const { data: response, error } = await supabase.functions.invoke('send-notification/delivery-update', {
      body: data,
      headers: corsHeaders
    });
    
    if (error) {
      handleSupabaseError(error, "Error sending delivery update");
      throw error;
    }
    
    return response;
  } catch (error) {
    handleSupabaseError(error, "Failed to send delivery update");
    throw error;
  }
}
