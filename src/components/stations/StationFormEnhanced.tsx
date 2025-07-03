
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { stationsAPI } from "@/services/api";
import { toast } from "sonner";

interface StationFormEnhancedProps {
  station?: any;
  routeId: string;
  busId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormErrors {
  name?: string;
  coordinates?: string;
  fare?: string;
}

export const StationFormEnhanced: React.FC<StationFormEnhancedProps> = ({
  station,
  routeId,
  busId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: station?.name || "",
    coordinates: {
      lat: station?.coordinates?.lat || station?.latitude || "",
      lng: station?.coordinates?.lng || station?.longitude || "",
    },
    fare: station?.fare || "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (station) {
      setFormData({
        name: station.name || "",
        coordinates: {
          lat: station.coordinates?.lat || station.latitude || "",
          lng: station.coordinates?.lng || station.longitude || "",
        },
        fare: station.fare || "",
      });
    }
  }, [station]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("coordinates.")) {
      const coordinate = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [coordinate]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Station name is required";
    }
    
    if (!formData.coordinates.lat || !formData.coordinates.lng) {
      newErrors.coordinates = "Valid coordinates are required";
    }
    
    if (!formData.fare || formData.fare <= 0) {
      newErrors.fare = "Valid fare amount is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      const stationData = {
        name: formData.name,
        latitude: parseFloat(formData.coordinates.lat),
        longitude: parseFloat(formData.coordinates.lng),
        fare: parseFloat(formData.fare),
        routeId,
        busId,
      };

      if (station) {
        await stationsAPI.update({ ...stationData, _id: station._id });
        toast.success("Station updated successfully");
      } else {
        await stationsAPI.create(stationData);
        toast.success("Station created successfully");
      }
      
      onSuccess();
    } catch (error) {
      console.error("Station operation error:", error);
      toast.error(station ? "Failed to update station" : "Failed to create station");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Station Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter station name"
          className="mt-1"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <Label>Coordinates</Label>
        <div className="flex space-x-2 mt-1">
          <Input
            type="number"
            name="coordinates.lat"
            value={formData.coordinates.lat}
            onChange={handleChange}
            placeholder="Latitude"
            step="any"
          />
          <Input
            type="number"
            name="coordinates.lng"
            value={formData.coordinates.lng}
            onChange={handleChange}
            placeholder="Longitude"
            step="any"
          />
        </div>
        {errors.coordinates && <p className="text-red-500 text-sm mt-1">{errors.coordinates}</p>}
      </div>

      <div>
        <Label htmlFor="fare">Fare Amount</Label>
        <Input
          type="number"
          id="fare"
          name="fare"
          value={formData.fare}
          onChange={handleChange}
          placeholder="Enter fare amount"
          className="mt-1"
          step="any"
        />
        {errors.fare && <p className="text-red-500 text-sm mt-1">{errors.fare}</p>}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Station"}
        </Button>
      </div>
    </form>
  );
};
