import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Product, WTBPurchase } from "./types";
import { Truck, CreditCard, Package, Users, Trash2, ShoppingCart, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);

  const calculateRegularVatPayout = (productId: string, sellerName: string) => {
    const seller = availableSellers.find(s => s.name === sellerName);
    const product = products.find(p => p.id === productId);
    
    if (seller && product) {
      // Remove VAT from listed price to get payout
      const listedPrice = parseFloat(product.price.replace('€', ''));
      const payoutPrice = listedPrice / (1 + seller.vatRate);
      
      setPayoutPrices(prev => ({
        ...prev,
        [productId]: payoutPrice.toFixed(2)
      }));
    }
  };

  const handleSellerChange = (sellerName: string) => {
    setSelectedSeller(sellerName);
    setOpen(false);
    
    // Auto-calculate payout for all products with Regular VAT
    products.forEach(product => {
      if (vatTreatments[product.id] === "regular") {
        calculateRegularVatPayout(product.id, sellerName);
      }
    });
  };

  const handleClose = () => {
    setSelectedSeller("");
    setPayoutPrices({});
    setVatTreatments({});
    setSelectedShipping("");
    setUploadedFile(null);
    setOpen(false);
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
      calculateRegularVatPayout(productId, selectedSeller);
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

  // Calculate total including VAT for the seller's country
  const calculateTotalWithVat = () => {
    const seller = availableSellers.find(s => s.name === selectedSeller);
    if (!seller) return 0;

    return products.reduce((total, product) => {
      const payoutAmount = parseFloat(payoutPrices[product.id]) || 0;
      const vatTreatment = vatTreatments[product.id];
      
      if (vatTreatment === 'regular') {
        // For regular VAT, add VAT to the payout amount
        return total + (payoutAmount * (1 + seller.vatRate));
      } else {
        // For margin scheme, just add the payout amount (no additional VAT)
        return total + payoutAmount;
      }
    }, 0);
  };

  const totalPayout = Object.values(payoutPrices).reduce((sum, price) => 
    sum + (parseFloat(price) || 0), 0
  );
  
  const totalWithVat = calculateTotalWithVat();

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
          {/* Select Seller - First Step */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Users className="h-4 w-4 text-primary" />
              Select Seller
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedSeller
                    ? availableSellers.find(seller => seller.name === selectedSeller)?.name
                    : "Choose seller for all items"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search sellers..." />
                  <CommandList>
                    <CommandEmpty>No seller found.</CommandEmpty>
                    <CommandGroup>
                      {availableSellers.map((seller) => (
                        <CommandItem
                          key={seller.name}
                          value={seller.name}
                          onSelect={(currentValue) => {
                            handleSellerChange(currentValue === selectedSeller ? "" : currentValue)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedSeller === seller.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{seller.name}</span>
                            <span className="text-xs text-muted-foreground">{seller.country} • VAT: {(seller.vatRate * 100).toFixed(0)}%</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedSeller && (
              <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
                <strong>{availableSellers.find(s => s.name === selectedSeller)?.country}</strong> VAT rate: <strong>{(availableSellers.find(s => s.name === selectedSeller)?.vatRate! * 100).toFixed(0)}%</strong>
              </div>
            )}
          </div>

          {/* Cart Items - Second Step */}
          {selectedSeller && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Cart Items</Label>
                <Badge variant="outline" className="text-sm">
                  {products.length} {products.length === 1 ? 'item' : 'items'}
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div key={product.id} className="group bg-card border border-border rounded-lg p-4">
                    {/* Product Header */}
                    <div className="flex items-start justify-between mb-3">
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

                    {/* VAT & Payout in a simple row */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* VAT Treatment - Simple Buttons */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">VAT</Label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleVatChange(product.id, 'regular')}
                            className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                              vatTreatments[product.id] === 'regular'
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background hover:bg-muted'
                            }`}
                          >
                            Regular
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVatChange(product.id, 'margin')}
                            className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                              vatTreatments[product.id] === 'margin'
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background hover:bg-muted'
                            }`}
                          >
                            Margin
                          </button>
                        </div>
                      </div>

                      {/* Payout - Simple Input */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Payout</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            €
                          </span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={payoutPrices[product.id] || ""}
                            onChange={(e) => handlePayoutChange(product.id, e.target.value)}
                            className={`pl-7 text-right [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] ${
                              vatTreatments[product.id] === 'regular' 
                                ? 'bg-muted/30' 
                                : ''
                            }`}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total Summary */}
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Total Payout</span>
                    {selectedSeller && (
                      <p className="text-xs text-muted-foreground">
                        Including {availableSellers.find(s => s.name === selectedSeller)?.country} VAT
                      </p>
                    )}
                  </div>
                  <span className="text-lg font-semibold">
                    €{selectedSeller ? totalWithVat.toFixed(2) : totalPayout.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

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