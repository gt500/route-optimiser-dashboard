
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: object) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean; // New property to explicitly check authentication state
};

// Create the context with an undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener with security improvements
    const setupAuthListener = async () => {
      try {
        // First set up the auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          
          // Update authentication state
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session?.user);
          setLoading(false);
          
          // Handle specific auth events
          if (event === 'SIGNED_OUT') {
            // Redirect to login page on sign out
            navigate('/auth');
            toast({
              title: "Signed out",
              description: "You have been signed out successfully",
            });
          } else if (event === 'SIGNED_IN') {
            // Redirect to home page on sign in
            navigate('/');
          }
        });

        // Then check for an existing session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        setIsAuthenticated(!!existingSession?.user);
        setLoading(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        setLoading(false);
      }
    };

    setupAuthListener();
  }, [navigate, toast]);

  const signIn = async (email: string, password: string) => {
    try {
      // Input validation
      if (!email || !email.includes('@')) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return { error: { message: "Invalid email format" } };
      }
      
      if (!password || password.length < 6) {
        toast({
          title: "Invalid password",
          description: "Password must be at least 6 characters",
          variant: "destructive",
        });
        return { error: { message: "Password too short" } };
      }
      
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error signing in:', error);
      
      // Provide specific error messages based on error codes
      const errorMessage = error.message === 'Invalid login credentials' 
        ? "Incorrect email or password"
        : error.message || "An error occurred during login";
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData = {}) => {
    try {
      // Input validation
      if (!email || !email.includes('@')) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return { error: { message: "Invalid email format" } };
      }
      
      if (!password || password.length < 6) {
        toast({
          title: "Invalid password",
          description: "Password must be at least 6 characters",
          variant: "destructive",
        });
        return { error: { message: "Password too short" } };
      }
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: userData,
          emailRedirectTo: window.location.origin // Ensure redirect comes back to our app
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Registration successful",
        description: "Please check your email for verification",
      });
      return { error: null };
    } catch (error: any) {
      console.error('Error signing up:', error);
      
      // Handle specific error cases
      let errorMessage = error.message || "An error occurred during registration";
      if (error.message?.includes('User already registered')) {
        errorMessage = "This email is already registered. Please log in instead.";
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Auth state listener will handle the UI updates
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
