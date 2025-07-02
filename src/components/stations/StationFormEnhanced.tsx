
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { stationsAPI, routesAPI, busesAPI } from "@/services/api";
import { IStation, IRoute, IBus } from "@/types";
import { toast } from "sonner";
import { MapPin, AlertCircle } from "lucide-react";

interface StationFormEnhancedProps {
  station?: IStation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  routeId: string;
  busId: string;
  name: string;
  latitude: string;
  longitude: string;
  fare: string;
  location: string;
}

interface FormErrors {
  routeId?: string;
  busId?: string;
  name?: string;
  latitude?: string;
  longitude?: string;
  fare?: string;
  location?: string;
}

export const StationFormEnhanced: React.FC<StationFormEnhancedProps> = ({
  station,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [buses, setBuses] = useState<IBus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    routeId: "",
    busId: "",
    name: "",
    latitude: "",
    longitude: "",
    fare: "",
    location: "",
  });

  // Load initial data
  useEffect(() => {
    if (open) {
      loadRoutes();
      if (station) {
        setFormData({
          routeId: typeof station.routeId === 'string' ? station.routeId : station.routeId._id,
          busId: typeof station.busId === 'string' ? station.busId : station.busId._id,
          name: station.name,
          latitude: station.latitude.toString(),
          longitude: station.longitude.toString(),
          fare: station.fare.toString(),
          location: station.location || station.name,
        });
      } else {
        resetForm();
      }
    }
  }, [open, station]);

  // Load buses when route changes
  useEffect(() => {
    if (formData.routeId) {
      loadBuses(formData.routeId);
    }
  }, [formData.routeId]);

  const loadRoutes = async () => {
    try {
      setIsLoading(true);
      const routesData = await routesAPI.getAll();
      setRoutes(routesData);
    } catch (error) {
      toast.error("Failed to load routes");
    } finally {
      setIsLoading(false);
    }
  };

  const loadBuses = async (routeId: string) => {
    try {
      const busesData = await busesAPI.getAll(routeId);
      setBuses(busesData);
    } catch (error) {
      toast.error("Failed to load buses");
    }
  };

  const resetForm = () => {
    setFormData({
      routeId: "",
      busId: "",
      name: "",
      latitude: "",
      longitude: "",
      fare: "",
      location: "",
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.routeId) newErrors.routeId = "Route is required";
    if (!formData.busId) newErrors.busId = "Bus is required";
    if (!formData.name.trim()) newErrors.name = "Station name is required";
    if (!formData.latitude) {
      newErrors.latitude = "Latitude is required";
    } else if (isNaN(Number(formData.latitude))) {
      newErrors.latitude = "Latitude must be a valid number";
    }
    if (!formData.longitude) {
      newErrors.longitude = "Longitude is required";
    } else if (isNaN(Number(formData.longitude))) {
      newErrors.longitude = "Longitude must be a valid number";
    }
    if (!formData.fare) {
      newErrors.fare = "Fare is required";
    } else if (isNaN(Number(formData.fare)) || Number(formData.fare) <= 0) {
      newErrors.fare = "Fare must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      const stationData = {
        routeId: formData.routeId,
        busId: formData.busId,
        name: formData.name.trim(),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        fare: Number(formData.fare),
        location: formData.location.trim() || formData.name.trim(),
      };

      if (station) {
        await stationsAPI.update(station._id, stationData);
        toast.success("Station updated successfully");
      } else {
        await stationsAPI.create(stationData);
        toast.success("Station created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Station form error:", error);
      toast.error(error.message || "Failed to save station");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {station ? "Edit Station" : "Add New Station"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="routeId">Route</Label>
            <Select 
              value={formData.routeId} 
              onValueChange={(value) => handleInputChange('routeId', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.routeId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select route" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((route) => (
                  <SelectItem key={route._id} value={route._id}>
                    {route.start} → {route.end}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.routeId && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.routeId}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="busId">Bus</Label>
            <Select 
              value={formData.busId} 
              onValueChange={(value) => handleInputChange('busId', value)}
              disabled={!formData.routeId}
            >
              <SelectTrigger className={errors.busId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select bus" />
              </SelectTrigger>
              <SelectContent>
                {buses.map((bus) => (
                  <SelectItem key={bus._id} value={bus._id}>
                    {bus.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.busId && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.busId}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="name">Station Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter station name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                value={formData.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                placeholder="0.0000"
                className={errors.latitude ? "border-red-500" : ""}
              />
              {errors.latitude && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.latitude}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                placeholder="0.0000"
                className={errors.longitude ? "border-red-500" : ""}
              />
              {errors.longitude && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.longitude}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="fare">Fare (₹)</Label>
            <Input
              id="fare"
              value={formData.fare}
              onChange={(e) => handleInputChange('fare', e.target.value)}
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0"
              className={errors.fare ? "border-red-500" : ""}
            />
            {errors.fare && (
              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.fare}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter location description"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : station ? "Update Station" : "Create Station"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
