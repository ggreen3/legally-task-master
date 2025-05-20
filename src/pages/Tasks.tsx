import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Task } from '@/types';
import { Check } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { adaptTask, prepareTaskForDb } from '@/utils/databaseAdapters';

const Tasks: React.FC = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState<{[key: string]: {title: string, client_name?: string}}>({}); 
  const [employees, setEmployees] = useState<{[key: string]: string}>({}); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch tasks, assignments, and employees data
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*');
        
        if (tasksError) throw tasksError;
        
        // Fetch assignments for lookup
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('assignments')
          .select('id, title, client_name');
        
        if (assignmentsError) throw assignmentsError;
        
        // Fetch employees for lookup
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('id, name');
        
        if (employeesError) throw employeesError;
        
        // Create lookup objects
        const assignmentLookup = assignmentsData.reduce((acc, curr) => {
          acc[curr.id] = { title: curr.title, client_name: curr.client_name };
          return acc;
        }, {} as {[key: string]: {title: string, client_name?: string}});
        
        const employeeLookup = employeesData.reduce((acc, curr) => {
          acc[curr.id] = curr.name;
          return acc;
        }, {} as {[key: string]: string});
        
        // Use the adapter to convert database records to our application model
        const adaptedTasks = tasksData.map(adaptTask);
        
        setTasks(adaptedTasks);
        setAssignments(assignmentLookup);
        setEmployees(employeeLookup);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load tasks data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up real-time subscriptions for tasks
    const tasksSubscription = supabase
      .channel('public:tasks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' }, 
        async (payload) => {
          // Refresh tasks when there's a change
          const { data, error } = await supabase.from('tasks').select('*');
          if (!error && data) {
            // Use the adapter to convert database records to our application model
            const adaptedTasks = data.map(adaptTask);
            setTasks(adaptedTasks);
          }
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(tasksSubscription);
    };
  }, [toast]);

  const getAssignmentTitle = (assignmentId: string) => {
    return assignments[assignmentId]?.title || 'Unknown Assignment';
  };

  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return 'Unassigned';
    return employees[employeeId] || 'Unknown Employee';
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      // Prepare the update data for database
      const updateData = prepareTaskForDb({
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);
      
      if (error) throw error;
      
      toast({
        title: "Task Completed",
        description: "The task has been marked as completed.",
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getAssignmentTitle(task.assignmentId).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getEmployeeName(task.assignedTo).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group tasks by status
  const todoTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-legally-900">Task Tracker</h1>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-legally-900">Task Tracker</h1>
        <p className="text-muted-foreground">Track and manage individual tasks</p>
      </div>
      
      <div className="w-full">
        <Input 
          placeholder="Search tasks..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* To Do Column */}
        <Card>
          <CardHeader className="bg-amber-50 pb-2">
            <CardTitle className="text-amber-800">To Do</CardTitle>
            <CardDescription>{todoTasks.length} tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-3 space-y-3">
            {todoTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                assignmentTitle={getAssignmentTitle(task.assignmentId)}
                employeeName={getEmployeeName(task.assignedTo)}
                onComplete={handleCompleteTask}
              />
            ))}
            {todoTasks.length === 0 && (
              <EmptyState status="todo" />
            )}
          </CardContent>
        </Card>
        
        {/* In Progress Column */}
        <Card>
          <CardHeader className="bg-indigo-50 pb-2">
            <CardTitle className="text-indigo-800">In Progress</CardTitle>
            <CardDescription>{inProgressTasks.length} tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-3 space-y-3">
            {inProgressTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                assignmentTitle={getAssignmentTitle(task.assignmentId)}
                employeeName={getEmployeeName(task.assignedTo)}
                onComplete={handleCompleteTask}
              />
            ))}
            {inProgressTasks.length === 0 && (
              <EmptyState status="in-progress" />
            )}
          </CardContent>
        </Card>
        
        {/* Completed Column */}
        <Card>
          <CardHeader className="bg-green-50 pb-2">
            <CardTitle className="text-green-800">Completed</CardTitle>
            <CardDescription>{completedTasks.length} tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-3 space-y-3">
            {completedTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                assignmentTitle={getAssignmentTitle(task.assignmentId)}
                employeeName={getEmployeeName(task.assignedTo)}
                onComplete={handleCompleteTask}
                isCompleted
              />
            ))}
            {completedTasks.length === 0 && (
              <EmptyState status="completed" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  assignmentTitle: string;
  employeeName: string;
  onComplete: (id: string) => void;
  isCompleted?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  assignmentTitle, 
  employeeName, 
  onComplete, 
  isCompleted = false 
}) => {
  return (
    <div className={`p-3 border rounded-lg ${isCompleted ? 'bg-green-50/30' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </h3>
        {!isCompleted && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 w-7 p-0" 
            onClick={() => onComplete(task.id)}
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Complete task</span>
          </Button>
        )}
      </div>
      
      <p className={`text-xs mb-3 ${isCompleted ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
        {task.description}
      </p>
      
      <div className="flex justify-between items-center text-xs">
        <Badge variant="outline" className="bg-legally-50">
          {assignmentTitle}
        </Badge>
        
        <div>
          <span className="text-muted-foreground">Due: </span>
          <span className={isCompleted ? 'line-through' : ''}>
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        </div>
      </div>
      
      <div className="mt-2 text-right text-xs text-muted-foreground">
        {employeeName}
      </div>
      
      {isCompleted && task.completedAt && (
        <div className="mt-2 text-right text-xs text-green-600">
          Completed: {format(new Date(task.completedAt), 'MMM d, yyyy')}
        </div>
      )}
    </div>
  );
};

interface EmptyStateProps {
  status: 'todo' | 'in-progress' | 'completed';
}

const EmptyState: React.FC<EmptyStateProps> = ({ status }) => {
  const messages = {
    'todo': 'No pending tasks',
    'in-progress': 'No tasks in progress',
    'completed': 'No completed tasks yet'
  };
  
  return (
    <div className="text-center py-6">
      <p className="text-sm text-muted-foreground">{messages[status]}</p>
    </div>
  );
};

export default Tasks;
