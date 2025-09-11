import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Truck } from "lucide-react";

interface ShippingSectionProps {
  paymentTiming: string;
  onPaymentTimingChange: (value: string) => void;
  selectedShipping: string;
  onShippingChange: (value: string) => void;
  uploadedFile: File | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploadingFile?: boolean;
}


export function ShippingSection({ 
  paymentTiming, 
  onPaymentTimingChange,
  selectedShipping,
  onShippingChange,
  uploadedFile,
  onFileUpload,
  isUploadingFile = false
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
            <div className="flex items-center space-x-3 p-3 border border-border rounded-lg bg-muted/20">
              <RadioGroupItem value="upload" id="upload" defaultChecked />
              <Label htmlFor="upload" className="font-medium text-foreground cursor-pointer">
                Upload Shipment Label
              </Label>
            </div>
          </RadioGroup>
          <p className="text-sm text-muted-foreground">
            Upload a PDF or image shipment label for this order
          </p>

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
        </CardContent>
      </Card>
    </div>
  );
}