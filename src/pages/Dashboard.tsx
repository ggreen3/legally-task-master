
import React from 'react';
import WorkloadCard from '@/components/dashboard/WorkloadCard';
import AssignmentStatusCard from '@/components/dashboard/AssignmentStatusCard';
import RecentAssignmentsCard from '@/components/dashboard/RecentAssignmentsCard';
import { mockEmployees, mockAssignments } from '@/types';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-legally-900">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your team and assignments</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WorkloadCard employees={mockEmployees} />
        <AssignmentStatusCard assignments={mockAssignments} />
      </div>
      
      <RecentAssignmentsCard assignments={mockAssignments} employees={mockEmployees} />
    </div>
  );
};

export default Dashboard;
