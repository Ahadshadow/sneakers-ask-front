import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { productsApi } from "@/lib/api";
import { vendorsApi } from "@/lib/api/vendors";
import { Loader2 } from "lucide-react";
import { VENDORS_REQUIRING_ORDER_ID } from "@/lib/constants/vendors";
import { VendorSelect } from "./VendorSelect";

interface VendorAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderItemId: number;
  productName: string;
  onSuccess?: () => void;
  currentVendorName?: string | null;
  isReassigning?: boolean;
}

export function VendorAssignmentModal({
  open,
  onOpenChange,
  orderItemId,
  productName,
  onSuccess,
  currentVendorName,
  isReassigning = false,
}: VendorAssignmentModalProps) {
  const [vendorId, setVendorId] = useState<string>("");
  const [vendorOrderId, setVendorOrderId] = useState<string>("");
  const [vendorPrice, setVendorPrice] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch vendor details when vendorId is selected
  const { data: vendorResponse } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => vendorsApi.getVendor(parseInt(vendorId)),
    enabled: !!vendorId && vendorId !== "",
    staleTime: 5 * 60 * 1000,
  });

  const selectedVendor = vendorResponse?.data;
  const vendorName = selectedVendor?.name || "";

  // Check if current vendor requires order ID
  const requiresOrderId = vendorName && VENDORS_REQUIRING_ORDER_ID.includes(vendorName);

  // Reset form when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setVendorId("");
      setVendorOrderId("");
      setVendorPrice("");
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!vendorId) {
      toast({
        title: "Validation Error",
        description: "Please select a vendor",
        variant: "destructive",
      });
      return;
    }

    if (!vendorPrice || isNaN(parseFloat(vendorPrice)) || parseFloat(vendorPrice) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    if (requiresOrderId && !vendorOrderId.trim()) {
      toast({
        title: "Validation Error",
        description: "Order ID is required for this vendor",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await productsApi.assignVendorToOrderItem(
        orderItemId,
        parseInt(vendorId),
        parseFloat(vendorPrice),
        vendorOrderId.trim() || undefined
      );

      toast({
        title: isReassigning ? "Vendor Re-assigned" : "Vendor Assigned",
        description: `Vendor ${vendorName || 'selected vendor'} has been ${isReassigning ? 're-assigned' : 'assigned'} to ${productName}`,
      });

      handleOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign vendor",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isReassigning ? "Re-assign Vendor" : "Assign Vendor"} to {productName}
          </DialogTitle>
          <DialogDescription>
            {isReassigning 
              ? `Change the vendor assignment for this item. Current vendor: ${currentVendorName || "Unknown"}.`
              : "Assign a vendor directly to this sourcing item. Items with assigned vendors will not go through the WTB flow."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Vendor Selection */}
            <div className="space-y-2">
              <Label htmlFor="vendor-select">
                Vendor <span className="text-destructive">*</span>
              </Label>
              <VendorSelect
                value={vendorId}
                onValueChange={setVendorId}
                placeholder="Select a vendor"
                disabled={isSubmitting}
                showSecondaryInfo={true}
              />
            </div>

            {/* Vendor Order ID - Conditionally Required */}
            {vendorId && (
              <div className="space-y-2">
                <Label htmlFor="vendor-order-id">
                  Vendor Order ID
                  {requiresOrderId && <span className="text-destructive"> *</span>}
                </Label>
                <Input
                  id="vendor-order-id"
                  type="text"
                  placeholder={requiresOrderId ? "Enter order ID (required)" : "Enter order ID (optional)"}
                  value={vendorOrderId}
                  onChange={(e) => setVendorOrderId(e.target.value)}
                />
                {requiresOrderId && (
                  <p className="text-xs text-muted-foreground">
                    Order ID is required for {vendorName}
                  </p>
                )}
              </div>
            )}

            {/* Vendor Price */}
            <div className="space-y-2">
              <Label htmlFor="vendor-price">
                Vendor Price <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vendor-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={vendorPrice}
                onChange={(e) => setVendorPrice(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isReassigning ? "Re-assign Vendor" : "Assign Vendor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

