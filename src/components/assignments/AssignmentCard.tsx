import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Assignment, Employee } from '@/types';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DocumentManagement from '../documents/DocumentManagement';
import { FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AssignmentCardProps {
  assignment: Assignment;
  employees: Employee[];
  onEditClick: (id: string) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, employees, onEditClick }) => {
  const assignedEmployees = employees.filter(employee => 
    assignment.assignedTo.includes(employee.id)
  );
  
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const getStatusBadgeClass = (status: Assignment['status']) => {
    switch(status) {
      case 'unassigned': return 'bg-amber-100 text-amber-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-indigo-100 text-indigo-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityBadgeClass = (priority: Assignment['priority']) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-amber-100 text-amber-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get the first assigned employee ID for document uploads
  const firstEmployeeId = assignment.assignedTo[0] || '';
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-legally-900">{assignment.title}</CardTitle>
          <div className="flex gap-2">
            <Badge className={getPriorityBadgeClass(assignment.priority)}>
              {assignment.priority}
            </Badge>
            <Badge className={getStatusBadgeClass(assignment.status)}>
              {assignment.status.replace('-', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
        
        {assignment.clientName && (
          <div className="mb-2">
            <span className="text-xs text-muted-foreground">Client:</span>
            <p className="text-sm">{assignment.clientName}</p>
          </div>
        )}
        
        {assignment.caseReference && (
          <div className="mb-2">
            <span className="text-xs text-muted-foreground">Case Reference:</span>
            <p className="text-sm font-mono">{assignment.caseReference}</p>
          </div>
        )}
        
        <div className="mb-2">
          <span className="text-xs text-muted-foreground">Due Date:</span>
          <p className="text-sm">{format(new Date(assignment.dueDate), 'MMM d, yyyy')}</p>
        </div>
        
        <div className="mb-2">
          <span className="text-xs text-muted-foreground">Estimated Hours:</span>
          <p className="text-sm">{assignment.estimatedHours} hours</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 pt-0">
        {assignedEmployees.length > 0 && (
          <div className="w-full">
            <span className="text-xs text-muted-foreground">Assigned To:</span>
            <div className="flex mt-1 flex-wrap gap-2">
              {assignedEmployees.map(employee => (
                <div key={employee.id} className="flex items-center gap-2 bg-legally-50 rounded-full px-3 py-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={employee.avatar} alt={employee.name} />
                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{employee.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button 
            variant="outline" 
            className="flex-1 border-legally-700 text-legally-700 hover:bg-legally-50" 
            onClick={() => onEditClick(assignment.id)}
          >
            Manage Assignment
          </Button>
          
          <Button
            variant="outline"
            className="flex-1 border-legally-700 text-legally-700 hover:bg-legally-50"
            onClick={() => setDocumentsOpen(true)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </Button>
        </div>
      </CardFooter>
      
      {/* Document Management Dialog */}
      <Dialog open={documentsOpen} onOpenChange={setDocumentsOpen}>
        <DialogContent className={isMobile ? "w-[95%] max-w-[95%] sm:max-w-[700px]" : "sm:max-w-[700px]"}>
          <DialogHeader>
            <DialogTitle>Assignment Documents</DialogTitle>
          </DialogHeader>
          <DocumentManagement 
            assignmentId={assignment.id} 
            employeeId={firstEmployeeId}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AssignmentCard;
