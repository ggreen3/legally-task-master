export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  skills: string[];
  specialty: string[];
  workload: number;
  avatar: string | null;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unassigned' | 'assigned' | 'in-progress' | 'review' | 'completed';
  dueDate: string;
  createdBy: string | null;
  assignedTo: string[];
  partners: string[];
  estimatedHours: number;
  caseReference: string | null;
  clientName: string | null;
}

export interface Task {
  id: string;
  assignmentId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  assignedTo: string;
  dueDate: string;
  completedAt: string | null;
}

export interface Document {
  id: string;
  assignmentId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
}
