
// Employee Types
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  specialty: string[];
  avatar: string;
  workload: number; // 0-100%
  skills: string[];
}

// Assignment Types
export interface Assignment {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unassigned' | 'assigned' | 'in-progress' | 'review' | 'completed';
  dueDate: string;
  createdBy: string;
  assignedTo: string[];
  partners: [string, string][];
  estimatedHours: number;
  caseReference?: string;
  clientName?: string;
}

// Task Types
export interface Task {
  id: string;
  assignmentId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  assignedTo: string;
  dueDate: string;
  completedAt?: string;
}

// Mock Data Generators
export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Jane Smith',
    email: 'jane.smith@legally.com',
    role: 'Partner',
    department: 'Corporate Law',
    specialty: ['Mergers', 'Acquisitions'],
    avatar: '/placeholder.svg',
    workload: 75,
    skills: ['Contract Review', 'Due Diligence', 'Negotiation']
  },
  {
    id: '2',
    name: 'John Davis',
    email: 'john.davis@legally.com',
    role: 'Associate',
    department: 'Corporate Law',
    specialty: ['Contracts', 'Compliance'],
    avatar: '/placeholder.svg',
    workload: 50,
    skills: ['Legal Research', 'Contract Drafting']
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@legally.com',
    role: 'Paralegal',
    department: 'Corporate Law',
    specialty: ['Document Preparation'],
    avatar: '/placeholder.svg',
    workload: 30,
    skills: ['Document Filing', 'Client Communication']
  },
  {
    id: '4',
    name: 'Michael Brown',
    email: 'michael.brown@legally.com',
    role: 'Associate',
    department: 'Litigation',
    specialty: ['Civil Litigation', 'Arbitration'],
    avatar: '/placeholder.svg',
    workload: 85,
    skills: ['Legal Writing', 'Court Appearances', 'Deposition Prep']
  },
  {
    id: '5',
    name: 'Emily Chen',
    email: 'emily.chen@legally.com',
    role: 'Partner',
    department: 'Intellectual Property',
    specialty: ['Patents', 'Trademarks'],
    avatar: '/placeholder.svg',
    workload: 60,
    skills: ['Patent Application', 'IP Strategy', 'Licensing']
  }
];

export const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Merger Documentation Review',
    description: 'Review and analyze merger documents for ABC Corp acquisition',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2025-06-15',
    createdBy: '1',
    assignedTo: ['2', '3'],
    partners: [['2', '3']],
    estimatedHours: 40,
    caseReference: 'ABC-2025-001',
    clientName: 'ABC Corporation'
  },
  {
    id: '2',
    title: 'Patent Infringement Case Research',
    description: 'Research prior cases for XYZ Tech patent infringement defense',
    priority: 'medium',
    status: 'assigned',
    dueDate: '2025-06-30',
    createdBy: '5',
    assignedTo: ['4'],
    partners: [],
    estimatedHours: 25,
    caseReference: 'XYZ-2025-042',
    clientName: 'XYZ Technologies'
  },
  {
    id: '3',
    title: 'Corporate Compliance Review',
    description: 'Annual compliance review for Global Enterprises',
    priority: 'low',
    status: 'unassigned',
    dueDate: '2025-07-15',
    createdBy: '1',
    assignedTo: [],
    partners: [],
    estimatedHours: 15,
    caseReference: 'GE-2025-013',
    clientName: 'Global Enterprises'
  },
  {
    id: '4',
    title: 'Contract Negotiation Support',
    description: 'Support contract negotiations between Delta Inc. and Echo Ltd.',
    priority: 'urgent',
    status: 'review',
    dueDate: '2025-05-25',
    createdBy: '1',
    assignedTo: ['2', '5'],
    partners: [['2', '5']],
    estimatedHours: 30,
    caseReference: 'DE-2025-007',
    clientName: 'Delta Inc.'
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    assignmentId: '1',
    title: 'Review financial statements',
    description: 'Analyze Q1-Q4 financial statements for compliance issues',
    status: 'in-progress',
    assignedTo: '2',
    dueDate: '2025-06-10'
  },
  {
    id: '2',
    assignmentId: '1',
    title: 'Draft merger summary',
    description: 'Create executive summary of merger terms',
    status: 'todo',
    assignedTo: '3',
    dueDate: '2025-06-12'
  },
  {
    id: '3',
    assignmentId: '2',
    title: 'Research similar patent cases',
    description: 'Find precedent cases in tech industry',
    status: 'in-progress',
    assignedTo: '4',
    dueDate: '2025-06-20'
  },
  {
    id: '4',
    assignmentId: '4',
    title: 'Draft initial contract terms',
    description: 'Prepare first draft of contract terms',
    status: 'completed',
    assignedTo: '2',
    dueDate: '2025-05-20',
    completedAt: '2025-05-19'
  }
];
