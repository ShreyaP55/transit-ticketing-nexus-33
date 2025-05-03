
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routesAPI, busesAPI } from "@/services/api";
import { IBus, IRoute } from "@/types";
import { Bus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BusFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bus: IBus | null;
  selectedRouteId?: string;
}

const BusForm: React.FC<BusFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bus,
  selectedRouteId
}) => {
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState({
    id: bus?._id || "",
    name: bus?.name || "",
    route: bus?.route?._id || selectedRouteId || "",
    capacity: bus?.capacity || 40,
  });

  const { data: routes, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['routes'],
    queryFn: routesAPI.getAll
  });

  useEffect(() => {
    if (selectedRouteId) {
      setFormValues(prev => ({
        ...prev,
        route: selectedRouteId
      }));
    }
  }, [selectedRouteId]);

  useEffect(() => {
    if (bus) {
      setFormValues({
        id: bus._id,
        name: bus.name,
        route: typeof bus.route === 'string' ? bus.route : bus.route._id,
        capacity: bus.capacity,
      });
    }
  }, [bus]);

  const createMutation = useMutation({
    mutationFn: (data: Omit<IBus, "_id" | "route"> & { route: string }) => busesAPI.create(data),
    onSuccess: () => {
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      toast.success("Bus created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Omit<IBus, "route"> & { route: string }) => busesAPI.update(data),
    onSuccess: () => {
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      toast.success("Bus updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bus) {
      updateMutation.mutate({
        _id: formValues.id,
        name: formValues.name,
        route: formValues.route,
        capacity: formValues.capacity,
      });
    } else {
      createMutation.mutate({
        name: formValues.name,
        route: formValues.route,
        capacity: formValues.capacity,
      });
    }
  };

  const isFormValid = () => {
    return (
      formValues.name.trim() !== "" &&
      formValues.route.trim() !== "" &&
      formValues.capacity > 0
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary neonText">
            <Bus className="h-5 w-5" />
            {bus ? "Edit Bus" : "Add New Bus"}
          </DialogTitle>
          <DialogDescription>
            {bus
              ? "Update the details for this bus."
              : "Enter the details for the new bus."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bus Name</Label>
              <Input
                id="name"
                name="name"
                value={formValues.name}
                onChange={handleChange}
                placeholder="Enter bus name"
                className="border-muted bg-background/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="route">Select Route</Label>
              {isLoadingRoutes ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  id="route"
                  name="route"
                  value={formValues.route}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-muted bg-background/50 px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  required
                >
                  <option value="" disabled>Select a route</option>
                  {routes?.map((route: IRoute) => (
                    <option key={route._id} value={route._id}>
                      {route.start} - {route.end} (₹{route.fare})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (seats)</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                max="100"
                value={formValues.capacity}
                onChange={handleChange}
                placeholder="Enter seat capacity"
                className="border-muted bg-background/50"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/80 text-primary-foreground"
              disabled={!isFormValid() || createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                "Saving..."
              ) : bus ? (
                "Update Bus"
              ) : (
                "Add Bus"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BusForm;
