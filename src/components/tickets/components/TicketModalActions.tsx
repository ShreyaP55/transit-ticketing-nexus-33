
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { CreditCard } from "lucide-react";

interface TicketModalActionsProps {
  isFormValid: boolean;
  isProcessing: boolean;
  hasSufficientFunds: boolean;
  price: number;
  onSubmit: () => void;
}

export const TicketModalActions: React.FC<TicketModalActionsProps> = ({
  isFormValid,
  isProcessing,
  hasSufficientFunds,
  price,
  onSubmit,
}) => {
  return (
    <DialogFooter className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-700 p-4 bg-gray-800">
      <DialogClose asChild>
        <Button variant="outline" className="w-full sm:w-auto bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
          Cancel
        </Button>
      </DialogClose>
      <Button
        onClick={onSubmit}
        disabled={!isFormValid || isProcessing || !hasSufficientFunds}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        {isProcessing ? "Processing..." : `Buy Ticket (₹${price})`}
      </Button>
    </DialogFooter>
  );
};
