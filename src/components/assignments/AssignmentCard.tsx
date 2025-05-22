import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock } from 'lucide-react';
import { Assignment, Employee } from '@/types';

interface AssignmentCardProps {
  assignment: Assignment;
  employees: Employee[];
  onEditClick: (id: string) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, employees, onEditClick }) => {
  const navigate = useNavigate();
  
  const getStatusClass = () => {
    switch (assignment.status) {
      case 'unassigned': return 'bg-gray-50';
      case 'assigned': return 'bg-yellow-50';
      case 'in-progress': return 'bg-blue-50';
      case 'review': return 'bg-purple-50';
      case 'completed': return 'bg-green-50';
      default: return 'bg-gray-50';
    }
  };
  
  const getPriorityClass = () => {
    switch (assignment.priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const assignedEmployees = employees.filter(employee =>
    assignment.assignedTo.includes(employee.id)
  );
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className={`pb-2 ${getStatusClass()} transition-colors`}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate">
            {assignment.title}
          </CardTitle>
          <Badge className={getPriorityClass()}>
            {assignment.priority}
          </Badge>
        </div>
        {assignment.clientName && (
          <CardDescription className="truncate">
            {assignment.clientName}
            {assignment.caseReference && ` • ${assignment.caseReference}`}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="py-3 flex-1">
        <p className="text-sm line-clamp-3 mb-3">{assignment.description}</p>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-legally-700" />
            <span>Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}</span>
          </div>
          <div>
            <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
              <span>Assigned To</span>
            </div>
            <div className="flex -space-x-2">
              {assignedEmployees.length > 0 ? (
                assignedEmployees.slice(0, 3).map(employee => (
                  <div key={employee.id} className="relative h-6 w-6 overflow-hidden rounded-full border-2 border-white">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={employee.avatar || '/placeholder.svg'} alt={employee.name} />
                      <AvatarFallback className="bg-legally-100 text-legally-800 text-xs">
                        {employee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ))
              ) : (
                <div className="h-6 px-2 text-xs flex items-center rounded-full bg-amber-100 text-amber-800">
                  Unassigned
                </div>
              )}
              {assignedEmployees.length > 3 && (
                <div className="relative h-6 w-6 flex items-center justify-center rounded-full border-2 border-white bg-legally-100 text-xs text-legally-800">
                  +{assignedEmployees.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/assignments/${assignment.id}`)}
        >
          View Details
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onEditClick(assignment.id)}
        >
          Manage
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AssignmentCard;
