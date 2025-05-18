
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import AssignmentForm from '@/components/assignments/AssignmentForm';
import AssignmentCard from '@/components/assignments/AssignmentCard';
import { mockAssignments, mockEmployees, Assignment } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Assignments: React.FC = () => {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState([...mockAssignments]);
  const [showNewAssignmentForm, setShowNewAssignmentForm] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);

  const handleCreateAssignment = (formData: any) => {
    const newAssignment: Assignment = {
      id: `${assignments.length + 1}`,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: 'unassigned',
      dueDate: formData.dueDate,
      createdBy: '1', // Assuming current user ID is 1
      assignedTo: formData.assignedTo ? [formData.assignedTo] : [],
      partners: [],
      estimatedHours: formData.estimatedHours,
      clientName: formData.clientName || undefined,
      caseReference: formData.caseReference || undefined
    };
    
    setAssignments([...assignments, newAssignment]);
    setShowNewAssignmentForm(false);
    
    toast({
      title: "Assignment Created",
      description: `${formData.title} has been successfully created.`,
    });
  };

  const handleEditClick = (id: string) => {
    setEditingAssignmentId(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-legally-900">Assignments</h1>
          <p className="text-muted-foreground">Manage case assignments and workload</p>
        </div>
        <Button 
          className="bg-legally-700 hover:bg-legally-800"
          onClick={() => setShowNewAssignmentForm(true)}
        >
          Create Assignment
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map(assignment => (
          <AssignmentCard 
            key={assignment.id} 
            assignment={assignment} 
            employees={mockEmployees} 
            onEditClick={handleEditClick}
          />
        ))}
      </div>
      
      {/* New Assignment Dialog */}
      <Dialog open={showNewAssignmentForm} onOpenChange={setShowNewAssignmentForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new work assignment.
            </DialogDescription>
          </DialogHeader>
          <AssignmentForm employees={mockEmployees} onSubmit={handleCreateAssignment} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Assignment Dialog - Add edit form here when needed */}
      <Dialog open={!!editingAssignmentId} onOpenChange={() => setEditingAssignmentId(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Assignment</DialogTitle>
            <DialogDescription>
              Edit assignment details, change status, or reassign work.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 text-center">
            <p>Assignment management UI would go here.</p>
            <p className="text-muted-foreground">Editing assignment ID: {editingAssignmentId}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assignments;
