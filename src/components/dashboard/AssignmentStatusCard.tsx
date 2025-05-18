
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Assignment } from '@/types';

interface AssignmentStatusCardProps {
  assignments: Assignment[];
}

const AssignmentStatusCard: React.FC<AssignmentStatusCardProps> = ({ assignments }) => {
  const statusCount = {
    unassigned: assignments.filter(a => a.status === 'unassigned').length,
    assigned: assignments.filter(a => a.status === 'assigned').length,
    inProgress: assignments.filter(a => a.status === 'in-progress').length,
    review: assignments.filter(a => a.status === 'review').length,
    completed: assignments.filter(a => a.status === 'completed').length,
  };

  const total = assignments.length;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-legally-900">Assignment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex flex-col items-center p-3 bg-amber-50 rounded-md">
            <span className="text-xl font-bold text-amber-600">{statusCount.unassigned}</span>
            <span className="text-sm text-muted-foreground">Unassigned</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-blue-50 rounded-md">
            <span className="text-xl font-bold text-blue-600">{statusCount.assigned}</span>
            <span className="text-sm text-muted-foreground">Assigned</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-indigo-50 rounded-md">
            <span className="text-xl font-bold text-indigo-600">{statusCount.inProgress}</span>
            <span className="text-sm text-muted-foreground">In Progress</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-purple-50 rounded-md">
            <span className="text-xl font-bold text-purple-600">{statusCount.review}</span>
            <span className="text-sm text-muted-foreground">In Review</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-green-50 rounded-md">
            <span className="text-xl font-bold text-green-600">{statusCount.completed}</span>
            <span className="text-sm text-muted-foreground">Completed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentStatusCard;
