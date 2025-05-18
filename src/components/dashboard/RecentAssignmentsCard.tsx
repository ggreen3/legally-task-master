
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Assignment, Employee } from '@/types';
import { format } from 'date-fns';

interface RecentAssignmentsCardProps {
  assignments: Assignment[];
  employees: Employee[];
}

const RecentAssignmentsCard: React.FC<RecentAssignmentsCardProps> = ({ assignments, employees }) => {
  // Sort by due date (closest first)
  const sortedAssignments = [...assignments].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  ).slice(0, 5);
  
  const getEmployeeName = (id: string) => {
    const employee = employees.find(e => e.id === id);
    return employee ? employee.name : 'Unknown';
  };
  
  const getPriorityColor = (priority: Assignment['priority']) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-amber-100 text-amber-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-legally-900">Recent Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedAssignments.map(assignment => (
            <div key={assignment.id} className="p-4 border rounded-lg transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{assignment.title}</h3>
                <Badge className={getPriorityColor(assignment.priority)}>
                  {assignment.priority}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {assignment.description.length > 100 
                  ? `${assignment.description.substring(0, 100)}...` 
                  : assignment.description}
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1">
                  <span>Due: </span>
                  <span className="font-medium">{format(new Date(assignment.dueDate), 'MMM d, yyyy')}</span>
                </div>
                <div>
                  {assignment.assignedTo.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Assigned to:</span>
                      <span className="font-medium">
                        {assignment.assignedTo.map(id => getEmployeeName(id)).join(', ')}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-100">
                      Unassigned
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAssignmentsCard;
