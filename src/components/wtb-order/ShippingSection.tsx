import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Truck } from "lucide-react";

interface ShippingSectionProps {
  selectedShipping: string;
  onShippingChange: (value: string) => void;
  paymentTiming: string;
  onPaymentTimingChange: (value: string) => void;
  uploadedFile: File | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const shippingOptions = [
  { id: "discord", name: "Shipper Discord", requiresUpload: false },
  { id: "upload", name: "Upload shipment label", requiresUpload: true }
];

export function ShippingSection({ 
  selectedShipping, 
  onShippingChange, 
  paymentTiming, 
  onPaymentTimingChange,
  uploadedFile,
  onFileUpload
}: ShippingSectionProps) {
  const selectedShippingOption = shippingOptions.find(option => option.id === selectedShipping);

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
            {shippingOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="font-medium cursor-pointer">
                  {option.name}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {selectedShipping === "upload" && (
            <div className="space-y-3 mt-4">
              <Label htmlFor="shipment-file" className="text-sm font-medium">
                Upload Shipment Label (PDF)
              </Label>
              <Input
                id="shipment-file"
                type="file"
                accept=".pdf"
                onChange={onFileUpload}
                className="cursor-pointer"
              />
              {uploadedFile ? (
                <p className="text-xs text-green-600">
                  ✓ File uploaded: {uploadedFile.name}
                </p>
              ) : selectedShippingOption?.requiresUpload && (
                <p className="text-xs text-red-600">
                  Please upload a PDF shipment label to continue
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}