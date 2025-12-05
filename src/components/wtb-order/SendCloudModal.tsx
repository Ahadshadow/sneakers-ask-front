import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Package, Truck } from "lucide-react";
import { toast } from "sonner";
import {
  sendcloudApi
} from "@/lib/api/sendcloud";

interface SendCloudModalProps {
  customerCountryCode: string;
  orderItem: any; // product/order line item from WTB flows
  onLabelCreated: (labelData: any) => void;
  children: React.ReactNode;
  defaultShipmentMethodCode?: string | null;
  orderItemStatus?: string; // Status of the order item (e.g., 'wtb', 'stock', 'consignment', 'sourcing')
  vendorName?: string | null; // Vendor name if vendor is assigned (to distinguish vendor items)
}

export function SendCloudModal({
  customerCountryCode,
  orderItem,
  onLabelCreated,
  children,
  defaultShipmentMethodCode,
  orderItemStatus,
  vendorName,
}: SendCloudModalProps) {
  console.log("orderItem", orderItem);

  const [selectedSenderId, setSelectedSenderId] = useState<string>("");
  const [selectedShippingMethodId, setSelectedShippingMethodId] =
    useState<string>("");
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch sender addresses
  const {
    data: senderAddresses,
    isLoading: isLoadingSenders,
    error: sendersError,
  } = useQuery({
    queryKey: ["sendcloud-sender-addresses"],
    queryFn: () => sendcloudApi.getSenderAddresses(),
    enabled: isOpen,
  });
  
  // Filter sender addresses to only show NL (Netherlands) ones
  const filteredSenderAddresses = senderAddresses?.filter(
    (addr) => addr.country === "NL"
  ) || [];

  // Fetch WTB shipping methods
  const {
    data: shippingMethods,
    isLoading: isLoadingShipping,
    error: shippingError,
  } = useQuery({
    queryKey: [
      "wtb-shipping-methods",
      selectedSenderId,
      customerCountryCode,
    ],
    queryFn: async () => {
      if (!selectedSenderId || !customerCountryCode) return [];
      
      const selectedSender = filteredSenderAddresses?.[parseInt(selectedSenderId)];
      if (!selectedSender) return [];
      
      return await sendcloudApi.getWTBShippingMethods(selectedSender.id, customerCountryCode);
    },
    enabled: !!selectedSenderId && !!customerCountryCode && isOpen,
  });

  // Auto-select default sender address when modal opens and data is loaded
  useEffect(() => {
    if (!isOpen) return;
    if (!filteredSenderAddresses || filteredSenderAddresses.length === 0) return;
    if (selectedSenderId) return;

    // Find the default NL sender with most details
    const defaultIndex = filteredSenderAddresses.findIndex((addr) =>
      addr.company_name === "Candy Wormer" &&
      addr.postal_code === "1531 DT" &&
      addr.country === "NL"
    );

    if (defaultIndex !== -1) {
      setSelectedSenderId(defaultIndex.toString());
    } else {
      // Fallback to first NL address if specific default not found
      setSelectedSenderId("0");
    }
  }, [isOpen, filteredSenderAddresses, selectedSenderId]);

  // Auto-select seller's preferred shipment method when shipping methods are loaded
  useEffect(() => {
    if (!isOpen) return;
    if (!defaultShipmentMethodCode) return;
    if (!shippingMethods || shippingMethods.length === 0) return;
    if (selectedShippingMethodId) return; // Don't override user selection

    // Try to match by ID (if defaultShipmentMethodCode is numeric) or by name
    const preferredMethod = shippingMethods.find(
      (method) => method.id === parseInt(defaultShipmentMethodCode) || method.name === defaultShipmentMethodCode
    );
    
    if (preferredMethod) {
      console.log('Auto-selecting seller preferred shipment method:', preferredMethod);
      setSelectedShippingMethodId(preferredMethod.id.toString());
    }
  }, [isOpen, defaultShipmentMethodCode, shippingMethods, selectedShippingMethodId]);

  // Auto-select default shipment method (UPS Standard 0-70kg, id: 5606) for consignment, vendors, and stock (not fear of god)
  useEffect(() => {
    if (!isOpen) return;
    if (!shippingMethods || shippingMethods.length === 0) return;
    if (selectedShippingMethodId) return; // Don't override user selection or seller preference
    if (defaultShipmentMethodCode) return; // Don't override if seller has a preference

    // Default shipment method: UPS Standard 0-70kg (id: 5606)
    const defaultMethod = shippingMethods.find(
      (method) => method.id === 5606 || method.name === "UPS Standard 0-70kg"
    );
    
    if (defaultMethod) {
      console.log('Auto-selecting default shipment method:', defaultMethod);
      setSelectedShippingMethodId(defaultMethod.id.toString());
    }
  }, [isOpen, shippingMethods, selectedShippingMethodId, defaultShipmentMethodCode]);

  const handleCreateLabel = async () => {

    if (!selectedSenderId || !selectedShippingMethodId) {
      toast.error("Please select both sender and shipping method");
      return;
    }

    try {
      setIsCreatingLabel(true);

      const selectedSender = filteredSenderAddresses?.[parseInt(selectedSenderId)];
      const selectedShippingMethod = shippingMethods?.find(
        (method) => method.id === parseInt(selectedShippingMethodId)
      );

      if (!selectedSender || !selectedShippingMethod) {
        throw new Error("Selected sender or shipping method not found");
      }

      // Derive customer address and pricing
      const customerAddress = orderItem?.customerAddress || {};
      const parcelDefault = sendcloudApi.getDefaultParcel();
      const quantity = orderItem?.quantity || 1;
      const priceValue =
        typeof orderItem?.totalPrice === "number"
          ? orderItem.totalPrice
          : parseFloat(
              String(orderItem?.price || "0").replace(/[^\d.\-]/g, "")
            ) || 0;

      // Build full shipment payload expected by backend
      const shipmentData: any = {
        request_label: true,
        order_item_id: orderItem?.id || null,  // Order item ID for tracking
        order_id: orderItem?.orderId || orderItem?.order_id || null,  // Shopify order ID
        order_item_status: orderItemStatus || null,  // Status: wtb, stock, consignment, sourcing, etc.
        to_address: {
          name: orderItem?.customerName || "",
          company_name: "",
          address_line_1: customerAddress.address1 || "",
          house_number: "",
          postal_code: customerAddress.zip || "",
          city: customerAddress.city || "",
          country_code: customerAddress.country_code || customerCountryCode,
          phone_number: customerAddress.phone || orderItem?.customerPhone || "",
          email: orderItem?.customerEmail || "",
          po_box: undefined,
        },
        from_address: {
          name: selectedSender.contact_name,
          company_name: selectedSender.company_name,
          address_line_1: selectedSender.street,
          house_number: selectedSender.house_number,
          address_line_2: "",
          postal_code: selectedSender.postal_code,
          city: selectedSender.city,
          country_code: selectedSender.country,
          email: selectedSender.email,
          phone_number: selectedSender.telephone,
          po_box: selectedSender.postal_box || undefined,
          sender_address_id: selectedSender.id,
        },
        shipping_method_id: selectedShippingMethod.id,

        order_number: orderItem?.orderNumber || "",
        total_order_price: {
          currency: "EUR",
          value: priceValue,
        },
        parcels: [
          {
            dimensions: parcelDefault.dimensions,
            weight: parcelDefault.weight,
            parcel_items: [
              {
                item_id: String(orderItem?.id || ""),
                origin_country:
                  customerAddress.country_code || customerCountryCode,
                description: orderItem?.name || "WTB Item",
                sku: orderItem.sku || "N/A",
                //hs_code harcoded
                hs_code: "640411",
                variant: orderItem.variant || "N/A",
                quantity,
                weight: {
                  value: parseFloat(String(parcelDefault.weight.value)),
                  unit: parcelDefault.weight.unit,
                },
                price: {
                  value: priceValue,
                  currency: "EUR",
                },
                // Optional fields omitted; backend validator marks them as sometimes
              },
            ],
          },
        ],
      };

      // Add vendor_name to payload if vendor is assigned (to distinguish vendor items from regular items)
      if (vendorName) {
        shipmentData.vendor_name = vendorName;
      }

      const labelData = await sendcloudApi.createShipmentLabel(shipmentData);

      // Backend now returns the same structure as upload-file API response
      // Pass it through so the main flow can reuse the tracking section
      onLabelCreated(labelData);

      toast.success("SendCloud label created successfully!");
      setIsOpen(false);

      // Reset form
      setSelectedSenderId("");
      setSelectedShippingMethodId("");
    } catch (error) {
      console.error("Error creating SendCloud label:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create SendCloud label"
      );
    } finally {
      setIsCreatingLabel(false);
    }
  };

  const canCreateLabel =
    selectedSenderId && selectedShippingMethodId && !isCreatingLabel;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Create SendCloud Shipment Label
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sender Address Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sender Location (NL Only)</Label>
            {isLoadingSenders ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading sender addresses...
              </div>
            ) : sendersError ? (
              <div className="text-sm text-destructive">
                Error loading sender addresses: {sendersError.message}
              </div>
            ) : (
              <>
                <Select
                  value={selectedSenderId}
                  onValueChange={setSelectedSenderId}
                  disabled={true}
                >
                  <SelectTrigger className="cursor-not-allowed opacity-75">
                    <SelectValue placeholder="Select sender location" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSenderAddresses?.map((address, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {address.company_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {address.house_number}, {address.street},{" "}
                            {address.city}, {address.postal_code}, {address.country}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Default sender location is automatically selected (read-only)
                </p>
              </>
            )}
          </div>

          {/* Shipping Methods */}
          {selectedSenderId && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Shipping Method</Label>
            {isLoadingShipping ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading shipping methods...
              </div>
            ) : shippingError ? (
              <div className="text-sm text-destructive">
                Error loading shipping methods: {shippingError.message}
              </div>
            ) : shippingMethods && shippingMethods.length > 0 ? (
              <Select
                value={selectedShippingMethodId}
                onValueChange={setSelectedShippingMethodId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shipping method" />
                </SelectTrigger>
                <SelectContent>
                  {shippingMethods.map((method) => {
                    // Find price for destination country
                    const countryPrice = method.countries.find(
                      (c) => c.iso_2 === customerCountryCode
                    );
                    return (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            <span>{method.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({method.carrier} • {method.min_weight}-{method.max_weight}kg)
                            </span>
                            {countryPrice && (
                              <span className="text-xs font-medium text-primary">
                                €{countryPrice.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground">
                No shipping methods available for the destination country.
              </div>
            )}
            </div>
          )}

          {/* Package Information */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <Label className="text-sm font-medium">Package Information</Label>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Dimensions:</span>
                <span className="ml-2 font-medium">
                  {sendcloudApi.getDefaultParcel().dimensions.length} ×{" "}
                  {sendcloudApi.getDefaultParcel().dimensions.width} ×{" "}
                  {sendcloudApi.getDefaultParcel().dimensions.height}{" "}
                  {sendcloudApi.getDefaultParcel().dimensions.unit}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Weight:</span>
                <span className="ml-2 font-medium">
                  {sendcloudApi.getDefaultParcel().weight.value}{" "}
                  {sendcloudApi.getDefaultParcel().weight.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateLabel}
              disabled={!canCreateLabel}
              className="bg-primary hover:bg-primary/90"
            >
              {isCreatingLabel ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Label...
                </>
              ) : (
                "Create Label"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
