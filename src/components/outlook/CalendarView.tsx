
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

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

interface CalendarViewProps {
  events: CalendarEvent[];
  isLoading: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, isLoading }) => {
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

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No upcoming events</h3>
          <p className="text-muted-foreground">Your calendar is clear.</p>
        </CardContent>
      </Card>
    );
  }

  const groupEventsByDate = (events: CalendarEvent[]) => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    
    events.forEach(event => {
      const date = format(new Date(event.start.dateTime), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
    
    return grouped;
  };

  const groupedEvents = groupEventsByDate(events);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([date, dayEvents]) => (
        <div key={date} className="space-y-3">
          <h3 className="text-lg font-semibold text-legally-800 border-b pb-2">
            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
          </h3>
          
          <div className="space-y-3">
            {dayEvents.map((event) => {
              const startTime = new Date(event.start.dateTime);
              const endTime = new Date(event.end.dateTime);
              const isToday = format(startTime, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              const isPast = endTime < new Date();
              
              return (
                <Card key={event.id} className={`${isPast ? 'opacity-60' : ''} hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-legally-600" />
                        <span>{event.subject || '(No Title)'}</span>
                      </CardTitle>
                      {isToday && !isPast && (
                        <Badge variant="secondary" className="bg-legally-100 text-legally-800">
                          Today
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                      </span>
                      {event.location?.displayName && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location.displayName}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarView;
