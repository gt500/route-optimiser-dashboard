
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type NotificationType = "email" | "sms" | "push";

interface SendNotificationOptions {
  email: string;
  subject: string;
  message: string;
  type: NotificationType;
}

/**
 * Sends a notification based on the user's preferences
 */
export const sendNotification = async ({
  email,
  subject,
  message,
  type
}: SendNotificationOptions): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke("send-notification", {
      body: {
        email,
        subject,
        message,
        type
      }
    });

    if (error) {
      console.error("Error sending notification:", error);
      toast.error(`Failed to send ${type} notification`, {
        description: error.message
      });
      return false;
    }

    console.log(`${type} notification sent successfully`, data);
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    toast.error(`Failed to send ${type} notification`);
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
 * Sends notifications based on user preferences
 * Will check if the user has enabled the notification type before sending
 */
export const notifyUser = async ({
  userId,
  email,
  subject,
  message,
  types = ["email"]
}: {
  userId: string;
  email: string;
  subject: string;
  message: string;
  types?: NotificationType[];
}): Promise<void> => {
  try {
    const enabledTypes = await Promise.all(
      types.map(async (type) => {
        const enabled = await isNotificationEnabled(userId, type);
        return { type, enabled };
      })
    );
    
    // Send notifications for all enabled types
    enabledTypes
      .filter(({ enabled }) => enabled)
      .forEach(async ({ type }) => {
        await sendNotification({
          email,
          subject,
          message,
          type
        });
      });
  } catch (error) {
    console.error("Error in notifyUser:", error);
  }
};
