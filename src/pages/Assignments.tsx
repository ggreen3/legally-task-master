
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import AssignmentForm from '@/components/assignments/AssignmentForm';
import AssignmentCard from '@/components/assignments/AssignmentCard';
import { Assignment, Employee } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { 
  adaptAssignment, 
  prepareAssignmentForDb, 
  prepareTaskForDb, 
  createDefaultTaskForAssignment 
} from '@/utils/databaseAdapters';
import { useIsMobile } from '@/hooks/use-mobile';
import DocumentManagement from '@/components/documents/DocumentManagement';

const Assignments: React.FC = () => {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showNewAssignmentForm, setShowNewAssignmentForm] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  // Fetch assignments and employees on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('assignments')
          .select('*');
        
        if (assignmentsError) throw assignmentsError;
        
        // Fetch employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('*');
        
        if (employeesError) throw employeesError;
        
        // Use the adapter to convert database records to our application model
        const adaptedAssignments = assignmentsData.map(adaptAssignment);
        
        setAssignments(adaptedAssignments);
        setEmployees(employeesData as Employee[]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load assignments or employees.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up real-time subscription for assignments
    const assignmentsSubscription = supabase
      .channel('public:assignments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        async (payload) => {
          // Refresh assignments when there's a change
          const { data, error } = await supabase.from('assignments').select('*');
          if (!error && data) {
            // Use the adapter to convert database records to our application model
            const adaptedAssignments = data.map(adaptAssignment);
            setAssignments(adaptedAssignments);
          }
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(assignmentsSubscription);
    };
  }, [toast]);

  const handleCreateAssignment = async (formData: any) => {
    // Prepare assignment data for database using our adapter
    const newAssignment = prepareAssignmentForDb({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: 'unassigned',
      dueDate: formData.dueDate,
      createdBy: formData.createdBy || null,
      assignedTo: formData.assignedTo ? [formData.assignedTo] : [],
      partners: [],
      estimatedHours: formData.estimatedHours,
      clientName: formData.clientName || null,
      caseReference: formData.caseReference || null
    });
    
    try {
      // Insert the new assignment
      const { data, error } = await supabase
        .from('assignments')
        .insert(newAssignment)
        .select();
      
      if (error) throw error;
      
      // Create a default task for this assignment
      if (data && data.length > 0) {
        const assignment = data[0];
        const firstAssignedPerson = assignment.assigned_to && assignment.assigned_to.length > 0 
          ? assignment.assigned_to[0] 
          : null;
        
        const defaultTask = createDefaultTaskForAssignment(
          assignment.id,
          assignment.title,
          firstAssignedPerson,
          assignment.due_date
        );
        
        const dbTask = prepareTaskForDb(defaultTask);
        
        // Insert the task
        const { error: taskError } = await supabase
          .from('tasks')
          .insert(dbTask);
          
        if (taskError) {
          console.error('Error creating default task:', taskError);
          toast({
            title: "Warning",
            description: "Assignment created, but failed to create default task.",
            variant: "destructive",
          });
        }
      }
      
      setShowNewAssignmentForm(false);
      
      toast({
        title: "Assignment Created",
        description: `${formData.title} has been successfully created and saved to the database.`,
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (id: string) => {
    setEditingAssignmentId(id);
  };

  // Find the assigned employee ID for the editing assignment
  const getFirstAssignedEmployeeId = () => {
    if (!editingAssignmentId) return '';
    
    const assignment = assignments.find(a => a.id === editingAssignmentId);
    if (!assignment) return '';
    
    return assignment.assignedTo[0] || '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-legally-900">Assignments</h1>
          <p className="text-muted-foreground">Manage case assignments and workload</p>
        </div>
        <Button 
          className="bg-legally-700 hover:bg-legally-800 w-full sm:w-auto"
          onClick={() => setShowNewAssignmentForm(true)}
        >
          Create Assignment
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map(assignment => (
            <AssignmentCard 
              key={assignment.id} 
              assignment={assignment} 
              employees={employees} 
              onEditClick={handleEditClick}
            />
          ))}
          {assignments.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">No assignments found. Create your first assignment!</p>
            </div>
          )}
        </div>
      )}
      
      {/* New Assignment Dialog */}
      <Dialog open={showNewAssignmentForm} onOpenChange={setShowNewAssignmentForm}>
        <DialogContent className={isMobile ? "w-[95%] max-w-[95%] sm:max-w-[600px]" : "sm:max-w-[600px]"}>
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new work assignment.
            </DialogDescription>
          </DialogHeader>
          <AssignmentForm employees={employees} onSubmit={handleCreateAssignment} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Assignment Dialog */}
      <Dialog open={!!editingAssignmentId} onOpenChange={() => setEditingAssignmentId(null)}>
        <DialogContent className={isMobile ? "w-[95%] max-w-[95%] sm:max-w-[700px]" : "sm:max-w-[700px]"}>
          <DialogHeader>
            <DialogTitle>Manage Assignment</DialogTitle>
            <DialogDescription>
              Edit assignment details, upload documents, or manage tasks.
            </DialogDescription>
          </DialogHeader>
          {editingAssignmentId && (
            <DocumentManagement 
              assignmentId={editingAssignmentId} 
              employeeId={getFirstAssignedEmployeeId()} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assignments;
