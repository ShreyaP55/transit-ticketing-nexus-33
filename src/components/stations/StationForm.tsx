
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, MapPin } from "lucide-react";
import { stationsAPI, busesAPI, routesAPI } from "@/services/api";
import { toast } from "sonner";
import { IStation, IBus, IRoute } from "@/types";
import { getRouteId, getBusId } from "@/utils/typeGuards";

interface StationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  station?: IStation | null;
  selectedRouteId?: string;
}

const StationForm: React.FC<StationFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  station,
  selectedRouteId,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    routeId: selectedRouteId || "",
    busId: "",
    latitude: "",
    longitude: "",
    fare: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [buses, setBuses] = useState<IBus[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingBuses, setLoadingBuses] = useState(false);

  // Load routes on mount
  useEffect(() => {
    if (isOpen) {
      setLoadingRoutes(true);
      routesAPI.getAll()
        .then((routesData) => {
          setRoutes(routesData);
          console.log('Routes loaded:', routesData);
        })
        .catch(error => {
          console.error("Error loading routes:", error);
          toast.error("Failed to load routes");
        })
        .finally(() => setLoadingRoutes(false));
    }
  }, [isOpen]);

  // Load buses when route changes
  useEffect(() => {
    if (formData.routeId) {
      setLoadingBuses(true);
      busesAPI.getByRoute(formData.routeId)
        .then((busesData) => {
          setBuses(busesData);
          console.log('Buses loaded for route:', formData.routeId, busesData);
        })
        .catch(error => {
          console.error("Error loading buses:", error);
          toast.error("Failed to load buses");
        })
        .finally(() => setLoadingBuses(false));
    } else {
      setBuses([]);
    }
  }, [formData.routeId]);

  // Initialize form data when modal opens or station changes
  useEffect(() => {
    if (isOpen) {
      if (station) {
        // Pre-fill form with station data for editing
        console.log('Editing station:', station);
        
        const routeId = getRouteId(station.routeId) || "";
        const busId = getBusId(station.busId) || "";
        
        console.log('Extracted IDs - Route:', routeId, 'Bus:', busId);
        
        setFormData({
          name: station.name || "",
          routeId: routeId,
          busId: busId,
          latitude: station.latitude?.toString() || "",
          longitude: station.longitude?.toString() || "",
          fare: station.fare?.toString() || "",
        });
      } else {
        // Clear form for new station
        setFormData({
          name: "",
          routeId: selectedRouteId || "",
          busId: "",
          latitude: "",
          longitude: "",
          fare: "",
        });
      }
    }
  }, [isOpen, station, selectedRouteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.routeId || !formData.busId || !formData.latitude || !formData.longitude || !formData.fare) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const stationData = {
        name: formData.name.trim(),
        routeId: formData.routeId,
        busId: formData.busId,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        fare: parseFloat(formData.fare),
        location: formData.name.trim(),
      };

      console.log('Submitting station data:', stationData);

      if (station) {
        await stationsAPI.update({ ...stationData, _id: station._id });
        toast.success("Station updated successfully");
      } else {
        await stationsAPI.create(stationData);
        toast.success("Station created successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving station:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save station");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-900 border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-600/20 to-transparent border-b border-gray-700">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-white">
              <MapPin className="mr-2 h-5 w-5 text-blue-400" />
              {station ? "Edit Station" : "Add New Station"}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Station Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Enter station name"
              />
            </div>

            <div>
              <Label htmlFor="routeId" className="text-white">Route</Label>
              <Select 
                value={formData.routeId} 
                onValueChange={(value) => setFormData({ ...formData, routeId: value, busId: "" })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select a route" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {loadingRoutes ? (
                    <SelectItem value="loading" disabled className="text-gray-400">
                      Loading routes...
                    </SelectItem>
                  ) : routes.length > 0 ? (
                    routes.map((route) => (
                      <SelectItem key={route._id} value={route._id} className="text-white">
                        {route.start} - {route.end}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-routes" disabled className="text-gray-400">
                      No routes available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="busId" className="text-white">Bus</Label>
              <Select 
                value={formData.busId} 
                onValueChange={(value) => setFormData({ ...formData, busId: value })}
                disabled={!formData.routeId}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder={!formData.routeId ? "Select a route first" : "Select a bus"} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {loadingBuses ? (
                    <SelectItem value="loading" disabled className="text-gray-400">
                      Loading buses...
                    </SelectItem>
                  ) : buses.length > 0 ? (
                    buses.map((bus) => (
                      <SelectItem key={bus._id} value={bus._id} className="text-white">
                        {bus.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-buses" disabled className="text-gray-400">
                      No buses available for this route
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude" className="text-white">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="0.000000"
                />
              </div>
              <div>
                <Label htmlFor="longitude" className="text-white">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="0.000000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="fare" className="text-white">Fare (₹)</Label>
              <Input
                id="fare"
                type="number"
                step="0.01"
                value={formData.fare}
                onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                required
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="0.00"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Saving..." : station ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StationForm;
