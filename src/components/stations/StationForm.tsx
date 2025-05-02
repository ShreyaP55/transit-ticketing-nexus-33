
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { busesAPI, stationsAPI } from "@/services/api";
import { IStation } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

interface StationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  station: IStation | null;
  selectedRouteId: string;
}

const StationForm: React.FC<StationFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  station,
  selectedRouteId,
}) => {
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState({
    id: station?._id || "",
    name: station?.name || "",
    busId: station?.busId._id || "",
    latitude: station?.latitude || 0,
    longitude: station?.longitude || 0,
    fare: station?.fare || 0,
  });

  const { data: buses, isLoading: isLoadingBuses } = useQuery({
    queryKey: ["buses", selectedRouteId],
    queryFn: () => busesAPI.getAll(selectedRouteId),
    enabled: !!selectedRouteId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => stationsAPI.create(data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => stationsAPI.update(data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  useEffect(() => {
    // Update form values when station changes
    if (station) {
      setFormValues({
        id: station._id,
        name: station.name,
        busId: typeof station.busId === 'string' ? station.busId : station.busId._id,
        latitude: station.latitude,
        longitude: station.longitude,
        fare: station.fare,
      });
    } else {
      // Reset form for new station
      setFormValues({
        id: "",
        name: "",
        busId: buses && buses.length > 0 ? buses[0]._id : "",
        latitude: 0,
        longitude: 0,
        fare: 0,
      });
    }
  }, [station, buses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: name === "fare" || name === "latitude" || name === "longitude" 
        ? parseFloat(value) 
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formValues,
      routeId: selectedRouteId,
    };

    if (station) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormValues(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        toast.success("Location updated!");
      }, (error) => {
        toast.error(`Location error: ${error.message}`);
      });
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const isFormValid = () => {
    return (
      formValues.name.trim() !== "" &&
      formValues.busId !== "" &&
      formValues.latitude !== 0 &&
      formValues.longitude !== 0 &&
      formValues.fare > 0
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {station ? "Edit Station" : "Add New Station"}
          </DialogTitle>
          <DialogDescription>
            {station
              ? "Update the details for this station."
              : "Enter the details for the new station."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Station Name</Label>
              <Input
                id="name"
                name="name"
                value={formValues.name}
                onChange={handleChange}
                placeholder="Enter station name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="busId">Select Bus</Label>
              {isLoadingBuses ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  id="busId"
                  name="busId"
                  value={formValues.busId}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  required
                >
                  <option value="" disabled>Select a bus</option>
                  {buses?.map(bus => (
                    <option key={bus._id} value={bus._id}>{bus.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="0.000001"
                  value={formValues.latitude}
                  onChange={handleChange}
                  placeholder="Latitude"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="0.000001"
                  value={formValues.longitude}
                  onChange={handleChange}
                  placeholder="Longitude"
                  required
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGetCurrentLocation}
            >
              Get Current Location
            </Button>

            <div className="space-y-2">
              <Label htmlFor="fare">Fare (₹)</Label>
              <Input
                id="fare"
                name="fare"
                type="number"
                min="0"
                step="0.01"
                value={formValues.fare}
                onChange={handleChange}
                placeholder="Enter fare amount"
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
              disabled={!isFormValid() || createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                "Saving..."
              ) : station ? (
                "Update Station"
              ) : (
                "Add Station"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StationForm;
