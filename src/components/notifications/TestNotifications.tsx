
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { sendNotification, sendWeeklyReport, sendRouteUpdate, sendDeliveryUpdate } from "@/utils/notificationUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail, FileBarChart, MapPin, Truck } from "lucide-react";
import { toast } from "sonner";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { format, startOfWeek, endOfWeek } from "date-fns";

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
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="weeklyReport">Weekly Report</TabsTrigger>
            <TabsTrigger value="route">Route</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Notification subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Notification message"
                rows={4}
              />
            </div>
            <Button 
              onClick={handleSendTestEmail} 
              disabled={loading || !user?.email}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Test Email
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="weeklyReport" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveries">Deliveries</Label>
                <Input
                  id="deliveries"
                  type="number"
                  value={reportData.deliveries}
                  onChange={(e) => setReportData({...reportData, deliveries: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cylinders">Cylinders</Label>
                <Input
                  id="cylinders"
                  type="number"
                  value={reportData.cylinders}
                  onChange={(e) => setReportData({...reportData, cylinders: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kms">Distance (km)</Label>
                <Input
                  id="kms"
                  type="number"
                  step="0.1"
                  value={reportData.kms}
                  onChange={(e) => setReportData({...reportData, kms: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelCost">Fuel Cost (R)</Label>
                <Input
                  id="fuelCost"
                  type="number"
                  step="0.01"
                  value={reportData.fuelCost}
                  onChange={(e) => setReportData({...reportData, fuelCost: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <Button 
              onClick={handleSendWeeklyReport} 
              disabled={loading || !user?.email || !user?.id}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FileBarChart className="mr-2 h-4 w-4" />
                  Send Test Weekly Report
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="route" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="routeName">Route Name</Label>
              <Input
                id="routeName"
                value={routeData.routeName}
                onChange={(e) => setRouteData({...routeData, routeName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="updateType">Update Type</Label>
              <select
                id="updateType"
                value={routeData.updateType}
                onChange={(e) => setRouteData({...routeData, updateType: e.target.value as any})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="optimized">Optimized</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="routeDetails">Details</Label>
              <Textarea
                id="routeDetails"
                value={routeData.details}
                onChange={(e) => setRouteData({...routeData, details: e.target.value})}
                rows={2}
              />
            </div>
            <Button 
              onClick={handleSendRouteUpdate} 
              disabled={loading || !user?.email || !user?.id}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Send Test Route Notification
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="delivery" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="locationName">Location Name</Label>
              <Input
                id="locationName"
                value={deliveryData.locationName}
                onChange={(e) => setDeliveryData({...deliveryData, locationName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={deliveryData.status}
                onChange={(e) => setDeliveryData({...deliveryData, status: e.target.value as any})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDetails">Details</Label>
              <Textarea
                id="deliveryDetails"
                value={deliveryData.details}
                onChange={(e) => setDeliveryData({...deliveryData, details: e.target.value})}
                rows={2}
              />
            </div>
            <Button 
              onClick={handleSendDeliveryUpdate} 
              disabled={loading || !user?.email || !user?.id}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Send Test Delivery Update
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TestNotifications;
