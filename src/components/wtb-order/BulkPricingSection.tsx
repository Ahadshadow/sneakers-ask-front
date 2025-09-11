import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, Upload } from "lucide-react";
import { Product } from "@/components/dashboard/sections/ProductsOverview/types";
import { PricingBreakdown } from "./PricingBreakdown";

interface BulkPricingSectionProps {
  cartItems: Product[];
  selectedSeller: string;
  payoutPrices: {[key: string]: string};
  vatTreatments: {[key: string]: string};
  vatRefundIncluded: {[key: string]: boolean};
  selectedShipping: {[key: string]: string};
  paymentTiming: {[key: string]: string};
  uploadedFile: {[key: string]: File | null};
  uploadedFileUrl?: {[key: string]: string | null};
  isUploadingFile?: {[key: string]: boolean};
  onPayoutChange: (productId: string, value: string) => void;
  onVatChange: (productId: string, value: string) => void;
  onVatRefundIncludedChange: (productId: string, checked: boolean) => void;
  onShippingChange: (productId: string, value: string) => void;
  onPaymentTimingChange: (productId: string, value: string) => void;
  onFileUpload: (productId: string, file: File | null) => void;
  onRemoveFromCart: (productId: string) => void;
  availableSellers: Array<{ 
    name: string; 
    country: string; 
    vatRate: number; 
    vatRegistered: boolean; 
    vatNumber: string | null; 
  }>;
}

const shippingOptions = [
  { id: "upload", name: "Upload shipment label", requiresUpload: true }
];

const paymentOptions = [
  { id: "before", name: "Before shipment" },
  { id: "after", name: "After shipment" }
];

export function BulkPricingSection({ 
  cartItems,
  selectedSeller, 
  payoutPrices,
  vatTreatments,
  vatRefundIncluded,
  selectedShipping,
  paymentTiming,
  uploadedFile,
  uploadedFileUrl = {},
  isUploadingFile = {},
  onPayoutChange,
  onVatChange,
  onVatRefundIncludedChange,
  onShippingChange,
  onPaymentTimingChange,
  onFileUpload,
  onRemoveFromCart,
  availableSellers
}: BulkPricingSectionProps) {
  // Check if selected seller is eligible for VAT refund
  const selectedSellerData = availableSellers.find(s => s.name === selectedSeller);
  const isVatRefundEligible = selectedSellerData?.vatRegistered && selectedSellerData?.vatNumber;
  const calculateTotalWithVat = () => {
    const seller = availableSellers.find(s => s.name === selectedSeller);
    if (!seller) return 0;

    return cartItems.reduce((total, product) => {
      const payoutAmount = parseFloat(payoutPrices[product.id]) || 0;
      const vatTreatment = vatTreatments[product.id];
      
      if (vatTreatment === 'regular') {
        return total + (payoutAmount * (1 + seller.vatRate));
      } else {
        return total + payoutAmount;
      }
    }, 0);
  };

  const totalPayout = Object.values(payoutPrices).reduce((sum, price) => 
    sum + (parseFloat(price) || 0), 0
  );
  const totalWithVat = calculateTotalWithVat();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cart Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {cartItems.map((product) => (
            <div key={product.id} className="bg-muted/20 border border-border rounded-lg p-4">
              {/* Product Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground">{product.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                      {product.sku}
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {product.price}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFromCart(product.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* VAT & Payout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* VAT Treatment */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">VAT Treatment</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onVatChange(product.id, 'regular')}
                      className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                        vatTreatments[product.id] === 'regular'
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:bg-muted'
                      }`}
                    >
                      Regular VAT
                    </button>
                    <button
                      type="button"
                      onClick={() => onVatChange(product.id, 'margin')}
                      className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                        vatTreatments[product.id] === 'margin'
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:bg-muted'
                      }`}
                    >
                      Margin Scheme
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {vatTreatments[product.id] === 'regular' && 
                      "Standard VAT treatment - seller pays VAT to authorities"
                    }
                    {vatTreatments[product.id] === 'margin' && 
                      "For second-hand goods - VAT only on profit margin"
                    }
                  </div>
                </div>

                {/* Payout */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Seller Payout Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      €
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={payoutPrices[product.id] || ""}
                      onChange={(e) => onPayoutChange(product.id, e.target.value)}
                      className="pl-7 text-right [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`vat-refund-included-${product.id}`}
                        checked={vatRefundIncluded[product.id] || false}
                        onCheckedChange={(checked) => onVatRefundIncludedChange(product.id, checked as boolean)}
                        disabled={!isVatRefundEligible}
                      />
                      <label
                        htmlFor={`vat-refund-included-${product.id}`}
                        className={`text-xs font-medium leading-none ${
                          !isVatRefundEligible 
                            ? 'text-muted-foreground cursor-not-allowed' 
                            : 'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        }`}
                      >
                        VAT Refund Included
                        {!isVatRefundEligible && (
                          <span className="text-xs text-muted-foreground block">
                            (Seller must be VAT registered)
                          </span>
                        )}
                      </label>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Net amount the seller receives
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Method Card */}
              <div className="mt-4">
                <Card className="bg-muted/10 border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Shipping Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup value={selectedShipping[product.id] || "upload"} onValueChange={(value) => onShippingChange(product.id, value)}>
                      <div className="flex items-center space-x-3 p-3 border border-border rounded-lg bg-muted/20">
                        <RadioGroupItem value="upload" id={`upload-${product.id}`} defaultChecked />
                        <Label htmlFor={`upload-${product.id}`} className="text-sm font-medium text-foreground cursor-pointer">
                          Upload Shipment Label
                        </Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">
                      Upload a PDF or image shipment label for this order
                    </p>

                    {/* File Upload - Always visible */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Shipment Label</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                          onChange={(e) => onFileUpload(product.id, e.target.files?.[0] || null)}
                          className="flex-1"
                        />
                        {isUploadingFile[product.id] ? (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Upload className="h-3 w-3 animate-spin" />
                            Uploading...
                          </div>
                        ) : uploadedFile[product.id] ? (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Upload className="h-3 w-3" />
                            Ready
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            Required
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Individual Product Breakdown */}
              {vatTreatments[product.id] && (
                <div className="mt-4">
                  <PricingBreakdown
                    product={product}
                    selectedSeller={selectedSeller}
                    vatTreatment={vatTreatments[product.id]}
                    payoutPrice={payoutPrices[product.id]}
                    vatRefundIncluded={vatRefundIncluded[product.id] || false}
                    availableSellers={availableSellers}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Total Summary */}
        <div className="bg-muted/30 rounded-lg p-4 border">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Seller Payout:</span>
              <span className="text-lg font-semibold text-primary">€{totalPayout.toFixed(2)}</span>
            </div>
            {selectedSeller && totalWithVat !== totalPayout && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Total with VAT ({availableSellers.find(s => s.name === selectedSeller)?.country}):
                </span>
                <span className="font-medium">€{totalWithVat.toFixed(2)}</span>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              💡 Review individual breakdowns above for detailed VAT calculations
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}