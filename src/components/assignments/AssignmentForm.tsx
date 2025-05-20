import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Employee } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { sendEmailNotification } from '@/components/employees/sendEmailNotification';
import { useIsMobile } from '@/hooks/use-mobile';

interface AssignmentFormProps {
  employees: Employee[];
  onSubmit: (data: any) => void;
}

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().min(1, { message: "Due date is required" }),
  estimatedHours: z.coerce.number().min(1, { message: "Estimated hours must be at least 1" }),
  clientName: z.string().optional(),
  caseReference: z.string().optional(),
  assignedTo: z.string().optional(),
  createdBy: z.string().optional()
});

const AssignmentForm: React.FC<AssignmentFormProps> = ({ employees, onSubmit }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      estimatedHours: 1,
      clientName: "",
      caseReference: "",
      assignedTo: "",
      createdBy: employees[0]?.id || ""
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    // Send email notification if employee is assigned
    if (data.assignedTo) {
      const assignedEmployee = employees.find(e => e.id === data.assignedTo);
      if (assignedEmployee) {
        const subject = `New Assignment: ${data.title}`;
        const body = `
Hello ${assignedEmployee.name},

You have been assigned to a new task: ${data.title}

Description: ${data.description}
Priority: ${data.priority}
Due Date: ${data.dueDate}
Estimated Hours: ${data.estimatedHours}
${data.clientName ? `Client: ${data.clientName}` : ''}
${data.caseReference ? `Case Reference: ${data.caseReference}` : ''}

Please review this assignment at your earliest convenience.

Thank you,
Legal Case Management System
        `;
        
        sendEmailNotification(assignedEmployee.email, subject, body);
      }
    }
    
    onSubmit(data);
    form.reset();
  };

  const isMobile = useIsMobile();

  return (
    <Card className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter assignment title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter assignment description" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map(employee => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} - {employee.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="createdBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Creator</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={isMobile ? "text-sm" : ""}>
                        <SelectValue placeholder="Select creator" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="caseReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Reference (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter case reference" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" className={`bg-legally-700 hover:bg-legally-800 ${isMobile ? "w-full" : ""}`}>
              Create Assignment
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default AssignmentForm;
