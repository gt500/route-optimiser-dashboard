
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type NotificationType = "email" | "sms" | "push";
type NotificationCategory = "weekly_report" | "route_update" | "delivery_update" | "general";

interface SendNotificationOptions {
  email: string;
  subject: string;
  message: string;
  type: NotificationType;
  category?: NotificationCategory;
}

/**
 * Sends a notification based on the user's preferences
 */
export const sendNotification = async ({
  email,
  subject,
  message,
  type,
  category = "general"
}: SendNotificationOptions): Promise<boolean> => {
  try {
    const startTime = Date.now();
    console.log(`Calling send-notification edge function for ${type} notification...`);
    
    // Validate inputs
    if (!email || !subject || !message) {
      const missingFields = [];
      if (!email) missingFields.push('email');
      if (!subject) missingFields.push('subject');
      if (!message) missingFields.push('message');
      
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      console.error(errorMsg);
      toast.error(`Failed to send ${type} notification`, {
        description: errorMsg
      });
      return false;
    }
    
    const { data, error } = await supabase.functions.invoke("send-notification", {
      body: {
        email,
        subject,
        message,
        type,
        category
      }
    });

    const endTime = Date.now();
    console.log(`Edge function call completed in ${endTime - startTime}ms`);
    
    if (error) {
      console.error("Error from edge function:", error);
      toast.error(`Failed to send ${type} notification`, {
        description: error.message || "An unexpected error occurred"
      });
      return false;
    }
    
    if (data && !data.success) {
      console.error("Error response from edge function:", data);
      toast.error(`Failed to send ${type} notification`, {
        description: data.error || "The server returned an error"
      });
      return false;
    }

    console.log(`${type} notification sent successfully:`, data);
    toast.success(`${type.toUpperCase()} notification sent successfully`);
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    toast.error(`Failed to send ${type} notification`, {
      description: error instanceof Error ? error.message : "An unexpected error occurred"
    });
    return false;
  }
};

/**
 * Checks if the user has enabled a specific notification type
 */
export const isNotificationEnabled = async (
  userId: string, 
  type: NotificationType
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const preferences = user.user_metadata?.notification_preferences;
    
    if (!preferences) return false;
    
    // Check based on notification type
    switch (type) {
      case "email":
        return preferences.emailNotifications || false;
      case "sms":
        return preferences.smsNotifications || false;
      case "push":
        return preferences.pushNotifications || false;
      default:
        return false;
    }
  } catch (error) {
    console.error("Error checking notification preferences:", error);
    return false;
  }
};

/**
 * Checks if a specific notification category is enabled
 */
export const isCategoryEnabled = async (
  userId: string,
  category: NotificationCategory
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const preferences = user.user_metadata?.notification_preferences;
    
    if (!preferences) return false;
    
    // Check based on notification category
    switch (category) {
      case "weekly_report":
        return preferences.weeklyReports || false;
      case "route_update":
        return preferences.routeNotifications || false;
      case "delivery_update":
        return preferences.deliveryUpdates || false;
      case "general":
        return true; // General notifications are always enabled
      default:
        return false;
    }
  } catch (error) {
    console.error("Error checking category preferences:", error);
    return false;
  }
};

/**
 * Sends notifications based on user preferences
 * Will check if the user has enabled the notification type and category before sending
 */
export const notifyUser = async ({
  userId,
  email,
  subject,
  message,
  types = ["email"],
  category = "general"
}: {
  userId: string;
  email: string;
  subject: string;
  message: string;
  types?: NotificationType[];
  category?: NotificationCategory;
}): Promise<void> => {
  try {
    // First check if the category is enabled
    const isCategoryEnabledResult = await isCategoryEnabled(userId, category);
    
    if (!isCategoryEnabledResult) {
      console.log(`Category ${category} is disabled for user ${userId}`);
      return;
    }
    
    const enabledTypes = await Promise.all(
      types.map(async (type) => {
        const enabled = await isNotificationEnabled(userId, type);
        return { type, enabled };
      })
    );
    
    // Send notifications for all enabled types
    for (const { type, enabled } of enabledTypes.filter(({ enabled }) => enabled)) {
      console.log(`Sending ${type} notification for category ${category} to user ${userId}`);
      try {
        await sendNotification({
          email,
          subject,
          message,
          type,
          category
        });
      } catch (error) {
        console.error(`Error sending ${type} notification:`, error);
      }
    }
  } catch (error) {
    console.error("Error in notifyUser:", error);
  }
};

/**
 * Sends a weekly report notification
 */
export const sendWeeklyReport = async ({
  userId,
  email,
  reportData
}: {
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
}): Promise<void> => {
  const { deliveries, cylinders, kms, fuelCost, weekStart, weekEnd } = reportData;
  
  const subject = `Weekly Report: ${weekStart} - ${weekEnd}`;
  const message = `
    Here's your weekly summary:
    
    Period: ${weekStart} - ${weekEnd}
    Total Deliveries: ${deliveries}
    Total Cylinders: ${cylinders}
    Total Distance: ${kms.toFixed(1)} km
    Total Fuel Cost: R${fuelCost.toFixed(2)}
    
    View detailed reports in your dashboard.
  `;
  
  await notifyUser({
    userId,
    email,
    subject,
    message,
    types: ["email"], // Weekly reports are typically sent via email
    category: "weekly_report"
  });
};

/**
 * Sends a route update notification
 */
export const sendRouteUpdate = async ({
  userId,
  email,
  routeId,
  routeName,
  updateType,
  details
}: {
  userId: string;
  email: string;
  routeId: string;
  routeName: string;
  updateType: "created" | "updated" | "completed" | "cancelled" | "optimized";
  details?: string;
}): Promise<void> => {
  const updateTypeMap = {
    created: "created",
    updated: "updated",
    completed: "completed",
    cancelled: "cancelled",
    optimized: "optimized"
  };
  
  const subject = `Route ${updateTypeMap[updateType]}: ${routeName}`;
  const message = `
    Your route "${routeName}" has been ${updateTypeMap[updateType]}.
    ${details ? `\nDetails: ${details}` : ""}
    
    View route details in your dashboard.
  `;
  
  await notifyUser({
    userId,
    email,
    subject,
    message,
    types: ["email", "push"],
    category: "route_update"
  });
};

/**
 * Sends a delivery update notification
 */
export const sendDeliveryUpdate = async ({
  userId,
  email,
  deliveryId,
  locationName,
  status,
  details
}: {
  userId: string;
  email: string;
  deliveryId: string;
  locationName: string;
  status: "scheduled" | "in_progress" | "completed" | "failed";
  details?: string;
}): Promise<void> => {
  const statusMap = {
    scheduled: "scheduled",
    in_progress: "in progress",
    completed: "completed",
    failed: "failed"
  };
  
  const subject = `Delivery Update: ${locationName}`;
  const message = `
    Your delivery to "${locationName}" is now ${statusMap[status]}.
    ${details ? `\nDetails: ${details}` : ""}
    
    View delivery details in your dashboard.
  `;
  
  await notifyUser({
    userId,
    email,
    subject,
    message,
    types: ["email", "sms", "push"],
    category: "delivery_update"
  });
};
