
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Camera, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploadStepProps {
  concessionType: string;
  onDocumentUploaded: (documentData: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const documentTypes = {
  aadhaar: 'Aadhaar Card',
  pan: 'PAN Card',
  student_id: 'Student ID Card',
  driving_license: 'Driving License',
  voter_id: 'Voter ID Card'
};

export const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  concessionType,
  onDocumentUploaded,
  onNext,
  onBack
}) => {
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile || !selectedDocType) {
      toast.error('Please select document type and upload a file');
      return;
    }

    setIsUploading(true);
    try {
      // Simulate upload process
      // In real implementation, upload to Cloudinary and run OCR
      const mockDocumentData = {
        documentType: selectedDocType,
        documentUrl: previewUrl,
        extractedData: {
          dateOfBirth: '15/04/1990',
          gender: 'female',
          name: 'Sample Name',
          documentNumber: 'XXXX-XXXX-XXXX'
        }
      };

      onDocumentUploaded(mockDocumentData);
      toast.success('Document uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const getRequiredDocuments = () => {
    switch (concessionType) {
      case 'student':
        return ['student_id', 'aadhaar'];
      case 'child':
        return ['aadhaar'];
      case 'elderly':
        return ['aadhaar', 'pan', 'voter_id', 'driving_license'];
      case 'women':
        return ['aadhaar', 'pan', 'voter_id', 'driving_license'];
      default:
        return Object.keys(documentTypes);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Upload Verification Document</h2>
        <p className="text-gray-600 mt-2">Upload a clear photo of your government ID for verification</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Document Type</span>
          </CardTitle>
          <CardDescription>
            Select the type of document you're uploading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedDocType} onValueChange={setSelectedDocType}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {getRequiredDocuments().map((docType) => (
                <SelectItem key={docType} value={docType}>
                  {documentTypes[docType as keyof typeof documentTypes]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Document</span>
          </CardTitle>
          <CardDescription>
            Drag and drop your document image or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {previewUrl ? (
              <div className="space-y-4">
                <img
                  src={previewUrl}
                  alt="Document preview"
                  className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                />
                <p className="text-sm text-gray-600">Document uploaded successfully</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Camera className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-700">Drop your document here</p>
                  <p className="text-sm text-gray-500">or click to browse files</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 cursor-pointer"
                >
                  Browse Files
                </label>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Important Guidelines:</p>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>Ensure the document is clear and all text is readable</li>
                  <li>Take the photo in good lighting conditions</li>
                  <li>Make sure the entire document is visible in the frame</li>
                  <li>File size should be less than 5MB</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          onClick={handleUpload}
          disabled={!uploadedFile || !selectedDocType || isUploading}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isUploading ? 'Processing...' : 'Upload & Continue'}
        </Button>
      </div>
    </div>
  );
};
