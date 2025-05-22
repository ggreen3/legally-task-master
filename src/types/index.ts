
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

// Mock data for employees
export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Jane Smith',
    email: 'jane.smith@legalfirm.com',
    role: 'Senior Associate',
    department: 'Corporate Law',
    skills: ['Contract Law', 'Due Diligence', 'Mergers & Acquisitions'],
    specialty: ['Corporate Restructuring'],
    workload: 75,
    avatar: null
  },
  {
    id: '2',
    name: 'Michael Johnson',
    email: 'michael.johnson@legalfirm.com',
    role: 'Junior Associate',
    department: 'Litigation',
    skills: ['Legal Research', 'Document Review', 'Client Communication'],
    specialty: ['Civil Litigation'],
    workload: 60,
    avatar: null
  },
  {
    id: '3',
    name: 'Sarah Williams',
    email: 'sarah.williams@legalfirm.com',
    role: 'Partner',
    department: 'Intellectual Property',
    skills: ['Patent Law', 'Trademark Registration', 'IP Litigation'],
    specialty: ['Software Patents'],
    workload: 85,
    avatar: null
  },
  {
    id: '4',
    name: 'David Brown',
    email: 'david.brown@legalfirm.com',
    role: 'Paralegal',
    department: 'Real Estate',
    skills: ['Document Preparation', 'Title Search', 'Client Communication'],
    specialty: ['Commercial Real Estate'],
    workload: 45,
    avatar: null
  }
];

// Mock data for assignments
export const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Johnson & Co. Merger Review',
    description: 'Review and analyze merger documents for Johnson & Co. acquisition of TechStart Inc.',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2025-06-15T00:00:00Z',
    createdBy: '3',
    assignedTo: ['1', '2'],
    partners: ['3'],
    estimatedHours: 45,
    caseReference: 'JC-2025-001',
    clientName: 'Johnson & Co.'
  },
  {
    id: '2',
    title: 'Patent Application - SmartDevice',
    description: 'Prepare and file patent application for SmartDevice IoT technology.',
    priority: 'medium',
    status: 'assigned',
    dueDate: '2025-07-10T00:00:00Z',
    createdBy: '3',
    assignedTo: ['3'],
    partners: [],
    estimatedHours: 20,
    caseReference: 'SD-2025-042',
    clientName: 'SmartTech Labs'
  },
  {
    id: '3',
    title: 'Real Estate Closing - 123 Main St',
    description: 'Handle closing documentation for commercial property at 123 Main St.',
    priority: 'low',
    status: 'unassigned',
    dueDate: '2025-06-30T00:00:00Z',
    createdBy: null,
    assignedTo: [],
    partners: [],
    estimatedHours: 15,
    caseReference: 'RE-2025-123',
    clientName: 'MainStreet Properties'
  },
  {
    id: '4',
    title: 'Employee Handbook Review',
    description: 'Review and update employee handbook for legal compliance with new regulations.',
    priority: 'urgent',
    status: 'review',
    dueDate: '2025-05-25T00:00:00Z',
    createdBy: '3',
    assignedTo: ['1', '4'],
    partners: ['3'],
    estimatedHours: 10,
    caseReference: 'HR-2025-005',
    clientName: 'Internal'
  },
  {
    id: '5',
    title: 'Contract Dispute - Wilson Case',
    description: 'Represent client in contract dispute with former business partner.',
    priority: 'high',
    status: 'completed',
    dueDate: '2025-05-10T00:00:00Z',
    createdBy: '3',
    assignedTo: ['2'],
    partners: ['3'],
    estimatedHours: 30,
    caseReference: 'LD-2025-018',
    clientName: 'Wilson Enterprises'
  }
];
