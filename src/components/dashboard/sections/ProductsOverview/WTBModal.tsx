import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Product, WTBPurchase } from "./types";
import { Truck, CreditCard, Package, CheckCircle } from "lucide-react";

interface WTBModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onPurchase: (purchase: Omit<WTBPurchase, "id">) => void;
}

export function WTBModal({ isOpen, onClose, product, onPurchase }: WTBModalProps) {
  const [selectedPayout, setSelectedPayout] = useState("");
  const [customPayout, setCustomPayout] = useState("");
  const [shippingMethod, setShippingMethod] = useState("");

  if (!product) return null;

  const payoutOptions = [
    { value: "100", label: "$100.00" },
    { value: "120", label: "$120.00" },
    { value: "150", label: "$150.00" },
    { value: "custom", label: "Custom Amount" }
  ];

  const shippingOptions = [
    { value: "standard", label: "Standard Shipping (5-7 days)", price: "$9.99" },
    { value: "express", label: "Express Shipping (2-3 days)", price: "$19.99" },
    { value: "overnight", label: "Overnight Shipping (1 day)", price: "$39.99" }
  ];

  const handlePurchase = () => {
    if (!selectedPayout || !shippingMethod) return;

    const payoutAmount = selectedPayout === "custom" ? customPayout : selectedPayout;
    
    const purchase: Omit<WTBPurchase, "id"> = {
      productId: product.id,
      product: { ...product, status: "bought" },
      payout: `$${payoutAmount}.00`,
      shippingMethod,
      purchaseDate: new Date().toISOString().split('T')[0],
      status: "processing"
    };

    onPurchase(purchase);
    onClose();
    
    // Reset form
    setSelectedPayout("");
    setCustomPayout("");
    setShippingMethod("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5 text-primary" />
            Want to Buy - {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <Card className="bg-muted/20">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                <p className="text-sm text-muted-foreground">Seller: {product.seller}</p>
                <p className="text-lg font-semibold text-primary">Listed at: {product.price}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payout Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <CreditCard className="h-4 w-4" />
              Select Your Payout Offer
            </Label>
            <Select value={selectedPayout} onValueChange={setSelectedPayout}>
              <SelectTrigger>
                <SelectValue placeholder="Choose payout amount" />
              </SelectTrigger>
              <SelectContent>
                {payoutOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedPayout === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-amount">Custom Amount</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={customPayout}
                  onChange={(e) => setCustomPayout(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Shipping Method */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Truck className="h-4 w-4" />
              Shipping Method
            </Label>
            <div className="space-y-2">
              {shippingOptions.map((option) => (
                <Card 
                  key={option.value}
                  className={`cursor-pointer transition-colors ${
                    shippingMethod === option.value 
                      ? "border-primary bg-primary/5" 
                      : "hover:bg-muted/20"
                  }`}
                  onClick={() => setShippingMethod(option.value)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          shippingMethod === option.value 
                            ? "border-primary bg-primary" 
                            : "border-muted-foreground"
                        }`}>
                          {shippingMethod === option.value && (
                            <CheckCircle className="h-2.5 w-2.5 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{option.label}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-primary">{option.price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase}
              disabled={!selectedPayout || !shippingMethod || (selectedPayout === "custom" && !customPayout)}
              className="flex-1"
            >
              Confirm Purchase
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}