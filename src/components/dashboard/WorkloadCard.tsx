
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Employee } from '@/types';

interface WorkloadCardProps {
  employees: Employee[];
}

const WorkloadCard: React.FC<WorkloadCardProps> = ({ employees }) => {
  const getProgressColor = (workload: number) => {
    if (workload > 80) return 'bg-red-100';
    if (workload > 60) return 'bg-amber-100';
    return 'bg-green-100';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-legally-900">Team Workload</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {employees.map((employee) => (
            <div key={employee.id} className="flex flex-col space-y-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium">{employee.name}</span>
                <span className="text-sm text-muted-foreground">{employee.workload}%</span>
              </div>
              <Progress 
                value={employee.workload} 
                className={`h-2 ${getProgressColor(employee.workload)}`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkloadCard;
