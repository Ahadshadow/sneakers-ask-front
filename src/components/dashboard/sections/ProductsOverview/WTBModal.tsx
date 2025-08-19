import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Product, WTBPurchase } from "./types";
import { Truck, CreditCard, Package, X, Users } from "lucide-react";

interface WTBModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onPurchase: (purchase: Omit<WTBPurchase, "id">) => void;
}

// Mock sellers - in real app this would come from API
const availableSellers = [
  "Premium Sneakers Co",
  "SoleSupreme", 
  "KicksCentral",
  "UrbanSole",
  "EliteFootwear"
];

const shippingOptions = [
  { id: "discord", name: "Shipper Discord", requiresUpload: false },
  { id: "upload", name: "Upload shipment label", requiresUpload: true }
];

const vatOptions = [
  { id: "regular", name: "Regular VAT", description: "Standard VAT treatment" },
  { id: "margin", name: "Margin Scheme", description: "For second-hand goods" }
];

export function WTBModal({ isOpen, onClose, product, onPurchase }: WTBModalProps) {
  const [selectedSeller, setSelectedSeller] = useState("");
  const [payoutPrice, setPayoutPrice] = useState("");
  const [vatTreatment, setVatTreatment] = useState("");
  const [selectedShipping, setSelectedShipping] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleClose = () => {
    setSelectedSeller("");
    setPayoutPrice("");
    setVatTreatment("");
    setSelectedShipping("");
    setUploadedFile(null);
    onClose();
  };

  const handlePurchase = () => {
    if (!product || !selectedSeller || !payoutPrice || !vatTreatment || !selectedShipping) return;

    const shippingOption = shippingOptions.find(option => option.id === selectedShipping);
    if (!shippingOption) return;

    // If upload is required, check if file is uploaded
    if (shippingOption.requiresUpload && !uploadedFile) return;
    
    const purchase: Omit<WTBPurchase, "id"> = {
      product: {
        name: product.name,
        sku: product.sku
      },
      seller: selectedSeller,
      payoutPrice: parseFloat(payoutPrice),
      shippingMethod: shippingOption.name,
      purchaseDate: new Date().toISOString().split('T')[0],
      status: "processing"
    };

    onPurchase(purchase);
    handleClose();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
    } else {
      // Show error message or reset
      setUploadedFile(null);
    }
  };

  if (!product) return null;

  const selectedShippingOption = shippingOptions.find(option => option.id === selectedShipping);
  const canSubmit = selectedSeller && payoutPrice && parseFloat(payoutPrice) > 0 && vatTreatment && selectedShipping && 
    (!selectedShippingOption?.requiresUpload || uploadedFile);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5 text-primary" />
            Want to Buy - {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <Card className="bg-muted/20 border border-border">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                <p className="text-lg font-semibold text-primary">Listed at: {product.price}</p>
              </div>
            </CardContent>
          </Card>

          {/* Select Seller */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Users className="h-4 w-4 text-primary" />
              Select Seller
            </Label>
            <Select value={selectedSeller} onValueChange={setSelectedSeller}>
              <SelectTrigger className="w-full border-border">
                <SelectValue placeholder="Choose seller" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border">
                {availableSellers.map(seller => (
                  <SelectItem key={seller} value={seller}>{seller}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* VAT Treatment */}
          <div className="space-y-3">
            <Label className="text-base font-medium">VAT Treatment</Label>
            <div className="grid gap-3">
              {vatOptions.map(option => (
                <div
                  key={option.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    vatTreatment === option.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border bg-background hover:border-primary/50 hover:bg-muted/20'
                  }`}
                  onClick={() => setVatTreatment(option.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-4 w-4 rounded-full border-2 transition-colors ${
                            vatTreatment === option.id
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          }`}
                        >
                          {vatTreatment === option.id && (
                            <div className="h-full w-full rounded-full bg-primary-foreground scale-50" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{option.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                        </div>
                      </div>
                    </div>
                    {vatTreatment === option.id && (
                      <div className="ml-2">
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payout Price */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <CreditCard className="h-4 w-4 text-primary" />
              Seller Payout Price
            </Label>
            <Input
              type="number"
              placeholder="Enter payout amount"
              value={payoutPrice}
              onChange={(e) => setPayoutPrice(e.target.value)}
              className="w-full border-border"
              min="0"
              step="0.01"
            />
            
            {/* Pricing Explanation */}
            {vatTreatment && (
              <div className="bg-muted/20 p-3 rounded-lg border space-y-2">
                <h5 className="text-sm font-medium text-foreground">Pricing Guide</h5>
                {vatTreatment === 'regular' ? (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Regular VAT:</strong> Seller pays VAT to authorities</p>
                    <p>• You can reclaim input VAT (if VAT registered)</p>
                    <p>• Higher admin burden but potentially better cash flow</p>
                  </div>
                ) : vatTreatment === 'margin' ? (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Margin Scheme:</strong> VAT only on your profit margin</p>
                    <p>• Lower VAT liability but no input VAT reclaim</p>
                    <p>• Simpler administration for second-hand goods</p>
                  </div>
                ) : null}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> The payout price affects your profit margin and VAT obligations. Consider your VAT registration status when choosing treatment.
            </p>
          </div>

          {/* Shipping Method */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Truck className="h-4 w-4 text-primary" />
              Shipping Method
            </Label>
            <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
              {shippingOptions.map((option) => (
                <div key={option.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="font-medium cursor-pointer">
                      {option.name}
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>

            {/* File Upload for Shipment Label */}
            {selectedShipping === "upload" && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="shipment-file" className="text-sm font-medium">
                  Upload Shipment Label (PDF)
                </Label>
                <Input
                  id="shipment-file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                {uploadedFile && (
                  <p className="text-xs text-green-600">
                    ✓ File uploaded: {uploadedFile.name}
                  </p>
                )}
                {selectedShipping === "upload" && !uploadedFile && (
                  <p className="text-xs text-red-600">
                    Please upload a PDF shipment label to continue
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase}
              disabled={!canSubmit}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Confirm Purchase
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}