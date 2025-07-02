
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { busesAPI, stationsAPI } from "@/services/api";
import { IBus } from "@/types";
import { toast } from "sonner";

interface BusDeleteDialogProps {
  bus: IBus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export const BusDeleteDialog: React.FC<BusDeleteDialogProps> = ({
  bus,
  open,
  onOpenChange,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [dependencies, setDependencies] = useState<{ stations: number } | null>(null);

  React.useEffect(() => {
    if (open && bus._id) {
      // Check for dependencies
      checkDependencies();
    }
  }, [open, bus._id]);

  const checkDependencies = async () => {
    try {
      const stations = await stationsAPI.getAll({ busId: bus._id });
      setDependencies({ stations: stations.length });
    } catch (error) {
      console.error("Error checking dependencies:", error);
      setDependencies({ stations: 0 });
    }
  };

  const handleDelete = async () => {
    if (!bus._id) return;

    try {
      setIsDeleting(true);
      
      // Delete the bus
      await busesAPI.delete(bus._id);
      
      toast.success(`Bus "${bus.name}" deleted successfully`);
      onDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting bus:", error);
      toast.error("Failed to delete bus. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Delete Bus
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to delete the bus "{bus.name}"?</p>
            
            {dependencies && dependencies.stations > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Warning</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  This bus has {dependencies.stations} associated station{dependencies.stations !== 1 ? 's' : ''}. 
                  Deleting this bus will also remove all associated stations.
                </p>
              </div>
            )}
            
            <p className="text-sm text-gray-600">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete Bus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
