
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, RefreshCw } from 'lucide-react';
import OutlookAuth from '@/components/outlook/OutlookAuth';
import EmailList from '@/components/outlook/EmailList';
import CalendarView from '@/components/outlook/CalendarView';
import { useOutlook } from '@/hooks/useOutlook';

const Outlook: React.FC = () => {
  const [activeTab, setActiveTab] = useState('emails');
  const {
    isAuthenticated,
    isLoading,
    emails,
    events,
    fetchEmails,
    fetchCalendar,
    initializeFromStorage,
  } = useOutlook();

  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails();
      fetchCalendar();
    }
  }, [isAuthenticated, fetchEmails, fetchCalendar]);

  const handleRefresh = () => {
    if (activeTab === 'emails') {
      fetchEmails();
    } else {
      fetchCalendar();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-legally-900 mb-2">Outlook Integration</h1>
          <p className="text-muted-foreground">Connect your Outlook account to access emails and calendar events</p>
        </div>
        
        <OutlookAuth onAuthenticated={() => {}} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-legally-900">Outlook</h1>
          <p className="text-muted-foreground">Manage your emails and calendar events</p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Emails ({emails.length})
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar ({events.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-legally-800">Recent Emails</h2>
          </div>
          <EmailList emails={emails} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-legally-800">Upcoming Events</h2>
          </div>
          <CalendarView events={events} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Outlook;
