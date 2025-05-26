
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useOutlook } from '@/hooks/useOutlook';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const OutlookCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authenticateWithCode } = useOutlook();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Authentication error:', error);
      navigate('/outlook?error=' + error);
      return;
    }

    if (code) {
      authenticateWithCode(code).then(() => {
        navigate('/outlook');
      });
    } else {
      navigate('/outlook');
    }
  }, [searchParams, authenticateWithCode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Connecting to Outlook
          </CardTitle>
          <CardDescription>
            Please wait while we connect your Outlook account...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground">
            This should only take a few seconds.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OutlookCallback;
