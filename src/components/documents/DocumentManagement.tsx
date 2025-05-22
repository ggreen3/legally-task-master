
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import { useIsMobile } from "@/hooks/use-mobile";

interface DocumentManagementProps {
  assignmentId: string;
  employeeId: string;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({ 
  assignmentId,
  employeeId
}) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isMobile = useIsMobile();
  
  const handleUploadComplete = () => {
    // Increment refresh trigger to cause DocumentList to refresh
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <Tabs defaultValue="documents" className="w-full">
      <TabsList className="w-full mb-4">
        <TabsTrigger value="documents" className="flex-1">Documents</TabsTrigger>
        <TabsTrigger value="upload" className="flex-1">Upload</TabsTrigger>
      </TabsList>
      
      <TabsContent value="documents" className="mt-0">
        <DocumentList 
          assignmentId={assignmentId} 
          employeeId={employeeId}
          refreshTrigger={refreshTrigger}
        />
      </TabsContent>
      
      <TabsContent value="upload" className="mt-0">
        <DocumentUpload 
          assignmentId={assignmentId} 
          employeeId={employeeId}
          onUploadComplete={handleUploadComplete}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DocumentManagement;
