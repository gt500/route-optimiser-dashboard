import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MoonIcon, SunIcon, CheckCircle, UserCircle, BellRing, Settings2, Globe, MailCheck, Loader2, Bell, MessageSquare, Mail, Volume } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import TestNotifications from '@/components/notifications/TestNotifications';

// Profile form schema for validation
const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  company: z.string().optional(),
});

// Notification settings schema
const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  weeklyReports: z.boolean(),
  routeNotifications: z.boolean(),
  deliveryUpdates: z.boolean(),
});

// App settings schema
const appSettingsFormSchema = z.object({
  distanceUnit: z.enum(["km", "mi"]),
  language: z.enum(["en", "af", "zu", "xh"]),
  currency: z.enum(["ZAR", "USD", "EUR", "GBP"]),
  timeFormat: z.enum(["12h", "24h"]),
});

// Advanced settings schema
const advancedSettingsFormSchema = z.object({
  dataSync: z.boolean(),
  offlineMode: z.boolean(),
  developerMode: z.boolean(),
  automaticUpdates: z.boolean(),
});

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { user, session } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isSavingAppSettings, setIsSavingAppSettings] = useState(false);
  const [isSavingAdvanced, setIsSavingAdvanced] = useState(false);
  
  // Create profile form with validation
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
    },
  });

  // Create notification settings form
  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      marketingEmails: false,
      weeklyReports: true,
      routeNotifications: true,
      deliveryUpdates: true,
    },
  });

  // Create app settings form
  const appSettingsForm = useForm<z.infer<typeof appSettingsFormSchema>>({
    resolver: zodResolver(appSettingsFormSchema),
    defaultValues: {
      distanceUnit: "km",
      language: "en",
      currency: "ZAR",
      timeFormat: "24h",
    },
  });

  // Create advanced settings form
  const advancedSettingsForm = useForm<z.infer<typeof advancedSettingsFormSchema>>({
    resolver: zodResolver(advancedSettingsFormSchema),
    defaultValues: {
      dataSync: true,
      offlineMode: false,
      developerMode: false,
      automaticUpdates: true,
    },
  });

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      // Load profile data
      const userMeta = user.user_metadata || {};
      profileForm.reset({
        fullName: userMeta.full_name || "",
        email: user.email || "",
        phone: userMeta.phone || "",
        company: userMeta.company || "",
      });
      
      // Load notification preferences if they exist
      if (userMeta.notification_preferences) {
        const notifPrefs = userMeta.notification_preferences;
        notificationForm.reset({
          emailNotifications: notifPrefs.emailNotifications ?? true,
          smsNotifications: notifPrefs.smsNotifications ?? false,
          pushNotifications: notifPrefs.pushNotifications ?? true,
          marketingEmails: notifPrefs.marketingEmails ?? false,
          weeklyReports: notifPrefs.weeklyReports ?? true,
          routeNotifications: notifPrefs.routeNotifications ?? true,
          deliveryUpdates: notifPrefs.deliveryUpdates ?? true,
        });
      }
      
      // Load app settings if they exist
      if (userMeta.app_settings) {
        const appSettings = userMeta.app_settings;
        appSettingsForm.reset({
          distanceUnit: appSettings.distanceUnit || "km",
          language: appSettings.language || "en",
          currency: appSettings.currency || "ZAR",
          timeFormat: appSettings.timeFormat || "24h",
        });
      }
      
      // Load advanced settings if they exist
      if (userMeta.advanced_settings) {
        const advancedSettings = userMeta.advanced_settings;
        advancedSettingsForm.reset({
          dataSync: advancedSettings.dataSync ?? true,
          offlineMode: advancedSettings.offlineMode ?? false,
          developerMode: advancedSettings.developerMode ?? false,
          automaticUpdates: advancedSettings.automaticUpdates ?? true,
        });
      }
    }
  }, [user, profileForm, notificationForm, appSettingsForm, advancedSettingsForm]);
  
  // Handle saving profile changes
  const handleSaveProfile = async (data: z.infer<typeof profileFormSchema>) => {
    if (!user) {
      toast.error("User not logged in");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Update the user's metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        email: data.email !== user.email ? data.email : undefined, // Only update if changed
        data: {
          full_name: data.fullName,
          phone: data.phone,
          company: data.company,
        }
      });
      
      if (error) throw error;
      
      toast.success("Profile updated successfully", {
        description: "Your profile information has been updated."
      });
    } catch (error: any) {
      toast.error("Failed to update profile", { 
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle saving notification settings
  const handleSaveNotifications = async (data: z.infer<typeof notificationFormSchema>) => {
    if (!user) {
      toast.error("User not logged in");
      return;
    }
    
    setIsSavingNotifications(true);
    
    try {
      // Get current user metadata
      const currentMetadata = user.user_metadata || {};
      
      // Update the user's metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          notification_preferences: data
        }
      });
      
      if (error) throw error;
      
      toast.success("Notification preferences saved", {
        description: "Your notification preferences have been updated."
      });
    } catch (error: any) {
      toast.error("Failed to update notification preferences", { 
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setIsSavingNotifications(false);
    }
  };
  
  // Handle saving app settings
  const handleSaveAppSettings = async (data: z.infer<typeof appSettingsFormSchema>) => {
    if (!user) {
      toast.error("User not logged in");
      return;
    }
    
    setIsSavingAppSettings(true);
    
    try {
      // Get current user metadata
      const currentMetadata = user.user_metadata || {};
      
      // Update the user's metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          app_settings: data
        }
      });
      
      if (error) throw error;
      
      toast.success("App settings saved", {
        description: "Your application preferences have been updated."
      });
    } catch (error: any) {
      toast.error("Failed to update app settings", { 
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setIsSavingAppSettings(false);
    }
  };
  
  // Handle saving advanced settings
  const handleSaveAdvancedSettings = async (data: z.infer<typeof advancedSettingsFormSchema>) => {
    if (!user) {
      toast.error("User not logged in");
      return;
    }
    
    setIsSavingAdvanced(true);
    
    try {
      // Get current user metadata
      const currentMetadata = user.user_metadata || {};
      
      // Update the user's metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          advanced_settings: data
        }
      });
      
      if (error) throw error;
      
      toast.success("Advanced settings saved", {
        description: "Your advanced settings have been updated."
      });
    } catch (error: any) {
      toast.error("Failed to update advanced settings", { 
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setIsSavingAdvanced(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-11">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information.
              </CardDescription>
            </CardHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleSaveProfile)}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View information about your account status and plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Account Status</p>
                  <p className="text-xs text-muted-foreground">Your account is active and in good standing.</p>
                </div>
                <Badge className="text-xs bg-green-500">Active</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Current Plan</p>
                  <p className="text-xs text-muted-foreground">Professional plan with premium features.</p>
                </div>
                <Badge className="text-xs bg-blue-500">Pro</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Account Created</p>
                  <p className="text-xs text-muted-foreground">Account has been active for 247 days.</p>
                </div>
                <p className="text-xs text-muted-foreground">May 15, 2023</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications and updates from the system.
              </CardDescription>
            </CardHeader>
            <Form {...notificationForm}>
              <form onSubmit={notificationForm.handleSubmit(handleSaveNotifications)}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Notification Methods</h3>
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <Mail className="h-5 w-5 text-primary mt-0.5" />
                              <div className="space-y-0.5">
                                <Label htmlFor="email-notifications">Email Notifications</Label>
                                <p className="text-xs text-muted-foreground">Receive updates and alerts via email.</p>
                              </div>
                            </div>
                            <FormControl>
                              <Switch 
                                id="email-notifications" 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="smsNotifications"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                              <div className="space-y-0.5">
                                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                                <p className="text-xs text-muted-foreground">Get important alerts via SMS.</p>
                              </div>
                            </div>
                            <FormControl>
                              <Switch 
                                id="sms-notifications" 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="pushNotifications"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <Bell className="h-5 w-5 text-primary mt-0.5" />
                              <div className="space-y-0.5">
                                <Label htmlFor="push-notifications">Push Notifications</Label>
                                <p className="text-xs text-muted-foreground">Allow browser push notifications.</p>
                              </div>
                            </div>
                            <FormControl>
                              <Switch 
                                id="push-notifications" 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Communication Preferences</h3>
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="marketingEmails"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <Mail className="h-5 w-5 text-primary mt-0.5" />
                              <div className="space-y-0.5">
                                <Label htmlFor="marketing-emails">Marketing Emails</Label>
                                <p className="text-xs text-muted-foreground">Receive promotional content and offers.</p>
                              </div>
                            </div>
                            <FormControl>
                              <Switch 
                                id="marketing-emails" 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="weeklyReports"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <MailCheck className="h-5 w-5 text-primary mt-0.5" />
                              <div className="space-y-0.5">
                                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                                <p className="text-xs text-muted-foreground">Get a weekly summary of your activity.</p>
                              </div>
                            </div>
                            <FormControl>
                              <Switch 
                                id="weekly-reports" 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Route & Delivery Notifications</h3>
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="routeNotifications"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <Globe className="h-5 w-5 text-primary mt-0.5" />
                              <div className="space-y-0.5">
                                <Label htmlFor="route-notifications">Route Notifications</Label>
                                <p className="text-xs text-muted-foreground">Get notified about route changes and optimizations.</p>
                              </div>
                            </div>
                            <FormControl>
                              <Switch 
                                id="route-notifications" 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="deliveryUpdates"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <Volume className="h-5 w-5 text-primary mt-0.5" />
                              <div className="space-y-0.5">
                                <Label htmlFor="delivery-updates">Delivery Updates</Label>
                                <p className="text-xs text-muted-foreground">Receive notifications about delivery status changes.</p>
                              </div>
                            </div>
                            <FormControl>
                              <Switch 
                                id="delivery-updates" 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button 
                    className="flex items-center gap-2" 
                    type="submit" 
                    disabled={isSavingNotifications}
                    variant="default"
                  >
                    {isSavingNotifications ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <BellRing className="h-4 w-4" />
                        Save Notification Preferences
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
          
          {user && <TestNotifications />}
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Application Settings
              </CardTitle>
              <CardDescription>
                Customize your application settings and preferences.
              </CardDescription>
            </CardHeader>
            <Form {...appSettingsForm}>
              <form onSubmit={appSettingsForm.handleSubmit(handleSaveAppSettings)}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Theme Settings</h3>
                    <RadioGroup defaultValue={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
                      <div>
                        <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                        <Label
                          htmlFor="theme-light"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                        >
                          <SunIcon className="mb-2 h-6 w-6" />
                          Light
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                        <Label
                          htmlFor="theme-dark"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                        >
                          <MoonIcon className="mb-2 h-6 w-6" />
                          Dark
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                        <Label
                          htmlFor="theme-system"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                        >
                          <Settings2 className="mb-2 h-6 w-6" />
                          System
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Regional Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={appSettingsForm.control}
                        name="distanceUnit"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Distance Unit</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger id="distance-unit">
                                  <SelectValue placeholder="Select distance unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="km">Kilometers (km)</SelectItem>
                                <SelectItem value="mi">Miles (mi)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={appSettingsForm.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Language</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger id="language">
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="af">Afrikaans</SelectItem>
                                <SelectItem value="zu">Zulu</SelectItem>
                                <SelectItem value="xh">Xhosa</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={appSettingsForm.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Currency</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger id="currency">
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ZAR">South African Rand (R)</SelectItem>
                                <SelectItem value="USD">US Dollar ($)</SelectItem>
                                <SelectItem value="EUR">Euro (€)</SelectItem>
                                <SelectItem value="GBP">British Pound (£)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={appSettingsForm.control}
                        name="timeFormat"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Time Format</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger id="time-format">
                                  <SelectValue placeholder="Select time format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                                <SelectItem value="24h">24-hour</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button className="flex items-center gap-2" type="submit" disabled={isSavingAppSettings}>
                    {isSavingAppSettings ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4" />
                        Save App Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced system options and developer features.
              </CardDescription>
            </CardHeader>
            <Form {...advancedSettingsForm}>
              <form onSubmit={advancedSettingsForm.handleSubmit(handleSaveAdvancedSettings)}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={advancedSettingsForm.control}
                      name="dataSync"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="data-sync">Data Synchronization</Label>
                            <p className="text-xs text-muted-foreground">Keep data synchronized across devices automatically.</p>
                          </div>
                          <FormControl>
                            <Switch 
                              id="data-sync" 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={advancedSettingsForm.control}
                      name="offlineMode"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="offline-mode">Offline Mode</Label>
                            <p className="text-xs text-muted-foreground">Allow application to work without internet connection.</p>
                          </div>
                          <FormControl>
                            <Switch 
                              id="offline-mode" 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={advancedSettingsForm.control}
                      name="developerMode"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="developer-mode">Developer Mode</Label>
                            <p className="text-xs text-muted-foreground">Enable advanced debugging features.</p>
                          </div>
                          <FormControl>
                            <Switch 
                              id="developer-mode" 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={advancedSettingsForm.control}
                      name="automaticUpdates"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="automatic-updates">Automatic Updates</Label>
                            <p className="text-xs text-muted-foreground">Keep application up to date automatically.</p>
                          </div>
                          <FormControl>
                            <Switch 
                              id="automatic-updates" 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button className="flex items-center gap-2" type="submit" disabled={isSavingAdvanced}>
                    {isSavingAdvanced ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
          
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions for your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Delete Account</h4>
                  <p className="text-xs text-muted-foreground">
                    Once you delete your account, there is no going back. This action cannot be undone.
                  </p>
                </div>
                <Button variant="destructive" onClick={() => toast.error("You don't really want to do that!")}>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
