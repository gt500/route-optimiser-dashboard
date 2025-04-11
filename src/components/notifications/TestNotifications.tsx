
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { sendNotification, sendWeeklyReport, sendRouteUpdate, sendDeliveryUpdate } from "@/utils/notificationUtils";
import EmailForm from './forms/EmailForm';
import WeeklyReportForm from './forms/WeeklyReportForm';
import RouteUpdateForm from './forms/RouteUpdateForm';
import DeliveryUpdateForm from './forms/DeliveryUpdateForm';
import NotificationWarning from './NotificationWarning';

const TestNotifications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Test Email fields
  const [subject, setSubject] = useState("Test Notification");
  const [message, setMessage] = useState("This is a test notification from the Route Optimizer app.");
  
  // Weekly Report fields
  const [reportData, setReportData] = useState({
    deliveries: 35,
    cylinders: 120,
    kms: 450.5,
    fuelCost: 3200
  });
  
  // Route Update fields
  const [routeData, setRouteData] = useState({
    routeId: "route-123",
    routeName: "Monday Morning Route",
    updateType: "optimized" as const,
    details: "Route has been optimized to save 15% on fuel costs."
  });
  
  // Delivery Update fields
  const [deliveryData, setDeliveryData] = useState({
    deliveryId: "del-456",
    locationName: "ABC Warehouse",
    status: "in_progress" as const,
    details: "Driver is 10 minutes away."
  });

  const handleSendTestEmail = async () => {
    if (!user || !user.email) {
      toast.error("User email not available");
      return;
    }

    setLoading(true);
    try {
      const result = await sendNotification({
        email: user.email,
        subject,
        message,
        type: "email"
      });

      if (result) {
        toast.success("Test email sent successfully!");
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Failed to send test email");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendWeeklyReport = async () => {
    if (!user || !user.email || !user.id) {
      toast.error("User information not available");
      return;
    }
    
    setLoading(true);
    try {
      const now = new Date();
      const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "MMM d");
      const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "MMM d, yyyy");
      
      await sendWeeklyReport({
        userId: user.id,
        email: user.email,
        reportData: {
          ...reportData,
          weekStart,
          weekEnd
        }
      });
      
      toast.success("Weekly report sent successfully!");
    } catch (error) {
      console.error("Error sending weekly report:", error);
      toast.error("Failed to send weekly report");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendRouteUpdate = async () => {
    if (!user || !user.email || !user.id) {
      toast.error("User information not available");
      return;
    }
    
    setLoading(true);
    try {
      await sendRouteUpdate({
        userId: user.id,
        email: user.email,
        ...routeData
      });
      
      toast.success("Route notification sent successfully!");
    } catch (error) {
      console.error("Error sending route notification:", error);
      toast.error("Failed to send route notification");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendDeliveryUpdate = async () => {
    if (!user || !user.email || !user.id) {
      toast.error("User information not available");
      return;
    }
    
    setLoading(true);
    try {
      await sendDeliveryUpdate({
        userId: user.id,
        email: user.email,
        ...deliveryData
      });
      
      toast.success("Delivery update sent successfully!");
    } catch (error) {
      console.error("Error sending delivery update:", error);
      toast.error("Failed to send delivery update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Notifications</CardTitle>
        <CardDescription>
          Send test notifications to verify your notification settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NotificationWarning />
        
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="weeklyReport">Weekly Report</TabsTrigger>
            <TabsTrigger value="route">Route</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <EmailForm
              subject={subject}
              setSubject={setSubject}
              message={message}
              setMessage={setMessage}
              onSubmit={handleSendTestEmail}
              loading={loading}
              disabled={!user?.email}
            />
          </TabsContent>
          
          <TabsContent value="weeklyReport">
            <WeeklyReportForm
              reportData={reportData}
              setReportData={setReportData}
              onSubmit={handleSendWeeklyReport}
              loading={loading}
              disabled={!user?.email || !user?.id}
            />
          </TabsContent>
          
          <TabsContent value="route">
            <RouteUpdateForm
              routeData={routeData}
              setRouteData={setRouteData}
              onSubmit={handleSendRouteUpdate}
              loading={loading}
              disabled={!user?.email || !user?.id}
            />
          </TabsContent>
          
          <TabsContent value="delivery">
            <DeliveryUpdateForm
              deliveryData={deliveryData}
              setDeliveryData={setDeliveryData}
              onSubmit={handleSendDeliveryUpdate}
              loading={loading}
              disabled={!user?.email || !user?.id}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TestNotifications;
