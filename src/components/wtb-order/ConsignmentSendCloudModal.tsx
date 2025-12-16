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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Package, Truck, User, Mail, Award, CheckCircle, Home, Warehouse, Phone } from "lucide-react";
import { toast } from "sonner";
import { sendcloudApi } from "@/lib/api/sendcloud";
import { consignmentApi, type ConsignerInfo, type MatchedConsignmentItem } from "@/lib/api/consignment";

interface ConsignmentSendCloudModalProps {
  customerCountryCode: string;
  orderItem: any; // product/order line item from consignment flows
  onLabelCreated: (labelData: any) => void;
  children: React.ReactNode;
}

export function ConsignmentSendCloudModal({
  customerCountryCode,
  orderItem,
  onLabelCreated,
  children,
}: ConsignmentSendCloudModalProps) {
  const [selectedSenderId, setSelectedSenderId] = useState<string>("");
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>("");
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [consignerInfo, setConsignerInfo] = useState<ConsignerInfo | null>(null);
  const [consignorId, setConsignorId] = useState<number | null>(null);
  const [matchedItem, setMatchedItem] = useState<MatchedConsignmentItem | null>(null);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [shippingDestination, setShippingDestination] = useState<string>("consumer"); // "consumer" or "warehouse"

  // Fetch sender addresses
  const {
    data: senderAddresses,
    isLoading: isLoadingSenders,
    error: sendersError,
  } = useQuery({
    queryKey: ["sendcloud-sender-addresses"],
    queryFn: () => sendcloudApi.getSenderAddresses(),
    enabled: isOpen && verificationComplete,
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
    enabled: !!selectedSenderId && !!customerCountryCode && isOpen && verificationComplete,
  });

  // Auto-select default sender address when modal opens and data is loaded
  useEffect(() => {
    if (!isOpen || !verificationComplete) return;
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
  }, [isOpen, verificationComplete, filteredSenderAddresses, selectedSenderId]);

  // Verify consigner when modal opens
  useEffect(() => {
    const verifyConsigner = async () => {
      if (!isOpen) return;
      if (verificationComplete || isVerifying) return;

      setIsVerifying(true);

      try {
        const response = await consignmentApi.verifyConsigner({
          order_number: orderItem.orderNumber,
          order_line_item_ids: orderItem.id ? [parseInt(orderItem.id)] : undefined,
        });

        if (response.success && response.matched_items && response.matched_items.length > 0) {
          // Successfully found consigner - use the consigner object
          const matchedItemData = response.matched_items[0];
          setMatchedItem(matchedItemData);
          setConsignerInfo(matchedItemData.consigner);
          setConsignorId(matchedItemData.consignor_id);
          setVerificationComplete(true);
          toast.success("Consigner verified successfully!");
        } else {
          // No consigner found
          toast.error(response.message || "No seller linked yet - no inbound orders found");
          setIsOpen(false);
        }
      } catch (error) {
        console.error("Error verifying consigner:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to verify consigner. Please try again."
        );
        setIsOpen(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyConsigner();
  }, [isOpen, verificationComplete, isVerifying, orderItem]);

  // Auto-select default shipment method (UPS Standard 0-70kg, id: 5606) for consignment
  useEffect(() => {
    if (!isOpen) return;
    if (!verificationComplete) return;
    if (!shippingMethods || shippingMethods.length === 0) return;
    if (selectedShippingMethodId) return; // Don't override user selection

    // Default shipment method: UPS Standard 0-70kg (id: 5606)
    const defaultMethod = shippingMethods.find(
      (method) => method.id === 5606 || method.name === "UPS Standard 0-70kg"
    );
    
    if (defaultMethod) {
      console.log('Auto-selecting default shipment method for consignment:', defaultMethod);
      setSelectedShippingMethodId(defaultMethod.id.toString());
    }
  }, [isOpen, verificationComplete, shippingMethods, selectedShippingMethodId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setVerificationComplete(false);
      setConsignerInfo(null);
      setConsignorId(null);
      setMatchedItem(null);
      setSelectedSenderId("");
      setSelectedShippingMethodId("");
      setIsVerifying(false);
      setShippingDestination("consumer");
    }
  }, [isOpen]);

  const handleCreateLabel = async () => {
    if (!selectedSenderId || !selectedShippingMethodId || !consignerInfo) {
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

      const parcelDefault = sendcloudApi.getDefaultParcel();
      const quantity = orderItem?.quantity || 1;
      const priceValue =
        typeof orderItem?.totalPrice === "number"
          ? orderItem.totalPrice
          : parseFloat(
              String(orderItem?.price || "0").replace(/[^\d.\-]/g, "")
            ) || 0;

      // Determine addresses based on shipping destination
      let toAddress, fromAddress;
      
      if (shippingDestination === "warehouse") {
        // Ship to warehouse: Both from and to are warehouse address
        toAddress = {
          name: selectedSender.contact_name,
          company_name: selectedSender.company_name,
          address_line_1: selectedSender.street,
          house_number: selectedSender.house_number,
          postal_code: selectedSender.postal_code,
          city: selectedSender.city,
          country_code: selectedSender.country,
          phone_number: selectedSender.telephone,
          email: selectedSender.email,
          po_box: selectedSender.postal_box || undefined,
        };
        fromAddress = {
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
        };
      } else {
        // Ship to consumer: From = warehouse, To = customer
        toAddress = {
          name: orderItem?.customerName || "",
          company_name: "",
          address_line_1: orderItem?.customerAddress?.address1 || "",
          house_number: "",
          postal_code: orderItem?.customerAddress?.zip || "",
          city: orderItem?.customerAddress?.city || "",
          country_code: orderItem?.customerAddress?.country_code || customerCountryCode,
          phone_number: orderItem?.customerAddress?.phone || orderItem?.customerPhone || "",
          email: orderItem?.customerEmail || "",
          po_box: undefined,
        };
        fromAddress = {
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
        };
      }

      // Build full shipment payload expected by backend (same as stock items)
      const shipmentData = {
        request_label: true,
        order_item_id: orderItem?.id || null,
        order_id: orderItem?.orderId || orderItem?.order_id || null,
        order_item_status: "consignment",
        // Include consigner information separately for tracking
        consignor_id: consignorId,
        consigner_name: consignerInfo?.name || "",
        consigner_email: consignerInfo?.email || "",
        consigner_phone: consignerInfo?.phoneNumber || "",
        // Include all matched item details from verify consignment
        matched_item_details: matchedItem ? matchedItem : null,
        to_address: toAddress,
        from_address: fromAddress,
        shipping_method_id: selectedShippingMethod.id,
        order_number: orderItem?.orderNumber || "",
        total_order_price: {
          currency: "EUR",
          value: priceValue,
        },
        shippingDestination,
        parcels: [
          {
            dimensions: parcelDefault.dimensions,
            weight: parcelDefault.weight,
            parcel_items: [
              {
                item_id: String(orderItem?.id || ""),
                origin_country: shippingDestination === "warehouse" 
                  ? selectedSender.country 
                  : (orderItem?.customerAddress?.country_code || customerCountryCode),
                description: orderItem?.name || "Consignment Item",
                sku: orderItem.sku || "N/A",
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
              },
            ],
          },
        ],
      };


      const labelData = await sendcloudApi.createShipmentLabel(shipmentData);

      onLabelCreated(labelData);
      toast.success("SendCloud label created successfully!");
      setIsOpen(false);

      // Reset form
      setSelectedSenderId("");
      setSelectedShippingMethodId("");
      setVerificationComplete(false);
      setConsignerInfo(null);
      setConsignorId(null);
      setMatchedItem(null);
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
    selectedSenderId && selectedShippingMethodId && !isCreatingLabel && consignerInfo;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Create Consignment Shipment Label
          </DialogTitle>
        </DialogHeader>

        {isVerifying ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying consigner details...</p>
          </div>
        ) : !verificationComplete ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <p className="text-sm text-destructive">Failed to verify consigner</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Consigner Information Display */}
            {consignerInfo && (
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 space-y-3 border border-blue-200 dark:border-blue-800">
                <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Consigner Information
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{consignerInfo.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{consignerInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tier</p>
                      <p className="font-medium capitalize">{consignerInfo.tier}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{consignerInfo.phoneNumber || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{consignerInfo.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Destination Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Shipping Destination</Label>
              <RadioGroup value={shippingDestination} onValueChange={setShippingDestination}>
                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="consumer" id="consumer" />
                  <Label htmlFor="consumer" className="flex items-center gap-2 font-medium cursor-pointer flex-1">
                    <Home className="h-4 w-4 text-primary" />
                    Ship to Consumer
                    <span className="text-xs text-muted-foreground ml-auto">
                      (Warehouse → Customer)
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="warehouse" id="warehouse" />
                  <Label htmlFor="warehouse" className="flex items-center gap-2 font-medium cursor-pointer flex-1">
                    <Warehouse className="h-4 w-4 text-primary" />
                    Ship to Warehouse
                    <span className="text-xs text-muted-foreground ml-auto">
                      (Warehouse → Warehouse)
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Sender Address Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Warehouse Location (Ship From)</Label>
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
                      <SelectValue placeholder="Select warehouse location" />
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
                    Default warehouse location is automatically selected (read-only)
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
                                {/* <span>{method.id}</span> */}
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
        )}
      </DialogContent>
    </Dialog>
  );
}

