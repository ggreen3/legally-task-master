import { Assignment, Employee, Task, Document } from '@/types';

/**
 * Adapter function to convert Supabase assignments data to our application Assignment type
 */
export const adaptAssignment = (dbAssignment: any): Assignment => {
  return {
    id: dbAssignment.id,
    title: dbAssignment.title,
    description: dbAssignment.description,
    priority: dbAssignment.priority as Assignment['priority'],
    status: dbAssignment.status as Assignment['status'],
    dueDate: dbAssignment.due_date,
    createdBy: dbAssignment.created_by,
    assignedTo: dbAssignment.assigned_to || [],
    partners: dbAssignment.partners || [],
    estimatedHours: dbAssignment.estimated_hours,
    caseReference: dbAssignment.case_reference,
    clientName: dbAssignment.client_name
  };
};

/**
 * Adapter function to convert Supabase tasks data to our application Task type
 */
export const adaptTask = (dbTask: any): Task => {
  return {
    id: dbTask.id,
    assignmentId: dbTask.assignment_id,
    title: dbTask.title,
    description: dbTask.description,
    status: dbTask.status as Task['status'],
    assignedTo: dbTask.assigned_to || '',
    dueDate: dbTask.due_date,
    completedAt: dbTask.completed_at
  };
};

/**
 * Adapter function to convert Supabase documents data to our application Document type
 */
export const adaptDocument = (dbDocument: any): Document => {
  return {
    id: dbDocument.id,
    assignmentId: dbDocument.assignment_id,
    fileName: dbDocument.file_name,
    filePath: dbDocument.file_path,
    fileType: dbDocument.file_type,
    fileSize: dbDocument.file_size,
    uploadedBy: dbDocument.uploaded_by,
    uploadedAt: dbDocument.uploaded_at,
    description: dbDocument.description
  };
};

/**
 * Convert application Assignment model to database format for inserts/updates
 */
export const prepareAssignmentForDb = (assignment: Partial<Assignment>): any => {
  const dbAssignment: any = { ...assignment };
  
  // Map camelCase to snake_case for database fields
  if ('dueDate' in assignment) dbAssignment.due_date = assignment.dueDate;
  if ('createdBy' in assignment) dbAssignment.created_by = assignment.createdBy;
  if ('assignedTo' in assignment) dbAssignment.assigned_to = assignment.assignedTo;
  if ('estimatedHours' in assignment) dbAssignment.estimated_hours = assignment.estimatedHours;
  if ('caseReference' in assignment) dbAssignment.case_reference = assignment.caseReference;
  if ('clientName' in assignment) dbAssignment.client_name = assignment.clientName;
  
  // Remove camelCase properties that were mapped to snake_case
  delete dbAssignment.dueDate;
  delete dbAssignment.createdBy;
  delete dbAssignment.assignedTo;
  delete dbAssignment.estimatedHours;
  delete dbAssignment.caseReference;
  delete dbAssignment.clientName;
  
  return dbAssignment;
};

/**
 * Convert application Task model to database format for inserts/updates
 */
export const prepareTaskForDb = (task: Partial<Task>): any => {
  const dbTask: any = { ...task };
  
  // Map camelCase to snake_case for database fields
  if ('assignmentId' in task) dbTask.assignment_id = task.assignmentId;
  if ('assignedTo' in task) dbTask.assigned_to = task.assignedTo;
  if ('dueDate' in task) dbTask.due_date = task.dueDate;
  if ('completedAt' in task) dbTask.completed_at = task.completedAt;
  
  // Remove camelCase properties that were mapped to snake_case
  delete dbTask.assignmentId;
  delete dbTask.assignedTo;
  delete dbTask.dueDate;
  delete dbTask.completedAt;
  
  return dbTask;
};

/**
 * Convert application Document model to database format for inserts/updates
 */
export const prepareDocumentForDb = (document: Partial<Document>): any => {
  const dbDocument: any = { ...document };
  
  // Map camelCase to snake_case for database fields
  if ('assignmentId' in document) dbDocument.assignment_id = document.assignmentId;
  if ('fileName' in document) dbDocument.file_name = document.fileName;
  if ('filePath' in document) dbDocument.file_path = document.filePath;
  if ('fileType' in document) dbDocument.file_type = document.fileType;
  if ('fileSize' in document) dbDocument.file_size = document.fileSize;
  if ('uploadedBy' in document) dbDocument.uploaded_by = document.uploadedBy;
  if ('uploadedAt' in document) dbDocument.uploaded_at = document.uploadedAt;
  
  // Remove camelCase properties that were mapped to snake_case
  delete dbDocument.assignmentId;
  delete dbDocument.fileName;
  delete dbDocument.filePath;
  delete dbDocument.fileType;
  delete dbDocument.fileSize;
  delete dbDocument.uploadedBy;
  delete dbDocument.uploadedAt;
  
  return dbDocument;
};

/**
 * Creates a default task for a new assignment
 */
export const createDefaultTaskForAssignment = (
  assignmentId: string,
  assignmentTitle: string,
  assignedTo: string | null,
  dueDate: string
): Partial<Task> => {
  return {
    assignmentId,
    title: `Review ${assignmentTitle}`,
    description: `Initial review and planning for ${assignmentTitle}`,
    status: 'todo',
    assignedTo: assignedTo || '',
    dueDate
  };
};
