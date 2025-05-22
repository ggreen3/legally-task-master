
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  description: string | null;
}

interface DocumentListProps {
  assignmentId: string;
  employeeId?: string;
  refreshTrigger?: number; // Optional prop to trigger refresh
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  assignmentId, 
  employeeId,
  refreshTrigger = 0
}) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeNames, setEmployeeNames] = useState<{[key: string]: string}>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const isMobile = useIsMobile();
  
  // Fetch documents related to this assignment
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      
      try {
        // Fetch documents for this assignment
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('assignment_id', assignmentId)
          .order('uploaded_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setDocuments(data as Document[]);
          
          // Get unique employee IDs
          const employeeIds = [...new Set(data.map(doc => doc.uploaded_by).filter(Boolean))];
          
          if (employeeIds.length > 0) {
            // Fetch employee names
            const { data: employeeData, error: empError } = await supabase
              .from('employees')
              .select('id, name')
              .in('id', employeeIds);
              
            if (!empError && employeeData) {
              const nameMap = employeeData.reduce((acc, emp) => {
                acc[emp.id] = emp.name;
                return acc;
              }, {} as {[key: string]: string});
              
              setEmployeeNames(nameMap);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Error",
          description: "Failed to load documents.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
    
    // Set up real-time subscription for documents
    const documentsSubscription = supabase
      .channel('documents-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'documents', filter: `assignment_id=eq.${assignmentId}` },
        () => fetchDocuments()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(documentsSubscription);
    };
  }, [assignmentId, toast, refreshTrigger]);
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return <Badge variant="outline" className="bg-red-50 text-red-800">PDF</Badge>;
      case 'doc':
      case 'docx':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800">Word</Badge>;
      case 'xls':
      case 'xlsx':
        return <Badge variant="outline" className="bg-green-50 text-green-800">Excel</Badge>;
      case 'ppt':
      case 'pptx':
        return <Badge variant="outline" className="bg-amber-50 text-amber-800">PowerPoint</Badge>;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Badge variant="outline" className="bg-purple-50 text-purple-800">Image</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-800">File</Badge>;
    }
  };
  
  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('assignment_documents')
        .download(doc.file_path);
      
      if (error) throw error;
      
      // Create a temporary URL for the downloaded file
      const url = URL.createObjectURL(data);
      
      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Failed",
        description: "An error occurred while downloading the file.",
        variant: "destructive",
      });
    }
  };
  
  const confirmDelete = (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!documentToDelete) return;
    
    try {
      // First delete from storage
      const { error: storageError } = await supabase.storage
        .from('assignment_documents')
        .remove([documentToDelete.file_path]);
      
      if (storageError) throw storageError;
      
      // Then delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentToDelete.id);
      
      if (dbError) throw dbError;
      
      toast({
        title: "Document Deleted",
        description: `${documentToDelete.file_name} has been deleted.`,
      });
      
      // Close the dialog and reset the document to delete
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      
      // Filter out the deleted document from the local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id));
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Delete Failed",
        description: "An error occurred while deleting the document.",
        variant: "destructive",
      });
    }
  };
  
  const showDeleteButton = (doc: Document) => {
    if (!employeeId) return false;
    return doc.uploaded_by === employeeId;
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map(doc => (
              <div 
                key={doc.id} 
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg border"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-0">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{doc.file_name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                      {getFileIcon(doc.file_name)}
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>•</span>
                      <span>
                        Uploaded by {employeeNames[doc.uploaded_by] || 'Unknown'} on {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {doc.description && (
                      <p className="text-xs mt-1">{doc.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${isMobile ? "flex-1" : ""}`}
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    {isMobile ? "Download" : ""}
                  </Button>
                  
                  {showDeleteButton(doc) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className={`${isMobile ? "flex-1" : ""}`}
                      onClick={() => confirmDelete(doc)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {isMobile ? "Delete" : ""}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium mb-1">No documents yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload documents to this assignment to share them with the team.
            </p>
          </div>
        )}
      </CardContent>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document?
              <div className="font-medium mt-2">{documentToDelete?.file_name}</div>
              <div className="text-sm text-muted-foreground">This action cannot be undone.</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default DocumentList;
