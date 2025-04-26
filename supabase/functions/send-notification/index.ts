
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  email: string;
  subject: string;
  message: string;
  type: "email" | "sms" | "push";
}

interface WeeklyReportRequest {
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

interface RouteUpdateRequest {
  userId: string;
  email: string;
  routeId: string;
  routeName: string;
  updateType: "created" | "optimized" | "modified" | "completed";
  details: string;
}

interface DeliveryUpdateRequest {
  userId: string;
  email: string;
  deliveryId: string;
  locationName: string;
  status: "scheduled" | "in_progress" | "completed" | "delayed";
  details: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestPath = new URL(req.url).pathname;
    const requestBody = await req.json();
    let emailResponse;

    console.log(`Processing request for ${requestPath}`);

    if (requestPath.includes("/weekly-report")) {
      const { userId, email, reportData }: WeeklyReportRequest = requestBody;
      emailResponse = await sendWeeklyReport(email, reportData);
    } else if (requestPath.includes("/route-update")) {
      const { userId, email, routeName, updateType, details }: RouteUpdateRequest = requestBody;
      emailResponse = await sendRouteUpdate(email, routeName, updateType, details);
    } else if (requestPath.includes("/delivery-update")) {
      const { userId, email, locationName, status, details }: DeliveryUpdateRequest = requestBody;
      emailResponse = await sendDeliveryUpdate(email, locationName, status, details);
    } else {
      // Default email notification
      const { email, subject, message }: NotificationRequest = requestBody;
      emailResponse = await sendBasicNotification(email, subject, message);
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function sendBasicNotification(email: string, subject: string, message: string) {
  return await resend.emails.send({
    from: "Route Optimizer <onboarding@resend.dev>",
    to: [email],
    subject: subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a56db;">${subject}</h1>
        <p>${message}</p>
        <p style="margin-top: 24px; color: #666;">Route Optimizer Team</p>
      </div>
    `,
  });
}

async function sendWeeklyReport(email: string, reportData: WeeklyReportRequest["reportData"]) {
  return await resend.emails.send({
    from: "Route Optimizer Reports <onboarding@resend.dev>",
    to: [email],
    subject: `Weekly Report: ${reportData.weekStart} - ${reportData.weekEnd}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a56db;">Weekly Delivery Report</h1>
        <h2>${reportData.weekStart} - ${reportData.weekEnd}</h2>
        
        <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
          <div style="margin-bottom: 16px;">
            <p style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Total Deliveries</p>
            <p style="font-size: 24px; font-weight: bold; margin: 0;">${reportData.deliveries}</p>
          </div>
          
          <div style="margin-bottom: 16px;">
            <p style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Cylinders Delivered</p>
            <p style="font-size: 24px; font-weight: bold; margin: 0;">${reportData.cylinders}</p>
          </div>
          
          <div style="margin-bottom: 16px;">
            <p style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Distance Traveled</p>
            <p style="font-size: 24px; font-weight: bold; margin: 0;">${reportData.kms.toFixed(1)} km</p>
          </div>
          
          <div>
            <p style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Fuel Cost</p>
            <p style="font-size: 24px; font-weight: bold; margin: 0;">R${reportData.fuelCost.toFixed(2)}</p>
          </div>
        </div>
        
        <p>Access your dashboard for more detailed analytics and reports.</p>
        <p style="margin-top: 24px; color: #666;">Route Optimizer Team</p>
      </div>
    `,
  });
}

async function sendRouteUpdate(
  email: string, 
  routeName: string, 
  updateType: RouteUpdateRequest["updateType"], 
  details: string
) {
  let subject = "";
  let statusColor = "";
  
  switch (updateType) {
    case "created":
      subject = `New Route Created: ${routeName}`;
      statusColor = "#16a34a"; // green
      break;
    case "optimized":
      subject = `Route Optimized: ${routeName}`;
      statusColor = "#2563eb"; // blue
      break;
    case "modified":
      subject = `Route Modified: ${routeName}`;
      statusColor = "#f59e0b"; // amber
      break;
    case "completed":
      subject = `Route Completed: ${routeName}`;
      statusColor = "#8b5cf6"; // purple
      break;
  }
  
  return await resend.emails.send({
    from: "Route Updates <onboarding@resend.dev>",
    to: [email],
    subject: subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${statusColor};">${subject}</h1>
        
        <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
          <p style="font-size: 16px;">${details}</p>
        </div>
        
        <p>View your routes dashboard for more details and actions.</p>
        <p style="margin-top: 24px; color: #666;">Route Optimizer Team</p>
      </div>
    `,
  });
}

async function sendDeliveryUpdate(
  email: string, 
  locationName: string, 
  status: DeliveryUpdateRequest["status"], 
  details: string
) {
  let subject = "";
  let statusColor = "";
  let statusText = "";
  
  switch (status) {
    case "scheduled":
      subject = `Delivery Scheduled: ${locationName}`;
      statusColor = "#2563eb"; // blue
      statusText = "Scheduled";
      break;
    case "in_progress":
      subject = `Delivery In Progress: ${locationName}`;
      statusColor = "#f59e0b"; // amber
      statusText = "In Progress";
      break;
    case "completed":
      subject = `Delivery Completed: ${locationName}`;
      statusColor = "#16a34a"; // green
      statusText = "Completed";
      break;
    case "delayed":
      subject = `Delivery Delayed: ${locationName}`;
      statusColor = "#dc2626"; // red
      statusText = "Delayed";
      break;
  }
  
  return await resend.emails.send({
    from: "Delivery Updates <onboarding@resend.dev>",
    to: [email],
    subject: subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${statusColor};">${subject}</h1>
        
        <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
          <div style="display: inline-block; padding: 6px 12px; background-color: ${statusColor}; color: white; border-radius: 16px; font-weight: bold; margin-bottom: 16px;">
            ${statusText}
          </div>
          
          <p style="font-size: 16px;">${details}</p>
        </div>
        
        <p>Check your deliveries dashboard for more information.</p>
        <p style="margin-top: 24px; color: #666;">Route Optimizer Team</p>
      </div>
    `,
  });
}

serve(handler);
