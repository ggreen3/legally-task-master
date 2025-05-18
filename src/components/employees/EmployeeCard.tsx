import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Employee } from '@/types';

interface EmployeeCardProps {
  employee: Employee;
  onSelect: (id: string) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onSelect }) => {
  const getWorkloadColor = (workload: number) => {
    if (workload > 80) return 'text-red-500';
    if (workload > 60) return 'text-amber-500';
    return 'text-green-500';
  };
  
  const getProgressColor = (workload: number) => {
    if (workload > 80) return 'bg-red-100';
    if (workload > 60) return 'bg-amber-100';
    return 'bg-green-100';
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-14 w-14">
          <AvatarImage src={employee.avatar} alt={employee.name} />
          <AvatarFallback className="text-lg font-medium bg-legally-200 text-legally-700">
            {employee.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{employee.name}</h3>
          <p className="text-sm text-muted-foreground">{employee.role}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Department</p>
            <p className="text-sm font-medium">{employee.department}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">Specialty</p>
            <div className="flex flex-wrap gap-1">
              {employee.specialty.map(spec => (
                <Badge key={spec} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">Skills</p>
            <div className="flex flex-wrap gap-1">
              {employee.skills.map(skill => (
                <Badge key={skill} variant="outline" className="text-xs bg-legally-50">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-sm text-muted-foreground">Current Workload</p>
              <p className={`text-sm font-medium ${getWorkloadColor(employee.workload)}`}>
                {employee.workload}%
              </p>
            </div>
            <Progress 
              value={employee.workload} 
              className={`h-2 ${getProgressColor(employee.workload)}`}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          className="w-full border-legally-700 text-legally-700 hover:bg-legally-50" 
          onClick={() => onSelect(employee.id)}
        >
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmployeeCard;
