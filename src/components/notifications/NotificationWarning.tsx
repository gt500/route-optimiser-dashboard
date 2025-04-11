
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const NotificationWarning = () => {
  return (
    <Alert className="mb-6" variant="warning">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Resend API Testing Limitation</AlertTitle>
      <AlertDescription>
        During testing, Resend only allows sending emails to the account owner's email address. 
        To send to other recipients, verify a domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">resend.com/domains</a>.
      </AlertDescription>
    </Alert>
  );
};

export default NotificationWarning;
