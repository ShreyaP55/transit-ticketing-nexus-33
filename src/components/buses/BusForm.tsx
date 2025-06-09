import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { routesAPI, busesAPI } from "@/services/api";
import { IBus, IRoute } from "@/types";
import { getRouteId } from "@/utils/typeGuards";
import { toast } from "sonner";

interface BusFormProps {
  bus?: IBus;
  onClose: () => void;
}

const BusForm: React.FC<BusFormProps> = ({ bus, onClose }) => {
  const [name, setName] = useState(bus?.name || "");
  const [selectedRouteId, setSelectedRouteId] = useState(
    bus ? getRouteId(bus.route) : ""
  );
  const [capacity, setCapacity] = useState(bus?.capacity || 50);

  const queryClient = useQueryClient();

  const { data: routes, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: routesAPI.getAll,
  });

  const createBusMutation = useMutation({
    mutationFn: busesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] });
      toast.success("Bus created successfully!");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create bus");
    },
  });

  const updateBusMutation = useMutation({
    mutationFn: busesAPI.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] });
      toast.success("Bus updated successfully!");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update bus");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !selectedRouteId || !capacity) {
      toast.error("Please fill in all fields.");
      return;
    }

    const busData = {
      name,
      route: selectedRouteId,
      capacity: Number(capacity),
    };

    if (bus) {
      updateBusMutation.mutate({ ...bus, ...busData });
    } else {
      createBusMutation.mutate(busData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{bus ? "Edit Bus" : "Add New Bus"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Bus Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="route">Route</Label>
            <Select
              value={selectedRouteId}
              onValueChange={(value) => setSelectedRouteId(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a route" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingRoutes ? (
                  <SelectItem value="loading" disabled>
                    Loading routes...
                  </SelectItem>
                ) : (
                  routes?.map((route) => (
                    <SelectItem key={route._id} value={route._id}>
                      {route.start} - {route.end}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{bus ? "Update" : "Create"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BusForm;
