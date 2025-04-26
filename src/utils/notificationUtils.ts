
import { supabase } from '@/integrations/supabase/client';

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
 * Send a basic notification email
 */
export async function sendNotification(data: NotificationRequest) {
  try {
    console.log("Calling send-notification edge function for email notification...");
    const start = performance.now();
    
    const { data: response, error } = await supabase.functions.invoke('send-notification', {
      body: data
    });
    
    const duration = performance.now() - start;
    console.log(`Edge function call completed in ${duration.toFixed(0)}ms, response:`, response);
    
    if (error) {
      console.error("Error from edge function:", error);
      throw error;
    }
    
    return response;
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw error;
  }
}

/**
 * Send a weekly report email with delivery metrics
 */
export async function sendWeeklyReport(data: WeeklyReportRequest) {
  try {
    console.log("Sending weekly report email...");
    
    const { data: response, error } = await supabase.functions.invoke('send-notification/weekly-report', {
      body: data
    });
    
    if (error) {
      console.error("Error sending weekly report:", error);
      throw error;
    }
    
    return response;
  } catch (error) {
    console.error("Failed to send weekly report:", error);
    throw error;
  }
}

/**
 * Send a route update notification
 */
export async function sendRouteUpdate(data: RouteUpdateRequest) {
  try {
    console.log("Sending route update notification...");
    
    const { data: response, error } = await supabase.functions.invoke('send-notification/route-update', {
      body: data
    });
    
    if (error) {
      console.error("Error sending route update:", error);
      throw error;
    }
    
    return response;
  } catch (error) {
    console.error("Failed to send route update:", error);
    throw error;
  }
}

/**
 * Send a delivery status update notification
 */
export async function sendDeliveryUpdate(data: DeliveryUpdateRequest) {
  try {
    console.log("Sending delivery update notification...");
    
    const { data: response, error } = await supabase.functions.invoke('send-notification/delivery-update', {
      body: data
    });
    
    if (error) {
      console.error("Error sending delivery update:", error);
      throw error;
    }
    
    return response;
  } catch (error) {
    console.error("Failed to send delivery update:", error);
    throw error;
  }
}
