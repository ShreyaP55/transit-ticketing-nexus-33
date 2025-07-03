
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Bus } from "lucide-react";
import { busesAPI, routesAPI } from "@/services/api";
import { IBus, IRoute } from "@/types";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusTable } from "@/components/buses/BusTable";
import BusForm from "@/components/buses/BusForm";
import BusFilters from "@/components/buses/BusFilters";
import { Card, CardContent } from "@/components/ui/card";

const BusesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<IBus | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: buses = [], isLoading: busesLoading, refetch } = useQuery({
    queryKey: ["buses"],
    queryFn: () => busesAPI.getAll(),
  });

  const { data: routes = [], isLoading: routesLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: routesAPI.getAll,
  });

  const filteredBuses = buses.filter((bus) => {
    const matchesSearch = bus.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoute = !selectedRoute || selectedRoute === "all" || (typeof bus.route === 'object' && bus.route?._id === selectedRoute);
    return matchesSearch && matchesRoute;
  });

  const handleEdit = (bus: IBus) => {
    setEditingBus(bus);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingBus(null);
    refetch();
  };

  const isLoading = busesLoading || routesLoading;

  return (
    <MainLayout title="Bus Management">
      <div className="space-y-4 md:space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Bus className="h-6 w-6 text-primary" />
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Bus Management</h1>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Bus
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="w-full">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search buses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full lg:w-auto"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t">
                <BusFilters
                  routes={routes}
                  isLoadingRoutes={routesLoading}
                  selectedRouteId={selectedRoute}
                  onRouteFilter={setSelectedRoute}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <Card className="w-full">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <div className="text-center">
                  <h3 className="text-lg font-medium">Loading Buses</h3>
                  <p className="text-muted-foreground">Please wait while we fetch the bus data...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full overflow-hidden">
            <BusTable
              buses={filteredBuses}
              onEdit={handleEdit}
              onRefresh={refetch}
            />
          </div>
        )}

        {/* Bus Form Modal */}
        <BusForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
          bus={editingBus}
          selectedRouteId={selectedRoute}
        />
      </div>
    </MainLayout>
  );
};

export default BusesPage;
