
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { sendNotification } from "@/utils/notificationUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const TestNotifications = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState("Test Notification");
  const [message, setMessage] = useState("This is a test notification from the Route Optimizer app.");
  const [loading, setLoading] = useState(false);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Notifications</CardTitle>
        <CardDescription>
          Send a test notification to verify your notification settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
      <CardFooter>
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
            "Send Test Email"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TestNotifications;
