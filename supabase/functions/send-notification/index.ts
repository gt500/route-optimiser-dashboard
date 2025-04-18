
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  category?: "weekly_report" | "route_update" | "delivery_update" | "general";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Request received in send-notification function");
    
    // Get the API key from environment and log its presence (not the actual value)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log("RESEND_API_KEY present:", resendApiKey ? "Yes" : "No");
    
    // Check if RESEND_API_KEY is configured
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "RESEND_API_KEY is not configured in environment variables",
          help: "Please add the RESEND_API_KEY to your Supabase edge function secrets" 
        }),
        {
          headers: { "Content-Type": "application/json", ...corsHeaders },
          status: 500,
        }
      );
    }
    
    try {
      // Parse the request body
      let requestBody;
      try {
        requestBody = await req.json();
        console.log("Request body parsed successfully:", requestBody);
      } catch (parseError) {
        console.error("Error parsing request body:", parseError);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid JSON in request body" }),
          {
            headers: { "Content-Type": "application/json", ...corsHeaders },
            status: 400,
          }
        );
      }

      const { email, subject, message, type, category = "general" }: EmailNotificationRequest = requestBody;

      console.log(`Processing ${type} notification to ${email} with subject: ${subject}`);
      
      // Check if required fields are present
      if (!email || !subject || !message || !type) {
        const missingFields = [];
        if (!email) missingFields.push('email');
        if (!subject) missingFields.push('subject');
        if (!message) missingFields.push('message');
        if (!type) missingFields.push('type');
        
        const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
        console.error(errorMsg);
        
        return new Response(
          JSON.stringify({ success: false, error: errorMsg }),
          {
            headers: { "Content-Type": "application/json", ...corsHeaders },
            status: 400,
          }
        );
      }
      
      if (type === "email") {
        // Get email template based on category
        let template = "";
        
        switch (category) {
          case "weekly_report":
            template = getWeeklyReportTemplate(subject, message);
            break;
          case "route_update":
            template = getRouteUpdateTemplate(subject, message);
            break;
          case "delivery_update":
            template = getDeliveryUpdateTemplate(subject, message);
            break;
          default:
            template = getDefaultTemplate(subject, message);
        }
        
        console.log(`Sending email using template for category: ${category}`);
        
        try {
          // Extract domain from the email for better "from" field configuration
          const userEmailDomain = email.split('@')[1];
          
          // Send email notification using Resend API directly
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: "Route Optimizer <onboarding@resend.dev>", // Default Resend domain
              to: [email],
              subject: subject,
              html: template,
            }),
          });
          
          // Log the entire response for debugging
          const responseText = await response.text();
          console.log("Resend API response status:", response.status);
          console.log("Resend API response body:", responseText);
          
          // Parse the response text back to JSON
          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch (e) {
            console.error("Error parsing response JSON:", e);
            responseData = { error: "Failed to parse response" };
          }
          
          if (!response.ok) {
            console.error("Resend API error:", responseData);
            
            // Check if it's the specific error about sending to own email in test mode
            if (responseData.message && responseData.message.includes("can only send testing emails to your own email address")) {
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  error: "Resend API restriction: You can only send test emails to the email used to create your Resend account. Please verify a domain at resend.com/domains to send to other recipients.",
                  details: responseData.message
                }),
                {
                  headers: { "Content-Type": "application/json", ...corsHeaders },
                  status: 403,
                }
              );
            }
            
            throw new Error(`Failed to send email: ${responseData.message || responseData.error || 'Unknown error'}`);
          }
          
          console.log("Email sent successfully:", responseData);

          return new Response(JSON.stringify({ success: true, data: responseData }), {
            headers: { "Content-Type": "application/json", ...corsHeaders },
            status: 200,
          });
        } catch (emailError) {
          console.error("Error sending email with Resend:", emailError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: emailError instanceof Error ? emailError.message : "Unknown email sending error" 
            }),
            {
              headers: { "Content-Type": "application/json", ...corsHeaders },
              status: 500,
            }
          );
        }
      } else if (type === "sms") {
        // For SMS, we'd integrate with Twilio here
        // This is a placeholder for the SMS implementation
        console.log("SMS notification requested but not implemented yet");
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
        console.log("Push notification requested but not implemented yet");
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
    } catch (resendInitError) {
      console.error("Error in request processing:", resendInitError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to process request. Check if the API key is valid." 
        }),
        {
          headers: { "Content-Type": "application/json", ...corsHeaders },
          status: 500,
        }
      );
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
};

// Email templates for different notification categories
function getDefaultTemplate(subject: string, message: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0f172a;">${subject}</h1>
      <p style="white-space: pre-line;">${message}</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #64748b; font-size: 14px;">
        You received this email because you enabled email notifications in your Route Optimizer settings.
        You can change your notification preferences in your account settings.
      </p>
    </div>
  `;
}

function getWeeklyReportTemplate(subject: string, message: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0f172a;">${subject}</h1>
      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="color: #334155; margin-top: 0;">Weekly Performance Summary</h2>
        <p style="white-space: pre-line;">${message}</p>
      </div>
      <p style="color: #0f172a;">
        Check your <a href="#" style="color: #2563eb; text-decoration: none;">dashboard</a> for more detailed insights.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #64748b; font-size: 14px;">
        You received this email because you subscribed to weekly reports in your Route Optimizer settings.
        You can change your notification preferences in your account settings.
      </p>
    </div>
  `;
}

function getRouteUpdateTemplate(subject: string, message: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0f172a;">${subject}</h1>
      <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
        <p style="white-space: pre-line;">${message}</p>
      </div>
      <p style="color: #0f172a;">
        <a href="#" style="color: #2563eb; text-decoration: none;">View route details</a>
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #64748b; font-size: 14px;">
        You received this email because you enabled route notifications in your Route Optimizer settings.
        You can change your notification preferences in your account settings.
      </p>
    </div>
  `;
}

function getDeliveryUpdateTemplate(subject: string, message: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0f172a;">${subject}</h1>
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
        <p style="white-space: pre-line;">${message}</p>
      </div>
      <p style="color: #0f172a;">
        <a href="#" style="color: #2563eb; text-decoration: none;">View delivery details</a>
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #64748b; font-size: 14px;">
        You received this email because you enabled delivery updates in your Route Optimizer settings.
        You can change your notification preferences in your account settings.
      </p>
    </div>
  `;
}

serve(handler);
