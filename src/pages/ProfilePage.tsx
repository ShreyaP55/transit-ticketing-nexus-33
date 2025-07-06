
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ConcessionProfileSection } from '@/components/concession/ConcessionProfileSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/context/UserContext';
import { User, Mail, Calendar } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { userDetails } = useUser();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account and concession benefits</p>
          </div>

          {/* Basic Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>Your basic account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900 mt-1">
                    {userDetails?.firstName} {userDetails?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <p className="text-gray-900">{userDetails?.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Concession Management */}
          <ConcessionProfileSection />
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
