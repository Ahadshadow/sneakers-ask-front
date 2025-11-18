import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Package, Download, Calendar, Truck, MapPin, ExternalLink, Loader2, Clock, CheckCircle, History, User, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { sendcloudApi } from "@/lib/api/sendcloud";
import { useToast } from "@/hooks/use-toast";

interface TrackingStatusHistory {
  carrier_update_timestamp: string;
  parcel_status_history_id: string;
  parent_status: string;
  carrier_code: string;
  carrier_message: string;
}

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
  current_tracking_status?: string;
  tracking_status_history?: TrackingStatusHistory[];
  last_tracking_update?: string;
  shipped_at: string;
  delivered_at: string | null;
  shipping_method_name: string;
  shipping_destination?: string;
  consignor_id?: number | null;
  consigner_name?: string | null;
  consigner_email?: string | null;
  consigner_phone?: string | null;
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
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Ready to Send</Badge>;
    case "shipped":
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Shipped</Badge>;
    case "delivered":
      return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Delivered</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const getTrackingStatusBadge = (status: string) => {
  const statusLower = status?.toLowerCase() || "";
  if (statusLower.includes("ready")) {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">{status}</Badge>;
  } else if (statusLower.includes("announcing")) {
    return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">{status}</Badge>;
  } else if (statusLower.includes("delivered")) {
    return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">{status}</Badge>;
  } else if (statusLower.includes("shipped")) {
    return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">{status}</Badge>;
  }
  return <Badge className="text-xs">{status}</Badge>;
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    {shipmentLabel.order_item_status && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Order Status: <span className="font-medium capitalize">{shipmentLabel.order_item_status}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(shipmentLabel.status)}
                    {shipmentLabel.current_tracking_status && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Current Status</p>
                        {getTrackingStatusBadge(shipmentLabel.current_tracking_status)}
                      </div>
                    )}
                  </div>
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

              {/* Delivered Date */}
              {shipmentLabel.delivered_at && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Delivered At</p>
                    <p className="text-base text-foreground">
                      {formatDate(shipmentLabel.delivered_at)}
                    </p>
                  </div>
                </div>
              )}

              {/* Last Tracking Update */}
              {shipmentLabel.last_tracking_update && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Last Tracking Update</p>
                    <p className="text-base text-foreground">
                      {formatDate(shipmentLabel.last_tracking_update)}
                    </p>
                  </div>
                </div>
              )}

              {/* Shipping Destination */}
              {shipmentLabel.shipping_destination && (
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Shipping Destination</p>
                    <p className="text-base text-foreground capitalize">
                      {shipmentLabel.shipping_destination}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Consigner Information */}
            {(shipmentLabel.consigner_name || shipmentLabel.consigner_email || shipmentLabel.consigner_phone) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-foreground">Consigner Information</h3>
                  
                  {shipmentLabel.consigner_name && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p className="text-base text-foreground">
                          {shipmentLabel.consigner_name}
                        </p>
                      </div>
                    </div>
                  )}

                  {shipmentLabel.consigner_email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-base text-foreground">
                          {shipmentLabel.consigner_email}
                        </p>
                      </div>
                    </div>
                  )}

                  {shipmentLabel.consigner_phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p className="text-base text-foreground">
                          {shipmentLabel.consigner_phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Tracking Status History */}
            {shipmentLabel.tracking_status_history && shipmentLabel.tracking_status_history.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Tracking Status History
                  </h3>
                  
                  <div className="space-y-4">
                    {shipmentLabel.tracking_status_history
                      .sort((a, b) => new Date(a.carrier_update_timestamp).getTime() - new Date(b.carrier_update_timestamp).getTime())
                      .map((historyItem, index) => (
                        <div key={historyItem.parcel_status_history_id} className="relative pl-8 border-l-2 border-muted">
                          {index < shipmentLabel.tracking_status_history!.length - 1 && (
                            <div className="absolute left-[-5px] top-6 bottom-[-16px] w-0.5 bg-muted" />
                          )}
                          <div className="absolute left-[-9px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getTrackingStatusBadge(historyItem.carrier_message || historyItem.parent_status)}
                              <span className="text-xs text-muted-foreground">
                                {formatDate(historyItem.carrier_update_timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground font-medium capitalize">
                              {historyItem.parent_status.replace(/-/g, ' ')}
                            </p>
                            {historyItem.carrier_message && historyItem.carrier_message !== historyItem.parent_status && (
                              <p className="text-xs text-muted-foreground">
                                {historyItem.carrier_message}
                              </p>
                            )}
                            {historyItem.carrier_code && (
                              <p className="text-xs text-muted-foreground font-mono">
                                Carrier Code: {historyItem.carrier_code}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}

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

