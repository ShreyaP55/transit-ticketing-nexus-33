
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Route, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { routesAPI } from "@/services/api";
import RouteForm from "@/components/routes/RouteForm";
import { IRoute } from "@/types";

const RoutesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<IRoute | null>(null);
  const queryClient = useQueryClient();

  // Fetch routes with improved error handling
  const { 
    data: routes = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['routes'],
    queryFn: routesAPI.getAll,
    retry: 3,
    retryDelay: 1000
  });

  // Handle error display
  React.useEffect(() => {
    if (error) {
      console.error("Routes fetch error:", error);
      toast.error(`Failed to load routes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [error]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: routesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success("Route deleted successfully");
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete route';
      toast.error(errorMessage);
    }
  });

  const handleEdit = (route: IRoute) => {
    setEditingRoute(route);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingRoute(null);
  };

  if (isLoading) {
    return (
      <MainLayout title="Route Management">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading routes...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Route Management">
        <div className="flex items-center justify-center min-h-64">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">Connection Error</h3>
                  <p className="text-muted-foreground">
                    Unable to connect to the server. Please ensure your backend is running.
                  </p>
                </div>
                <Button onClick={() => refetch()} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Route Management">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white neonText mb-2">Route Management</h1>
            <p className="text-muted-foreground">Manage bus routes and their fares</p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-transit-orange hover:bg-transit-orange-dark"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Route
          </Button>
        </div>

        {/* Routes Grid */}
        {routes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Routes Found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first route</p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Route
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <Card key={route._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <Route className="h-5 w-5 text-transit-orange" />
                      <CardTitle className="text-lg">{route.start} → {route.end}</CardTitle>
                    </div>
                    <Badge variant="secondary">₹{route.fare}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>From {route.start} to {route.end}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(route)}
                      className="flex-1"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(route._id)}
                      className="flex-1 text-red-600 hover:text-red-700"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Route Form Modal */}
        <RouteForm
          isOpen={isFormOpen}
          route={editingRoute}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      </div>
    </MainLayout>
  );
};

export default RoutesPage;
