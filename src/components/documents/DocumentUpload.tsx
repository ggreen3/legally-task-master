
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, X } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

interface DocumentUploadProps {
  assignmentId: string;
  employeeId: string;
  onUploadComplete?: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  assignmentId, 
  employeeId, 
  onUploadComplete 
}) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const isMobile = useIsMobile();
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setDescription('');
    if (document.getElementById('file-upload') as HTMLInputElement) {
      (document.getElementById('file-upload') as HTMLInputElement).value = '';
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${assignmentId}/${Date.now()}-${file.name}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assignment_documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Create record in the documents table
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          assignment_id: assignmentId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: employeeId,
          description: description || null
        });
      
      if (dbError) throw dbError;
      
      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded successfully.`,
      });
      
      resetForm();
      if (onUploadComplete) onUploadComplete();
      
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading your document.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="font-medium">Upload Document</div>
          <p className="text-sm text-muted-foreground">
            Attach documents, contracts, or other files to this assignment.
          </p>
        </div>
        
        <div className="flex flex-col space-y-4">
          {file ? (
            <div className="flex items-center justify-between p-2 border rounded-lg bg-muted/20">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-legally-700" />
                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={resetForm}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
              />
              <label 
                htmlFor="file-upload" 
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <span className="text-sm font-medium mb-1">Click to upload file</span>
                <span className="text-xs text-muted-foreground">
                  PDF, Word, Excel, PowerPoint or images
                </span>
              </label>
            </div>
          )}
          
          <Textarea
            placeholder="Document description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none"
            rows={3}
          />
          
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
            className={`bg-legally-700 hover:bg-legally-800 ${isMobile ? "w-full" : ""}`}
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
