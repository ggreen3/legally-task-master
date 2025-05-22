
import React, { useState } from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { format } from 'date-fns';
import { Check, Plus } from 'lucide-react';
import { Task, Employee } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { adaptTask, prepareTaskForDb } from '@/utils/databaseAdapters';

interface AssignmentTasksListProps {
  assignmentId: string;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  employees: Employee[];
}

const AssignmentTasksList: React.FC<AssignmentTasksListProps> = ({ 
  assignmentId, 
  tasks, 
  setTasks, 
  employees 
}) => {
  const { toast } = useToast();
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: ''
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'todo': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmployeeName = (id: string) => {
    const employee = employees.find(e => e.id === id);
    return employee ? employee.name : 'Unassigned';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTaskForm({
      ...taskForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (value: string, field: string) => {
    setTaskForm({
      ...taskForm,
      [field]: value
    });
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const updateData = prepareTaskForDb({
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update local state
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed', completedAt: new Date().toISOString() } 
          : task
      ));
      
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

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskForm.title || !taskForm.dueDate) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newTask = prepareTaskForDb({
        assignmentId,
        title: taskForm.title,
        description: taskForm.description,
        status: 'todo',
        assignedTo: taskForm.assignedTo || null,
        dueDate: taskForm.dueDate,
        completedAt: null
      });
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Add the new task to our local state
        const adaptedTask = adaptTask(data[0]);
        setTasks(prevTasks => [...prevTasks, adaptedTask]);
        
        // Reset form and close dialog
        setTaskForm({
          title: '',
          description: '',
          assignedTo: '',
          dueDate: ''
        });
        setNewTaskOpen(false);
        
        toast({
          title: "Task Created",
          description: "New task has been added successfully.",
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Assignment Tasks</h3>
        <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-legally-700 hover:bg-legally-800 gap-1">
              <Plus size={16} />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task for this assignment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitTask} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title*</label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="Task title"
                  value={taskForm.title}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Task details"
                  value={taskForm.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="assignedTo" className="text-sm font-medium">Assigned To</label>
                <Select 
                  value={taskForm.assignedTo}
                  onValueChange={(value) => handleSelectChange(value, 'assignedTo')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="dueDate" className="text-sm font-medium">Due Date*</label>
                <Input 
                  id="dueDate" 
                  name="dueDate" 
                  type="date"
                  value={taskForm.dueDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No tasks have been created for this assignment yet.</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="overflow-hidden">
              <CardHeader className={`py-3 px-4 ${
                task.status === 'completed' ? 'bg-green-50' : 
                task.status === 'in-progress' ? 'bg-blue-50' : 
                task.status === 'review' ? 'bg-purple-50' : 'bg-amber-50'
              }`}>
                <div className="flex justify-between items-start">
                  <CardTitle className={`text-base ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </CardTitle>
                  {task.status !== 'completed' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleTaskComplete(task.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">Complete task</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-3 space-y-3">
                {task.description && (
                  <p className={`text-sm ${task.status === 'completed' ? 'text-muted-foreground' : ''}`}>
                    {task.description}
                  </p>
                )}
                
                <div className="flex flex-wrap justify-between">
                  <Badge className={getStatusBadgeClass(task.status)}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </Badge>
                  
                  <div className="text-xs text-muted-foreground">
                    Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div>
                    Assigned to: <span className="font-medium">{getEmployeeName(task.assignedTo)}</span>
                  </div>
                  
                  {task.completedAt && (
                    <div className="text-xs text-green-600">
                      Completed: {format(new Date(task.completedAt), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignmentTasksList;
