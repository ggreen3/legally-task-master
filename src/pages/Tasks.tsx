
import React, { useState } from 'react';
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
import { mockTasks, mockAssignments, mockEmployees, Task } from '@/types';
import { Check } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";

const Tasks: React.FC = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([...mockTasks]);
  const [searchQuery, setSearchQuery] = useState('');

  const getAssignmentTitle = (assignmentId: string) => {
    const assignment = mockAssignments.find(a => a.id === assignmentId);
    return assignment ? assignment.title : 'Unknown Assignment';
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = mockEmployees.find(e => e.id === employeeId);
    return employee ? employee.name : 'Unassigned';
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed', completedAt: new Date().toISOString() } 
        : task
    ));
    
    toast({
      title: "Task Completed",
      description: "The task has been marked as completed.",
    });
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
