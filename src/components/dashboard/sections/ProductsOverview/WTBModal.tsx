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

export function WTBModal({ isOpen, onClose, product, onPurchase }: WTBModalProps) {
  const [selectedSeller, setSelectedSeller] = useState("");
  const [payoutPrice, setPayoutPrice] = useState("");
  const [selectedShipping, setSelectedShipping] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleClose = () => {
    setSelectedSeller("");
    setPayoutPrice("");
    setSelectedShipping("");
    setUploadedFile(null);
    onClose();
  };

  const handlePurchase = () => {
    if (!product || !selectedSeller || !payoutPrice || !selectedShipping) return;

    const shippingOption = shippingOptions.find(option => option.id === selectedShipping);
    if (!shippingOption) return;

    // If upload is required, check if file is uploaded
    if (shippingOption.requiresUpload && !uploadedFile) return;
    
    const purchase: Omit<WTBPurchase, "id"> = {
      productId: product.id,
      product: { ...product, status: "bought" },
      seller: selectedSeller,
      payoutPrice: parseFloat(payoutPrice),
      shippingMethod: shippingOption.name,
      shippingCost: 0, // No cost for these shipping methods
      purchaseDate: new Date().toISOString(),
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
  const canSubmit = selectedSeller && payoutPrice && parseFloat(payoutPrice) > 0 && selectedShipping && 
    (!selectedShippingOption?.requiresUpload || uploadedFile);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-background border border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Package className="h-5 w-5 text-primary" />
              Want to Buy - {product.name}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
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
            <p className="text-xs text-muted-foreground">
              This is the amount the seller will receive
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