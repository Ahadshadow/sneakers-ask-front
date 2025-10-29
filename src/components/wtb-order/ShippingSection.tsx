import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Truck, Package, Upload } from "lucide-react";
import { SendCloudModal } from "./SendCloudModal";

interface ShippingSectionProps {
  paymentTiming: string;
  onPaymentTimingChange: (value: string) => void;
  selectedShipping: string;
  onShippingChange: (value: string) => void;
  uploadedFile: File | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploadingFile?: boolean;
  customerCountryCode?: string;
  orderItem?: any; // Order line item for SendCloud
  onSendCloudLabelCreated?: (labelData: any) => void;
  sellerShipmentMethodCode?: string | null;
}


export function ShippingSection({ 
  paymentTiming, 
  onPaymentTimingChange,
  selectedShipping,
  onShippingChange,
  uploadedFile,
  onFileUpload,
  isUploadingFile = false,
  customerCountryCode,
  orderItem,
  onSendCloudLabelCreated,
  sellerShipmentMethodCode
}: ShippingSectionProps) {

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Payment Timing */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Timing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {["before-shipping", "after-delivery"].map((timing) => (
              <div 
                key={timing}
                className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => onPaymentTimingChange(timing)}
              >
                <div className="relative">
                  <div className="h-5 w-5 border-2 border-border rounded flex items-center justify-center">
                    {paymentTiming === timing && (
                      <div className="h-3 w-3 bg-primary rounded-sm" />
                    )}
                  </div>
                </div>
                <Label className="font-medium cursor-pointer">
                  {timing === "before-shipping" ? "Before Shipping" : "After Delivery"}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Choose when the seller receives payment
          </p>
        </CardContent>
      </Card>

      {/* Shipping Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Shipping Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={selectedShipping} onValueChange={onShippingChange}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border border-border rounded-lg bg-muted/20">
                <RadioGroupItem value="upload" id="upload" />
                <Label htmlFor="upload" className="font-medium text-foreground cursor-pointer flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Shipment Label
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-border rounded-lg bg-muted/20">
                <RadioGroupItem value="sendcloud" id="sendcloud" />
                <Label htmlFor="sendcloud" className="font-medium text-foreground cursor-pointer flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  SendCloud Shipment Label
                </Label>
              </div>
            </div>
          </RadioGroup>
          <p className="text-sm text-muted-foreground">
            {selectedShipping === "upload" 
              ? "Upload a PDF or image shipment label for this order"
              : "Create a SendCloud shipment label for this order"
            }
          </p>

          {selectedShipping === "upload" && (
            <div className="space-y-3">
              <Label htmlFor="shipment-file" className="text-sm font-medium">
                Upload Shipment Label (PDF or Image)
              </Label>
              <Input
                id="shipment-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                onChange={onFileUpload}
                className="cursor-pointer"
                disabled={isUploadingFile}
              />
              {isUploadingFile ? (
                <p className="text-xs text-blue-600">
                  ⏳ Uploading file...
                </p>
              ) : uploadedFile ? (
                <p className="text-xs text-green-600">
                  ✓ File ready: {uploadedFile.name}
                </p>
              ) : (
                <p className="text-xs text-red-600">
                  Please upload a PDF shipment label to continue
                </p>
              )}
            </div>
          )}

          {selectedShipping === "sendcloud" && customerCountryCode && onSendCloudLabelCreated && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Create SendCloud Label
              </Label>
              <SendCloudModal
                customerCountryCode={customerCountryCode}
                orderItem={orderItem}
                onLabelCreated={onSendCloudLabelCreated}
                defaultShipmentMethodCode={sellerShipmentMethodCode}
                orderItemStatus="sourcing"
              >
                <Button className="w-full" variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  Create SendCloud Label
                </Button>
              </SendCloudModal>
              <p className="text-xs text-muted-foreground">
                Click to create a SendCloud shipment label for this order
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}