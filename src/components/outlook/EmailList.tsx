
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, MailOpen } from 'lucide-react';
import { format } from 'date-fns';

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

interface EmailListProps {
  emails: Email[];
  isLoading: boolean;
}

const EmailList: React.FC<EmailListProps> = ({ emails, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No emails found</h3>
          <p className="text-muted-foreground">Your inbox appears to be empty.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {emails.map((email) => (
        <Card key={email.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base flex items-center gap-2">
                  {email.isRead ? (
                    <MailOpen className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Mail className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="truncate">{email.subject || '(No Subject)'}</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span>{email.from.emailAddress.name || email.from.emailAddress.address}</span>
                  <span>•</span>
                  <span>{format(new Date(email.receivedDateTime), 'MMM d, h:mm a')}</span>
                </CardDescription>
              </div>
              {!email.isRead && (
                <Badge variant="secondary" className="ml-2">
                  New
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {email.bodyPreview}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmailList;
