
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const NotificationWarning = () => {
  return (
    <Alert className="mb-6" variant="warning">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Resend API Requirements</AlertTitle>
      <AlertDescription>
        <p>To use email notifications, you need to:</p>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Create a Resend account at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">resend.com</a></li>
          <li>Verify your domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">resend.com/domains</a></li>
          <li>Create an API key at <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">resend.com/api-keys</a></li>
          <li>Set the <code className="bg-gray-100 px-1 py-0.5 rounded">RESEND_API_KEY</code> in your Supabase environment variables</li>
        </ol>
        <p className="mt-2 text-sm">During testing, Resend only allows sending emails to verified domains.</p>
      </AlertDescription>
    </Alert>
  );
};

export default NotificationWarning;
