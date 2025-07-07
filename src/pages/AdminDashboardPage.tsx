
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/services/api/admin';
import { Users, Navigation, CreditCard, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const AdminDashboardPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Dashboard stats query
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats', refreshKey],
    queryFn: adminAPI.getDashboardStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Active users query
  const { data: activeUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-active-users', refreshKey],
    queryFn: adminAPI.getActiveUsers,
    refetchInterval: 30000,
  });

  // Completed rides query
  const { data: completedRidesData, isLoading: ridesLoading } = useQuery({
    queryKey: ['admin-completed-rides', refreshKey],
    queryFn: () => adminAPI.getCompletedRides({ page: 1, limit: 20 }),
    refetchInterval: 30000,
  });

  // Pass verification query
  const { data: passVerificationData, isLoading: passLoading } = useQuery({
    queryKey: ['admin-pass-verification', refreshKey],
    queryFn: adminAPI.getPassVerification,
    refetchInterval: 30000,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Dashboard refreshed');
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Real-time system overview and management</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : dashboardStats?.totalUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
              <Navigation className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : dashboardStats?.activeTrips || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : formatCurrency(dashboardStats?.todayRevenue || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Passes</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : dashboardStats?.totalPasses || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Rides</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : dashboardStats?.completedRides || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : dashboardStats?.pendingVerifications || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="active-users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active-users">Active Users</TabsTrigger>
            <TabsTrigger value="completed-rides">Completed Rides</TabsTrigger>
            <TabsTrigger value="pass-verification">Pass Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="active-users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Currently Active Users</CardTitle>
                <CardDescription>Users with ongoing trips</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-4">Loading active users...</div>
                ) : activeUsers && activeUsers.length > 0 ? (
                  <div className="space-y-4">
                    {activeUsers.map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">
                            {user.user.firstName} {user.user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{user.user.email}</p>
                          <p className="text-xs text-gray-500">Started: {formatDate(user.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{user.user.concessionType}</Badge>
                          <p className="text-xs text-gray-500 mt-1">Trip ID: {user._id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No active users at the moment
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed-rides" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Completed Rides</CardTitle>
                <CardDescription>Latest ride transactions and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {ridesLoading ? (
                  <div className="text-center py-4">Loading completed rides...</div>
                ) : completedRidesData && completedRidesData.rides.length > 0 ? (
                  <div className="space-y-4">
                    {completedRidesData.rides.map((ride) => (
                      <div key={ride._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">
                            {ride.user.firstName} {ride.user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{ride.user.email}</p>
                          <p className="text-xs text-gray-500">
                            {ride.startLocation} → {ride.endLocation}
                          </p>
                          <p className="text-xs text-gray-500">
                            Completed: {formatDate(ride.updatedAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(ride.fare)}
                          </div>
                          <Badge variant="outline">{ride.user.concessionType}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No completed rides found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pass-verification" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Statistics</CardTitle>
                  <CardDescription>Status breakdown of user verifications</CardDescription>
                </CardHeader>
                <CardContent>
                  {passLoading ? (
                    <div className="text-center py-4">Loading verification stats...</div>
                  ) : passVerificationData && passVerificationData.verificationStats ? (
                    <div className="space-y-3">
                      {passVerificationData.verificationStats.map((stat) => (
                        <div key={stat._id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusBadgeVariant(stat._id)}>
                              {stat._id || 'Unknown'}
                            </Badge>
                          </div>
                          <span className="font-medium">{stat.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No verification data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Verifications</CardTitle>
                  <CardDescription>Latest verification requests and decisions</CardDescription>
                </CardHeader>
                <CardContent>
                  {passLoading ? (
                    <div className="text-center py-4">Loading recent verifications...</div>
                  ) : passVerificationData && passVerificationData.recentVerifications.length > 0 ? (
                    <div className="space-y-3">
                      {passVerificationData.recentVerifications.slice(0, 10).map((verification) => (
                        <div key={verification._id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h4 className="font-medium text-sm">
                              {verification.firstName} {verification.lastName}
                            </h4>
                            <p className="text-xs text-gray-600">{verification.email}</p>
                            <p className="text-xs text-gray-500">{verification.concessionType}</p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(verification.verificationStatus)}>
                            {verification.verificationStatus}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No recent verifications
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
