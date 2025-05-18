import React, { useState } from 'react';
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EmployeeCard from '@/components/employees/EmployeeCard';
import { mockEmployees, Employee } from '@/types';
import { Search } from 'lucide-react';

const Employees: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Get all unique departments
  const departments = ['all', ...Array.from(new Set(mockEmployees.map(e => e.department)))];
  
  // Filter employees based on search and department
  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          employee.specialty.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          employee.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
                          
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const handleEmployeeSelect = (id: string) => {
    const employee = mockEmployees.find(e => e.id === id) || null;
    setSelectedEmployee(employee);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-legally-900">Team Members</h1>
        <p className="text-muted-foreground">View and manage your team</p>
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
                <div>
                  <h2 className="text-xl font-semibold">{selectedEmployee.name}</h2>
                  <p className="text-muted-foreground">{selectedEmployee.role} • {selectedEmployee.department}</p>
                  <p className="text-sm mt-1">{selectedEmployee.email}</p>
                </div>
              </div>
              
              {/* Additional employee details would go here */}
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
                    className={
                      selectedEmployee.workload > 80 
                        ? 'bg-red-100' 
                        : selectedEmployee.workload > 60 
                        ? 'bg-amber-100' 
                        : 'bg-green-100'
                    }
                    indicatorClassName={
                      selectedEmployee.workload > 80 
                        ? 'bg-red-500' 
                        : selectedEmployee.workload > 60 
                        ? 'bg-amber-500' 
                        : 'bg-green-500'
                    }
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
    </div>
  );
};

export default Employees;
