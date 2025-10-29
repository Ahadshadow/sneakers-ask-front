import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Package, Download, Calendar, Truck, MapPin, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { sendcloudApi } from "@/lib/api/sendcloud";
import { useToast } from "@/hooks/use-toast";

interface ShipmentLabel {
  id: number;
  order_item_id: number;
  order_item_status: string;
  shipment_id: string;
  tracking_number: string;
  tracking_url: string;
  carrier: string;
  shipping_method_id: number;
  label_url: string;
  sendcloud_label_url: string;
  status: string;
  shipped_at: string;
  delivered_at: string | null;
  shipping_method_name: string;
  to_address: {
    name: string;
    company_name: string | null;
    address_line_1: string;
    house_number: string | null;
    postal_code: string;
    city: string;
    country_code: string;
    phone_number: string;
    email: string;
  };
  from_address: {
    name: string;
    company_name: string;
    address_line_1: string;
    house_number: string;
    address_line_2: string | null;
    postal_code: string;
    city: string;
    country_code: string;
    email: string;
    phone_number: string;
    sender_address_id: number;
  };
  created_at: string;
  updated_at: string;
}

interface ViewShipmentLabelModalProps {
  orderItemId: number;
  productName: string;
  orderNumber: string;
  children: React.ReactNode;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ready_to_send":
      return <Badge className="bg-green-100 text-green-800">Ready to Send</Badge>;
    case "shipped":
      return <Badge className="bg-blue-100 text-blue-800">Shipped</Badge>;
    case "delivered":
      return <Badge className="bg-purple-100 text-purple-800">Delivered</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function ViewShipmentLabelModal({
  orderItemId,
  productName,
  orderNumber,
  children,
}: ViewShipmentLabelModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shipmentLabels, setShipmentLabels] = useState<ShipmentLabel[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && orderItemId) {
      fetchShipmentLabels();
    }
  }, [isOpen, orderItemId]);

  const fetchShipmentLabels = async () => {
    setIsLoading(true);
    try {
      const response = await sendcloudApi.getOrderItemShipmentLabels(orderItemId);
      if (response.success && response.data?.shipment_labels) {
        setShipmentLabels(response.data.shipment_labels);
      } else {
        toast({
          title: "Error",
          description: "Failed to load shipment labels",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching shipment labels:", error);
      toast({
        title: "Error",
        description: "Failed to load shipment labels",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadLabel = (labelUrl: string) => {
    window.open(labelUrl, '_blank');
  };

  const handleTrackShipment = (trackingUrl: string) => {
    window.open(trackingUrl, '_blank');
  };

  // Use the first label for display (typically there's only one)
  const shipmentLabel = shipmentLabels[0];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Shipment Label Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !shipmentLabel ? (
          <div className="text-center py-8 text-muted-foreground">
            No shipment label found
          </div>
        ) : (
          <div className="space-y-6">
            {/* Product Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{productName}</p>
                    <p className="text-sm text-muted-foreground">Order: {orderNumber}</p>
                  </div>
                  {getStatusBadge(shipmentLabel.status)}
                </div>
              </div>
            </div>

            <Separator />

            {/* Shipment Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-foreground">Shipment Information</h3>
              
              {/* Tracking Number */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Tracking Number</p>
                  <p className="text-base font-mono font-semibold text-foreground">
                    {shipmentLabel.tracking_number}
                  </p>
                </div>
              </div>

              {/* Carrier & Method */}
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Carrier & Method</p>
                  <p className="text-base font-semibold text-foreground">
                    {shipmentLabel.carrier} - {shipmentLabel.shipping_method_name}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Shipping To</p>
                  <p className="text-base text-foreground">
                    {shipmentLabel.to_address.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shipmentLabel.to_address.address_line_1}
                    {shipmentLabel.to_address.house_number && ` ${shipmentLabel.to_address.house_number}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shipmentLabel.to_address.postal_code} {shipmentLabel.to_address.city}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {shipmentLabel.to_address.country_code}
                  </p>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Label Created</p>
                  <p className="text-base text-foreground">
                    {formatDate(shipmentLabel.created_at)}
                  </p>
                </div>
              </div>

              {/* Shipped Date */}
              {shipmentLabel.shipped_at && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Shipped At</p>
                    <p className="text-base text-foreground">
                      {formatDate(shipmentLabel.shipped_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Actions</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleDownloadLabel(shipmentLabel.label_url)}
                  variant="default"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Label
                </Button>

                <Button
                  onClick={() => handleTrackShipment(shipmentLabel.tracking_url)}
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Track Shipment
                </Button>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> This shipment label has already been created. You can download the label or track the shipment.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

