
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { routesAPI, busesAPI, stationsAPI } from "@/services/api";
import { IStation, IRoute, IBus } from "@/types";
import { getBusId } from "@/utils/typeGuards";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
    busId: station ? getBusId(station.busId) : "",
    latitude: station?.latitude || 0,
    longitude: station?.longitude || 0,
    fare: station?.fare || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: buses, isLoading: isLoadingBuses } = useQuery({
    queryKey: ["buses", selectedRouteId],
    queryFn: () => busesAPI.getAll(selectedRouteId),
    enabled: !!selectedRouteId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating station with data:', data);
      const result = await stationsAPI.create(data);
      console.log('Station created successfully:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Station creation success:', data);
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("Station created successfully!");
      onSuccess();
    },
    onError: (error: Error) => {
      console.error('Station creation error:', error);
      toast.error(`Error creating station: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Updating station with data:', data);
      const result = await stationsAPI.update(data);
      console.log('Station updated successfully:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Station update success:', data);
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      toast.success("Station updated successfully!");
      onSuccess();
    },
    onError: (error: Error) => {
      console.error('Station update error:', error);
      toast.error(`Error updating station: ${error.message}`);
    },
  });

  useEffect(() => {
    if (station) {
      console.log('Setting form values for existing station:', station);
      setFormValues({
        id: station._id,
        name: station.name,
        busId: getBusId(station.busId),
        latitude: station.latitude,
        longitude: station.longitude,
        fare: station.fare,
      });
    } else {
      console.log('Resetting form for new station');
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
    console.log('Form field changed:', name, value);
    setFormValues((prev) => ({
      ...prev,
      [name]: name === "fare" || name === "latitude" || name === "longitude" 
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log('Select field changed:', name, value);
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      console.log('Form already submitting, ignoring duplicate submission');
      return;
    }

    console.log('Submitting station form with values:', formValues);
    
    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formValues,
        routeId: selectedRouteId,
        latitude: Number(formValues.latitude),
        longitude: Number(formValues.longitude),
        fare: Number(formValues.fare),
      };

      console.log('Final payload for submission:', payload);

      if (station) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetCurrentLocation = () => {
    console.log('Getting current location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location obtained:', position.coords);
          setFormValues(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          toast.success("Location updated!");
        }, 
        (error) => {
          console.error('Geolocation error:', error);
          toast.error(`Location error: ${error.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const isFormValid = () => {
    const valid = formValues.name.trim() !== "" &&
      formValues.busId !== "" &&
      formValues.latitude !== 0 &&
      formValues.longitude !== 0 &&
      formValues.fare > 0;
    
    console.log('Form validation result:', valid, formValues);
    return valid;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary neonText">
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
              <Label htmlFor="name">Station Name *</Label>
              <Input
                id="name"
                name="name"
                value={formValues.name}
                onChange={handleChange}
                placeholder="Enter station name"
                className="border-muted bg-background/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="busId">Select Bus *</Label>
              {isLoadingBuses ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select 
                  value={formValues.busId} 
                  onValueChange={(value) => handleSelectChange('busId', value)}
                >
                  <SelectTrigger className="border-muted bg-background/50">
                    <SelectValue placeholder="Select a bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {buses?.map(bus => (
                      <SelectItem key={bus._id} value={bus._id}>
                        {bus.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="0.000001"
                  value={formValues.latitude}
                  onChange={handleChange}
                  placeholder="Latitude"
                  className="border-muted bg-background/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="0.000001"
                  value={formValues.longitude}
                  onChange={handleChange}
                  placeholder="Longitude"
                  className="border-muted bg-background/50"
                  required
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-primary/30 hover:border-primary hover:bg-primary/20 text-primary"
              onClick={handleGetCurrentLocation}
            >
              Get Current Location
            </Button>

            <div className="space-y-2">
              <Label htmlFor="fare">Fare (₹) *</Label>
              <Input
                id="fare"
                name="fare"
                type="number"
                min="0"
                step="0.01"
                value={formValues.fare}
                onChange={handleChange}
                placeholder="Enter fare amount"
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/80 text-white"
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
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
