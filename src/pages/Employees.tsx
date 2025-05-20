
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import EmployeeCard from '@/components/employees/EmployeeCard';
import EmployeeForm from '@/components/employees/EmployeeForm';
import { Employee } from '@/types';
import { Plus, Search, Trash2, Edit, Mail } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { sendEmailNotification } from '@/components/employees/sendEmailNotification';

const Employees: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>(['all']);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Fetch employees from Supabase
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setEmployees(data as Employee[]);
        
        // Extract unique departments for filter
        const uniqueDepartments = ['all', ...Array.from(new Set(data.map(e => e.department)))];
        setDepartments(uniqueDepartments);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    
    // Set up realtime subscription for live updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees'
        },
        (payload) => {
          // Refetch data when changes occur
          fetchEmployees();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
  // Filter employees based on search and department
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          employee.specialty.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          employee.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
                          
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const handleEmployeeSelect = (id: string) => {
    const employee = employees.find(e => e.id === id) || null;
    setSelectedEmployee(employee);
  };
  
  const getProgressColor = (workload: number) => {
    if (workload > 80) return 'bg-red-100';
    if (workload > 60) return 'bg-amber-100';
    return 'bg-green-100';
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeToDelete.id);

      if (error) throw error;

      toast({
        title: "Employee Deleted",
        description: `${employeeToDelete.name} has been removed from the team.`,
      });
      
      // Close the dialogs
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      
      // If we're deleting the currently viewed employee, close their detail dialog too
      if (selectedEmployee && selectedEmployee.id === employeeToDelete.id) {
        setSelectedEmployee(null);
      }
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  const handleAddEditClick = (employee?: Employee) => {
    setEditingEmployee(employee || null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const handleSendEmail = (employee: Employee) => {
    const subject = "Team Assignment Notification";
    const body = `Hello ${employee.name},\n\nYou have been assigned to a new task.\n\nPlease check your dashboard for more details.\n\nBest regards,\nThe Legal Team`;
    
    sendEmailNotification(employee.email, subject, body);
    
    toast({
      title: "Email Client Opened",
      description: `An email to ${employee.name} has been prepared in your email client.`,
    });
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-legally-900">Team Members</h1>
          <p className="text-muted-foreground">View and manage your team</p>
        </div>
        <Button onClick={() => handleAddEditClick()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Team Member
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search by name, role, specialty, or skills..." 
            className="pl-10"
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
        
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {loading ? (
        <div className="text-center p-8">
          <p className="text-muted-foreground">Loading employees data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map(employee => (
              <EmployeeCard 
                key={employee.id} 
                employee={employee} 
                onSelect={handleEmployeeSelect} 
              />
            ))}
          </div>
          
          {filteredEmployees.length === 0 && (
            <div className="text-center p-8">
              <p className="text-muted-foreground">No team members found matching your search criteria.</p>
            </div>
          )}
        </>
      )}
      
      {/* Employee Detail Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Employee Profile</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedEmployee.avatar} alt={selectedEmployee.name} />
                  <AvatarFallback className="text-xl font-medium bg-legally-200 text-legally-700">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{selectedEmployee.name}</h2>
                  <p className="text-muted-foreground">{selectedEmployee.role} • {selectedEmployee.department}</p>
                  <p className="text-sm mt-1">{selectedEmployee.email}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleAddEditClick(selectedEmployee)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => handleDeleteClick(selectedEmployee)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleSendEmail(selectedEmployee)}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.specialty.map(spec => (
                      <Badge key={spec} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.skills.map(skill => (
                      <Badge key={skill} variant="outline" className="bg-legally-50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Current Workload</h3>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Capacity</span>
                    <span className="text-sm font-medium">
                      {selectedEmployee.workload}%
                    </span>
                  </div>
                  <Progress 
                    value={selectedEmployee.workload} 
                    className={getProgressColor(selectedEmployee.workload)}
                  />
                </div>
                
                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Current Assignments</h3>
                  <p className="text-muted-foreground text-sm">
                    Historical assignment data would be displayed here.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete {employeeToDelete?.name}? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add/Edit Employee Form Dialog */}
      {isFormOpen && (
        <EmployeeForm
          open={isFormOpen}
          onClose={handleFormClose}
          employee={editingEmployee || undefined}
          onSubmitSuccess={fetchEmployees}
        />
      )}
    </div>
  );
};

export default Employees;
