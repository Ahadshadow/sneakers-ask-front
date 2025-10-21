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
  sendcloudApi,
  SendCloudSenderAddress,
  SendCloudShippingOption,
} from "@/lib/api/sendcloud";

interface SendCloudModalProps {
  customerCountryCode: string;
  orderItem: any; // product/order line item from WTB flows
  onLabelCreated: (labelData: any) => void;
  children: React.ReactNode;
}

export function SendCloudModal({
  customerCountryCode,
  orderItem,
  onLabelCreated,
  children,
}: SendCloudModalProps) {
  console.log("orderItem", orderItem);

  const [selectedSenderId, setSelectedSenderId] = useState<string>("");
  const [selectedShippingOptionCode, setSelectedShippingOptionCode] =
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

  // Fetch shipping options when sender is selected
  const {
    data: shippingOptions,
    isLoading: isLoadingShipping,
    error: shippingError,
  } = useQuery({
    queryKey: [
      "sendcloud-shipping-options",
      selectedSenderId,
      customerCountryCode,
    ],
    queryFn: async () => {
      if (!selectedSenderId || !customerCountryCode) return [];

      // Filter NL addresses first
      const filteredAddresses = senderAddresses?.filter(
        (addr) => addr.country_code === "NL"
      ) || [];
      
      const selectedSender = filteredAddresses?.[parseInt(selectedSenderId)];
      if (!selectedSender) return [];

      const request = {
        from_country_code: selectedSender.country_code,
        to_country_code: customerCountryCode,
        parcels: [sendcloudApi.getDefaultParcel()],
      };

      return await sendcloudApi.getShippingOptions(request);
    },
    enabled: !!selectedSenderId && !!customerCountryCode && isOpen,
  });

  // Filter sender addresses to only show NL (Netherlands) ones
  const filteredSenderAddresses = senderAddresses?.filter(
    (addr) => addr.country_code === "NL"
  ) || [];

  // Auto-select default sender address when modal opens and data is loaded
  useEffect(() => {
    if (!isOpen) return;
    if (!filteredSenderAddresses || filteredSenderAddresses.length === 0) return;
    if (selectedSenderId) return;

    // Find the default NL sender with most details
    const defaultIndex = filteredSenderAddresses.findIndex((addr) =>
      addr.company_name === "Candy Wormer" &&
      addr.postal_code === "1531 DT" &&
      addr.country_code === "NL"
    );

    if (defaultIndex !== -1) {
      setSelectedSenderId(defaultIndex.toString());
    } else {
      // Fallback to first NL address if specific default not found
      setSelectedSenderId("0");
    }
  }, [isOpen, filteredSenderAddresses, selectedSenderId]);

  const handleCreateLabel = async () => {
    if (!selectedSenderId || !selectedShippingOptionCode) {
      toast.error("Please select both sender and shipping option");
      return;
    }

    try {
      setIsCreatingLabel(true);

      const selectedSender = filteredSenderAddresses?.[parseInt(selectedSenderId)];
      const selectedShippingOption = shippingOptions?.find(
        (option) => option.code === selectedShippingOptionCode
      );

      if (!selectedSender || !selectedShippingOption) {
        throw new Error("Selected sender or shipping option not found");
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
      const shipmentData = {
        request_label: true,
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
          name: selectedSender.name,
          company_name: selectedSender.company_name,
          address_line_1: selectedSender.address_line_1,
          house_number: selectedSender.house_number,
          address_line_2: selectedSender.address_line_2,
          postal_code: selectedSender.postal_code,
          city: selectedSender.city,
          country_code: selectedSender.country_code,
          email: selectedSender.email,
          phone_number: selectedSender.phone_number,
          po_box: selectedSender.po_box ?? undefined,
        },
        ship_with: {
          type: "shipping_option_code",
          properties: {
            shipping_option_code: selectedShippingOption.code,
            contract_id: selectedShippingOption.contract?.id,
          },
        },

        //  ship_with: {
        //   type: "shipping_option_code",
        //   properties: {
        //     shipping_option_code: "unstamped_letter",
        //     contract_id: "unstamped_letter",
        //   },
        // },

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

      const labelData = await sendcloudApi.createShipmentLabel(shipmentData);

      console.log("labelData asdasd" , labelData);

      // Backend now returns the same structure as upload-file API response
      // Pass it through so the main flow can reuse the tracking section
      onLabelCreated(labelData);

      toast.success("SendCloud label created successfully!");
      setIsOpen(false);

      // Reset form
      setSelectedSenderId("");
      setSelectedShippingOptionCode("");
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
    selectedSenderId && selectedShippingOptionCode && !isCreatingLabel;

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
                            {address.house_number}, {address.address_line_1},{" "}
                            {address.city}, {address.postal_code}, {address.country_code}
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

          {/* Shipping Options */}
          {selectedSenderId && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Shipping Option</Label>
              {isLoadingShipping ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading shipping options...
                </div>
              ) : shippingError ? (
                <div className="text-sm text-destructive">
                  Error loading shipping options: {shippingError.message}
                </div>
              ) : shippingOptions && shippingOptions.length > 0 ? (
                <Select
                  value={selectedShippingOptionCode}
                  onValueChange={setSelectedShippingOptionCode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shipping option" />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingOptions.map((option) => (
                      <SelectItem key={option.code} value={option.code}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            <span>{option.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({option.carrier?.name} • {option.product?.name})
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No shipping options available for the selected sender and
                  destination.
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
