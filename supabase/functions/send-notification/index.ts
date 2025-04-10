
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  email: string;
  subject: string;
  message: string;
  type: "email" | "sms" | "push";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, subject, message, type }: EmailNotificationRequest = await req.json();

    // Check if user's notification preferences allow this type of notification
    // This could be enhanced to query the user's preferences from the database
    
    if (type === "email") {
      // Send email notification using Resend
      const { data, error } = await resend.emails.send({
        from: "Route Optimizer <notifications@yourdomain.com>",
        to: [email],
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0f172a;">${subject}</h1>
            <p>${message}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #64748b; font-size: 14px;">
              You received this email because you enabled email notifications in your Route Optimizer settings.
              You can change your notification preferences in your account settings.
            </p>
          </div>
        `,
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      });
    } else if (type === "sms") {
      // For SMS, we'd integrate with Twilio here
      // This is a placeholder for the SMS implementation
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "SMS notifications not yet implemented" 
        }),
        {
          headers: { "Content-Type": "application/json", ...corsHeaders },
          status: 501,
        }
      );
    } else if (type === "push") {
      // For push notifications, we'd implement the Web Push API
      // This is a placeholder for the push implementation
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Push notifications not yet implemented" 
        }),
        {
          headers: { "Content-Type": "application/json", ...corsHeaders },
          status: 501,
        }
      );
    } else {
      throw new Error("Invalid notification type");
    }
  } catch (error) {
    console.error("Error sending notification:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
});
