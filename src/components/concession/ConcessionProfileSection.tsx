
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConcessionStatusBadge } from './ConcessionStatusBadge';
import { ConcessionRegistrationModal } from './ConcessionRegistrationModal';
import { Settings, Upload, Eye, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface UserConcessionData {
  concessionType: string;
  verificationStatus: string;
  verificationDate?: string;
  documentExpiryDate?: string;
  verificationNotes?: string;
}

export const ConcessionProfileSection: React.FC = () => {
  const [concessionData, setConcessionData] = useState<UserConcessionData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConcessionStatus();
  }, []);

  const fetchConcessionStatus = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(`/api/verification/status/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setConcessionData({
          concessionType: data.concessionType || 'general',
          verificationStatus: data.verificationStatus || 'pending',
          verificationDate: data.verificationDate,
          documentExpiryDate: data.documentExpiryDate,
          verificationNotes: data.verificationNotes
        });
      }
    } catch (error) {
      console.error('Error fetching concession status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConcessionComplete = () => {
    fetchConcessionStatus();
    setIsModalOpen(false);
    toast.success('Concession settings updated successfully!');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Concession Benefits</span>
          </CardTitle>
          <CardDescription>
            Manage your concession category and verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {concessionData && (
            <ConcessionStatusBadge
              concessionType={concessionData.concessionType}
              verificationStatus={concessionData.verificationStatus}
            />
          )}

          {concessionData?.verificationStatus === 'verified' && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 text-green-800">
                <Eye className="h-4 w-4" />
                <span className="font-medium">Verification Details</span>
              </div>
              {concessionData.verificationDate && (
                <p className="text-sm text-green-700 mt-1">
                  Verified on: {new Date(concessionData.verificationDate).toLocaleDateString()}
                </p>
              )}
              {concessionData.documentExpiryDate && (
                <div className="flex items-center space-x-1 text-sm text-green-700 mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>Document expires: {new Date(concessionData.documentExpiryDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          {concessionData?.verificationStatus === 'rejected' && concessionData.verificationNotes && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="font-medium text-red-800">Rejection Reason:</p>
              <p className="text-sm text-red-700 mt-1">{concessionData.verificationNotes}</p>
            </div>
          )}

          {concessionData?.verificationStatus === 'pending' && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 font-medium">Verification In Progress</p>
              <p className="text-sm text-yellow-700 mt-1">
                Your documents are being reviewed. This typically takes 2-3 business days.
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>
                {concessionData?.concessionType === 'general' ? 'Set Up Concession' : 'Update Documents'}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConcessionRegistrationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onComplete={handleConcessionComplete}
      />
    </>
  );
};
