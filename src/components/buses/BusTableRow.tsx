
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Users, QrCode } from 'lucide-react';
import { IBus } from '@/types';
import BusQRCode from './BusQRCode';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BusTableRowProps {
  bus: IBus;
  onEdit: (bus: IBus) => void;
  onDelete: (id: string) => Promise<void>;
}

const BusTableRow: React.FC<BusTableRowProps> = ({ 
  bus, 
  onEdit, 
  onDelete
}) => {
  const [showQR, setShowQR] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(bus._id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting bus:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const routeDisplay = typeof bus.route === 'object' && bus.route 
    ? `${bus.route.start} → ${bus.route.end}`
    : 'No route assigned';

  return (
    <>
      <TableRow className="hover:bg-gray-50 transition-colors">
        <TableCell className="font-medium text-gray-900">{bus.name}</TableCell>
        <TableCell>
          <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
            {routeDisplay}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            <span className="font-medium">{bus.capacity}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQR(true)}
              className="hover:bg-blue-50 border-blue-200 text-blue-700"
            >
              <QrCode className="h-4 w-4 mr-1" />
              QR
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(bus)}
              className="hover:bg-yellow-50 border-yellow-200 text-yellow-700"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-red-50 border-red-200 text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Bus</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete bus "{bus.name}"? This action cannot be undone.
                    All associated data including stations and tickets will be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? "Deleting..." : "Delete Bus"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bus QR Code</DialogTitle>
          </DialogHeader>
          <BusQRCode bus={bus} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BusTableRow;
