
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Calendar, LogOut } from 'lucide-react';
import { useOutlook } from '@/hooks/useOutlook';

interface OutlookAuthProps {
  onAuthenticated: () => void;
}

const OutlookAuth: React.FC<OutlookAuthProps> = ({ onAuthenticated }) => {
  const { isAuthenticated, isLoading, getAuthUrl, initializeFromStorage, logout } = useOutlook();

  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  useEffect(() => {
    if (isAuthenticated) {
      onAuthenticated();
    }
  }, [isAuthenticated, onAuthenticated]);

  const handleLogin = () => {
    window.location.href = getAuthUrl();
  };

  if (isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Connected to Outlook
          </CardTitle>
          <CardDescription>
            You're successfully connected to your Microsoft Outlook account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={logout} className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Connect to Outlook
        </CardTitle>
        <CardDescription>
          Access your emails and calendar events by connecting to your Microsoft Outlook account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>Read emails</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>View calendar events</span>
        </div>
        <Button 
          onClick={handleLogin} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Connecting...' : 'Connect to Outlook'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OutlookAuth;
