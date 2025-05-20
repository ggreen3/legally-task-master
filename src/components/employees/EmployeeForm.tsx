
import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Employee } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  employee?: Employee;
  onSubmitSuccess: () => void;
}

type FormValues = {
  name: string;
  email: string;
  role: string;
  department: string;
  specialtyInput: string;
  skillsInput: string;
  avatar: string;
  workload: number;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ open, onClose, employee, onSubmitSuccess }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: employee ? {
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      specialtyInput: '',
      skillsInput: '',
      avatar: employee.avatar || '/placeholder.svg',
      workload: employee.workload
    } : {
      name: '',
      email: '',
      role: '',
      department: '',
      specialtyInput: '',
      skillsInput: '',
      avatar: '/placeholder.svg',
      workload: 0
    }
  });
  
  const { toast } = useToast();
  const [specialty, setSpecialty] = React.useState<string[]>(employee?.specialty || []);
  const [skills, setSkills] = React.useState<string[]>(employee?.skills || []);
  const specialtyInput = watch('specialtyInput');
  const skillsInput = watch('skillsInput');

  const addSpecialty = () => {
    if (specialtyInput.trim() && !specialty.includes(specialtyInput.trim())) {
      setSpecialty([...specialty, specialtyInput.trim()]);
      setValue('specialtyInput', '');
    }
  };

  const removeSpecialty = (item: string) => {
    setSpecialty(specialty.filter(s => s !== item));
  };

  const addSkill = () => {
    if (skillsInput.trim() && !skills.includes(skillsInput.trim())) {
      setSkills([...skills, skillsInput.trim()]);
      setValue('skillsInput', '');
    }
  };

  const removeSkill = (item: string) => {
    setSkills(skills.filter(s => s !== item));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const employeeData = {
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        specialty,
        skills,
        avatar: data.avatar || '/placeholder.svg',
        workload: Number(data.workload)
      };

      let response;
      
      if (employee) {
        // Update existing employee
        response = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', employee.id);
      } else {
        // Add new employee
        response = await supabase
          .from('employees')
          .insert([employeeData]);
      }

      if (response.error) {
        throw response.error;
      }

      toast({
        title: employee ? "Employee Updated" : "Employee Added",
        description: `${data.name} has been ${employee ? "updated" : "added"} successfully.`,
      });
      
      onSubmitSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving employee:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save employee data",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="Full Name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                placeholder="Email Address"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                {...register('role', { required: 'Role is required' })}
                placeholder="e.g. Partner, Associate, Paralegal"
              />
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                {...register('department', { required: 'Department is required' })}
                placeholder="e.g. Corporate Law, Litigation"
              />
              {errors.department && (
                <p className="text-sm text-destructive">{errors.department.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workload">Current Workload (%)</Label>
              <Input
                id="workload"
                type="number"
                {...register('workload', { 
                  min: { value: 0, message: 'Minimum workload is 0%' },
                  max: { value: 100, message: 'Maximum workload is 100%' }
                })}
              />
              {errors.workload && (
                <p className="text-sm text-destructive">{errors.workload.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                {...register('avatar')}
                placeholder="URL to avatar image"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Specialties</Label>
            <div className="flex gap-2">
              <Input
                {...register('specialtyInput')}
                placeholder="Add specialty and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSpecialty();
                  }
                }}
              />
              <Button type="button" onClick={addSpecialty}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {specialty.map((item) => (
                <Badge key={item} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeSpecialty(item)} 
                  />
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                {...register('skillsInput')}
                placeholder="Add skill and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button type="button" onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((item) => (
                <Badge key={item} variant="outline" className="bg-legally-50 flex items-center gap-1">
                  {item}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeSkill(item)} 
                  />
                </Badge>
              ))}
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeForm;
