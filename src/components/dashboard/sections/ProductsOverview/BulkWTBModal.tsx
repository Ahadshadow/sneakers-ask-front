import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Product, WTBPurchase } from "./types";
import { Truck, CreditCard, Package, Users, Trash2, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BulkWTBModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemoveFromCart: (productId: string) => void;
  onPurchase: (purchases: Omit<WTBPurchase, "id">[]) => void;
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

export function BulkWTBModal({ isOpen, onClose, products, onRemoveFromCart, onPurchase }: BulkWTBModalProps) {
  const [selectedSeller, setSelectedSeller] = useState("");
  const [payoutPrices, setPayoutPrices] = useState<{[key: string]: string}>({});
  const [vatTreatments, setVatTreatments] = useState<{[key: string]: string}>({});
  const [selectedShipping, setSelectedShipping] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleClose = () => {
    setSelectedSeller("");
    setPayoutPrices({});
    setVatTreatments({});
    setSelectedShipping("");
    setUploadedFile(null);
    onClose();
  };

  const handlePayoutChange = (productId: string, value: string) => {
    setPayoutPrices(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleVatChange = (productId: string, value: string) => {
    setVatTreatments(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
    } else {
      setUploadedFile(null);
    }
  };

  const handlePurchase = () => {
    if (!selectedSeller || !selectedShipping) return;

    const shippingOption = shippingOptions.find(option => option.id === selectedShipping);
    if (!shippingOption) return;

    // Check if all products have payout prices and VAT treatments
    const allProductsHavePayout = products.every(product => 
      payoutPrices[product.id] && parseFloat(payoutPrices[product.id]) > 0
    );
    const allProductsHaveVat = products.every(product => vatTreatments[product.id]);
    if (!allProductsHavePayout || !allProductsHaveVat) return;

    // If upload is required, check if file is uploaded
    if (shippingOption.requiresUpload && !uploadedFile) return;
    
    const purchases: Omit<WTBPurchase, "id">[] = products.map(product => ({
      productId: product.id,
      product: { ...product, status: "bought" },
      seller: selectedSeller,
      payoutPrice: parseFloat(payoutPrices[product.id]),
      vatTreatment: vatTreatments[product.id],
      shippingMethod: shippingOption.name,
      shippingCost: 0,
      purchaseDate: new Date().toISOString(),
      status: "processing"
    }));

    onPurchase(purchases);
    handleClose();
  };

  const selectedShippingOption = shippingOptions.find(option => option.id === selectedShipping);
  const allProductsHavePayout = products.every(product => 
    payoutPrices[product.id] && parseFloat(payoutPrices[product.id]) > 0
  );
  const allProductsHaveVat = products.every(product => vatTreatments[product.id]);
  const canSubmit = selectedSeller && selectedShipping && allProductsHavePayout && allProductsHaveVat &&
    (!selectedShippingOption?.requiresUpload || uploadedFile);

  const totalPayout = Object.values(payoutPrices).reduce((sum, price) => 
    sum + (parseFloat(price) || 0), 0
  );

  if (products.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Bulk WTB Order ({products.length} items)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cart Items */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Cart Items</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {products.map((product) => (
                <Card key={product.id} className="bg-muted/20 border border-border">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{product.name}</h4>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        <p className="text-sm font-semibold text-primary">Listed: {product.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs">VAT Treatment</Label>
                          <Select 
                            value={vatTreatments[product.id] || ""} 
                            onValueChange={(value) => handleVatChange(product.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue placeholder="Select VAT" />
                            </SelectTrigger>
                            <SelectContent>
                              {vatOptions.map(option => (
                                <SelectItem key={option.id} value={option.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{option.name}</span>
                                    <span className="text-xs text-muted-foreground">{option.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Label className="text-xs">Payout</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={payoutPrices[product.id] || ""}
                            onChange={(e) => handlePayoutChange(product.id, e.target.value)}
                            className="w-20 h-8 text-xs"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveFromCart(product.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Total Summary */}
            <div className="bg-primary/5 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Payout:</span>
                <Badge variant="secondary" className="text-sm">
                  ${totalPayout.toFixed(2)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Select Seller */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Users className="h-4 w-4 text-primary" />
              Select Seller
            </Label>
            <Select value={selectedSeller} onValueChange={setSelectedSeller}>
              <SelectTrigger className="w-full border-border">
                <SelectValue placeholder="Choose seller for all items" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border">
                {availableSellers.map(seller => (
                  <SelectItem key={seller} value={seller}>{seller}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <Label htmlFor="bulk-shipment-file" className="text-sm font-medium">
                  Upload Shipment Label (PDF)
                </Label>
                <Input
                  id="bulk-shipment-file"
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
              Purchase All ({products.length} items)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}