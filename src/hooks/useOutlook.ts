import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface OutlookTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface Email {
  id: string;
  subject: string;
  bodyPreview: string;
  from: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  receivedDateTime: string;
  isRead: boolean;
}

interface CalendarEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
}

export const useOutlook = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokens, setTokens] = useState<OutlookTokens | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getAuthUrl = useCallback(() => {
    const clientId = '0deedfc0-6dbd-4dc2-a391-ff35f12ff4b2';
    const redirectUri = encodeURIComponent(window.location.origin + '/outlook-callback');
    const scope = encodeURIComponent('https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Calendars.Read https://graph.microsoft.com/User.Read');
    
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&response_mode=query`;
  }, []);

  const authenticateWithCode = useCallback(async (code: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('outlook-integration', {
        body: {
          action: 'auth',
          code,
        },
      });

      if (error) throw error;

      setTokens(data);
      setIsAuthenticated(true);
      localStorage.setItem('outlook_tokens', JSON.stringify(data));
      
      toast({
        title: "Success",
        description: "Successfully connected to Outlook!",
      });
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Failed to connect to Outlook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchEmails = useCallback(async () => {
    if (!tokens) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('outlook-integration', {
        body: {
          action: 'emails',
          accessToken: tokens.access_token,
        },
      });

      if (error) throw error;

      setEmails(data.value || []);
    } catch (error: any) {
      console.error('Error fetching emails:', error);
      toast({
        title: "Error",
        description: "Failed to fetch emails",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tokens, toast]);

  const fetchCalendar = useCallback(async () => {
    if (!tokens) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('outlook-integration', {
        body: {
          action: 'calendar',
          accessToken: tokens.access_token,
        },
      });

      if (error) throw error;

      setEvents(data.value || []);
    } catch (error: any) {
      console.error('Error fetching calendar:', error);
      toast({
        title: "Error",
        description: "Failed to fetch calendar events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tokens, toast]);

  const initializeFromStorage = useCallback(() => {
    const storedTokens = localStorage.getItem('outlook_tokens');
    if (storedTokens) {
      const parsedTokens = JSON.parse(storedTokens);
      setTokens(parsedTokens);
      setIsAuthenticated(true);
    }
  }, []);

  const logout = useCallback(() => {
    setTokens(null);
    setIsAuthenticated(false);
    setEmails([]);
    setEvents([]);
    localStorage.removeItem('outlook_tokens');
    
    toast({
      title: "Logged out",
      description: "Successfully disconnected from Outlook",
    });
  }, [toast]);

  return {
    isAuthenticated,
    isLoading,
    emails,
    events,
    getAuthUrl,
    authenticateWithCode,
    fetchEmails,
    fetchCalendar,
    initializeFromStorage,
    logout,
  };
};
