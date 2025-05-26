
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OutlookAuthRequest {
  code?: string;
  action: 'auth' | 'emails' | 'calendar' | 'refresh';
  accessToken?: string;
  refreshToken?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, action, accessToken, refreshToken }: OutlookAuthRequest = await req.json();
    
    const clientId = Deno.env.get('MICROSOFT_CLIENT_ID');
    const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');
    const redirectUri = Deno.env.get('MICROSOFT_REDIRECT_URI');

    if (!clientId || !clientSecret) {
      throw new Error('Microsoft credentials not configured');
    }

    switch (action) {
      case 'auth':
        // Exchange authorization code for tokens
        const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: code || '',
            redirect_uri: redirectUri || '',
            grant_type: 'authorization_code',
            scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Calendars.Read https://graph.microsoft.com/User.Read'
          }),
        });

        const tokens = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
          throw new Error(`Token exchange failed: ${tokens.error_description || tokens.error}`);
        }

        return new Response(JSON.stringify(tokens), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'emails':
        // Fetch emails using Microsoft Graph API
        const emailsResponse = await fetch('https://graph.microsoft.com/v1.0/me/messages?$top=50&$orderby=receivedDateTime desc', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const emails = await emailsResponse.json();
        
        if (!emailsResponse.ok) {
          throw new Error(`Failed to fetch emails: ${emails.error?.message || 'Unknown error'}`);
        }

        return new Response(JSON.stringify(emails), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'calendar':
        // Fetch calendar events
        const calendarResponse = await fetch('https://graph.microsoft.com/v1.0/me/events?$top=50&$orderby=start/dateTime', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const events = await calendarResponse.json();
        
        if (!calendarResponse.ok) {
          throw new Error(`Failed to fetch calendar: ${events.error?.message || 'Unknown error'}`);
        }

        return new Response(JSON.stringify(events), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'refresh':
        // Refresh access token
        const refreshResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken || '',
            grant_type: 'refresh_token',
          }),
        });

        const newTokens = await refreshResponse.json();
        
        if (!refreshResponse.ok) {
          throw new Error(`Token refresh failed: ${newTokens.error_description || newTokens.error}`);
        }

        return new Response(JSON.stringify(newTokens), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error('Invalid action');
    }
  } catch (error: any) {
    console.error('Error in outlook-integration function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
