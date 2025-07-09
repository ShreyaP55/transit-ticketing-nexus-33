
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ConcessionProfileSection } from '@/components/concession/ConcessionProfileSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/context/UserContext';
import { User, Mail, Calendar, MapPin, Activity, DollarSign, TrendingUp, Clock } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { userDetails, userProfile, isLoading } = useUser();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-60 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account and view your travel statistics</p>
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
                    {userProfile?.firstName || userDetails?.firstName} {userProfile?.lastName || userDetails?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <p className="text-gray-900">{userProfile?.email || userDetails?.email}</p>
                  </div>
                </div>
                {userProfile?.dateOfBirth && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <p className="text-gray-900">
                        {new Date(userProfile.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {userProfile?.gender && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    <p className="text-gray-900 mt-1 capitalize">{userProfile.gender}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Travel Statistics */}
          {userProfile?.statistics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Travel Statistics</span>
                </CardTitle>
                <CardDescription>Your travel history and savings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{userProfile.statistics.totalRides}</p>
                    <p className="text-sm text-blue-700">Total Rides</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">₹{userProfile.statistics.totalSavings}</p>
                    <p className="text-sm text-green-700">Total Savings</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">{userProfile.statistics.totalDistance} km</p>
                    <p className="text-sm text-purple-700">Distance Traveled</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">₹{userProfile.statistics.averageFare}</p>
                    <p className="text-sm text-orange-700">Average Fare</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <MapPin className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-indigo-600">{userProfile.statistics.averageRideDistance} km</p>
                    <p className="text-sm text-indigo-700">Avg Distance</p>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-pink-600">₹{userProfile.statistics.totalAmount}</p>
                    <p className="text-sm text-pink-700">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Concession Management */}
          <ConcessionProfileSection />

          {/* Government ID Information */}
          {userProfile?.governmentIdType && (
            <Card>
              <CardHeader>
                <CardTitle>Government ID Information</CardTitle>
                <CardDescription>Your verified identification details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">ID Type</label>
                    <p className="text-gray-900 mt-1 capitalize">{userProfile.governmentIdType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">ID Number</label>
                    <p className="text-gray-900 mt-1">
                      {userProfile.governmentIdNumber ? `****${userProfile.governmentIdNumber.slice(-4)}` : 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={userProfile.verificationStatus === 'verified' ? 'default' : 'secondary'}
                    className={
                      userProfile.verificationStatus === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : userProfile.verificationStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {userProfile.verificationStatus === 'verified' ? '✓ Verified' : 
                     userProfile.verificationStatus === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                  </Badge>
                  {userProfile.verificationDate && (
                    <span className="text-sm text-gray-500">
                      Verified on {new Date(userProfile.verificationDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
