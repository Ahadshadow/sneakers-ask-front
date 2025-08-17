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

// Mock sellers with country and VAT info - in real app this would come from API
const availableSellers = [
  { name: "Premium Sneakers Co", country: "Netherlands", vatRate: 0.21 },
  { name: "SoleSupreme", country: "Germany", vatRate: 0.19 }, 
  { name: "KicksCentral", country: "France", vatRate: 0.20 },
  { name: "UrbanSole", country: "Belgium", vatRate: 0.21 },
  { name: "EliteFootwear", country: "Italy", vatRate: 0.22 }
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

    // Auto-calculate payout for Regular VAT
    if (value === "regular" && selectedSeller) {
      const seller = availableSellers.find(s => s.name === selectedSeller);
      const product = products.find(p => p.id === productId);
      
      if (seller && product) {
        // Remove VAT from listed price to get payout
        const listedPrice = parseFloat(product.price.replace('$', ''));
        const payoutPrice = listedPrice / (1 + seller.vatRate);
        
        setPayoutPrices(prev => ({
          ...prev,
          [productId]: payoutPrice.toFixed(2)
        }));
      }
    }
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Cart Items</Label>
              <Badge variant="outline" className="text-sm">
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </Badge>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {products.map((product) => (
                <div key={product.id} className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all duration-200">
                  {/* Product Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-base leading-tight">{product.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                          SKU: {product.sku}
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          Listed: {product.price}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFromCart(product.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* VAT Treatment & Payout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* VAT Treatment */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">VAT Treatment</Label>
                      <div className="grid gap-2">
                        {vatOptions.map(option => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleVatChange(product.id, option.id)}
                            className={`relative text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                              vatTreatments[product.id] === option.id
                                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                : 'border-border bg-background hover:border-primary/30 hover:bg-muted/20'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-4 w-4 rounded-full border-2 transition-colors ${
                                  vatTreatments[product.id] === option.id
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground'
                                }`}
                              >
                                {vatTreatments[product.id] === option.id && (
                                  <div className="h-full w-full rounded-full bg-primary-foreground scale-50" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm text-foreground">{option.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {option.id === 'regular' ? 'Standard VAT applied' : 'Second-hand goods'}
                                </div>
                              </div>
                            </div>
                            {vatTreatments[product.id] === option.id && option.id === 'regular' && selectedSeller && (
                              <div className="mt-2 pt-2 border-t border-primary/20">
                                <div className="text-xs text-primary font-medium">
                                  Auto-calculated based on {availableSellers.find(s => s.name === selectedSeller)?.country} VAT rate
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payout */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Seller Payout</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={payoutPrices[product.id] || ""}
                          onChange={(e) => handlePayoutChange(product.id, e.target.value)}
                          className={`text-right font-mono text-lg ${
                            vatTreatments[product.id] === 'regular' 
                              ? 'bg-muted/30 border-primary/30' 
                              : 'bg-background'
                          }`}
                          min="0"
                          step="0.01"
                          readOnly={vatTreatments[product.id] === 'regular'}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </div>
                        {vatTreatments[product.id] === 'regular' && (
                          <div className="absolute right-10 top-1/2 -translate-y-1/2">
                            <Badge variant="secondary" className="text-xs">
                              Auto
                            </Badge>
                          </div>
                        )}
                      </div>
                      {vatTreatments[product.id] === 'regular' && (
                        <p className="text-xs text-muted-foreground">
                          Automatically calculated excluding VAT
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total Summary */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-foreground">Total Payout</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sum of all seller payouts
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-lg font-mono px-3 py-1">
                    ${totalPayout.toFixed(2)}
                  </Badge>
                </div>
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
                  <SelectItem key={seller.name} value={seller.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{seller.name}</span>
                      <span className="text-xs text-muted-foreground">{seller.country} • VAT: {(seller.vatRate * 100).toFixed(0)}%</span>
                    </div>
                  </SelectItem>
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