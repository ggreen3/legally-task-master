
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { Clock, Users, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import DocumentManagement from '@/components/documents/DocumentManagement';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Assignment, Employee, Task } from '@/types';
import { adaptAssignment } from '@/utils/databaseAdapters';
import { useIsMobile } from '@/hooks/use-mobile';
import AssignmentTasksList from '@/components/assignments/AssignmentTasksList';

const AssignmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Fetch the assignment
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('assignments')
          .select('*')
          .eq('id', id)
          .single();
        
        if (assignmentError) throw assignmentError;
        
        // Fetch employees for reference
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('*');
        
        if (employeesError) throw employeesError;

        // Fetch tasks for this assignment
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('assignment_id', id);
        
        if (tasksError) throw tasksError;
        
        // Use the adapter to convert database records to our application model
        const adaptedAssignment = adaptAssignment(assignmentData);
        
        setAssignment(adaptedAssignment);
        setEmployees(employeesData as Employee[]);
        setTasks(tasksData as Task[]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load assignment details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, toast]);

  // Find assigned employees
  const getAssignedEmployees = () => {
    if (!assignment) return [];
    return employees.filter(emp => assignment.assignedTo.includes(emp.id));
  };

  // Find partner employees
  const getPartnerEmployees = () => {
    if (!assignment) return [];
    return employees.filter(emp => assignment.partners.includes(emp.id));
  };

  // Status badge color
  const getStatusColor = () => {
    if (!assignment) return 'bg-gray-100 text-gray-800';
    
    switch (assignment.status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Priority badge color
  const getPriorityColor = () => {
    if (!assignment) return 'bg-gray-100 text-gray-800';
    
    switch (assignment.priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Assignment Not Found</h2>
        <p className="text-muted-foreground mb-6">The assignment you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => navigate('/assignments')}>
          Back to Assignments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button and header */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0 sm:items-center">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/assignments')}
            className="flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor()}>
            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
          </Badge>
          <Badge className={getPriorityColor()}>
            {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)} Priority
          </Badge>
        </div>
      </div>
      
      {/* Assignment title and description */}
      <div>
        <h1 className="text-2xl font-semibold text-legally-900 mb-1">{assignment.title}</h1>
        {assignment.clientName && (
          <p className="text-legally-700 font-medium">
            Client: {assignment.clientName}
            {assignment.caseReference && ` • Case: ${assignment.caseReference}`}
          </p>
        )}
        <p className="text-muted-foreground mt-3">{assignment.description}</p>
      </div>
      
      {/* Assignment details grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Assignment details card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-legally-800 text-lg flex items-center gap-2">
              <Clock size={18} />
              Assignment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-legally-800">Due Date</h3>
              <p>{format(new Date(assignment.dueDate), 'PPP')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-legally-800">Estimated Hours</h3>
              <p>{assignment.estimatedHours} hours</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Assigned team card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-legally-800 text-lg flex items-center gap-2">
              <Users size={18} />
              Assigned Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-sm font-medium text-legally-800 mb-2">Assigned To:</h3>
            <ul className="space-y-1 mb-4">
              {getAssignedEmployees().map(emp => (
                <li key={emp.id} className="flex items-center gap-2">
                  <div className="bg-legally-100 rounded-full h-5 w-5 flex items-center justify-center text-xs text-legally-700">
                    {emp.name.charAt(0)}
                  </div>
                  <span>{emp.name}</span>
                </li>
              ))}
              {getAssignedEmployees().length === 0 && <li className="text-muted-foreground text-sm">Unassigned</li>}
            </ul>
            
            {getPartnerEmployees().length > 0 && (
              <>
                <h3 className="text-sm font-medium text-legally-800 mb-2">Partners:</h3>
                <ul className="space-y-1">
                  {getPartnerEmployees().map(emp => (
                    <li key={emp.id} className="flex items-center gap-2">
                      <div className="bg-legally-200 rounded-full h-5 w-5 flex items-center justify-center text-xs text-legally-700">
                        {emp.name.charAt(0)}
                      </div>
                      <span>{emp.name}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-legally-800 text-lg flex items-center gap-2">
              <CheckCircle size={18} />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-legally-800">Tasks</h3>
                <div className="mt-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion</span>
                    <span>
                      {tasks.filter(t => t.status === 'completed').length} / {tasks.length}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-legally-600" 
                      style={{ 
                        width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tasks and Documents tabs */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="tasks" className="flex-1">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>Tasks</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-1">
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span>Documents</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <AssignmentTasksList 
            assignmentId={id || ''}
            tasks={tasks}
            setTasks={setTasks}
            employees={employees}
          />
        </TabsContent>
        
        <TabsContent value="documents">
          <DocumentManagement 
            assignmentId={id || ''}
            employeeId={getAssignedEmployees().length > 0 ? getAssignedEmployees()[0].id : ''}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssignmentDetail;
