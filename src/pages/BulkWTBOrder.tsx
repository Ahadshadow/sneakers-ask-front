import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Truck, Users, ArrowLeft, Check, ChevronsUpDown, ShoppingCart, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Product, WTBPurchase } from "@/components/dashboard/sections/ProductsOverview/types";

// Mock data - same as in BulkWTBModal
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

export default function BulkWTBOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get cart items from sessionStorage or URL params
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [selectedSeller, setSelectedSeller] = useState("");
  const [payoutPrices, setPayoutPrices] = useState<{[key: string]: string}>({});
  const [vatTreatments, setVatTreatments] = useState<{[key: string]: string}>({});
  const [selectedShipping, setSelectedShipping] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // In a real app, you might get cart items from a global state or API
    // For now, we'll use sessionStorage to persist cart between pages
    const savedCart = sessionStorage.getItem('wtb-cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartItems(cart);
    } else {
      toast.error("No items in cart");
      navigate(-1);
    }
  }, [navigate]);

  const calculateRegularVatPayout = (productId: string, sellerName: string) => {
    const seller = availableSellers.find(s => s.name === sellerName);
    const product = cartItems.find(p => p.id === productId);
    
    if (seller && product) {
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
    cartItems.forEach(product => {
      if (vatTreatments[product.id] === "regular") {
        calculateRegularVatPayout(product.id, sellerName);
      }
    });
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

  const handleRemoveFromCart = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCart);
    
    // Update sessionStorage
    sessionStorage.setItem('wtb-cart', JSON.stringify(updatedCart));
    
    // Remove related state
    setPayoutPrices(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
    setVatTreatments(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });

    if (updatedCart.length === 0) {
      toast.error("Cart is empty");
      navigate(-1);
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

  const handlePurchase = () => {
    if (!selectedSeller || !selectedShipping) {
      toast.error("Please fill in all required fields");
      return;
    }

    const shippingOption = shippingOptions.find(option => option.id === selectedShipping);
    if (!shippingOption) return;

    // Check if all products have payout prices and VAT treatments
    const allProductsHavePayout = cartItems.every(product => 
      payoutPrices[product.id] && parseFloat(payoutPrices[product.id]) > 0
    );
    const allProductsHaveVat = cartItems.every(product => vatTreatments[product.id]);
    
    if (!allProductsHavePayout || !allProductsHaveVat) {
      toast.error("Please complete all product configurations");
      return;
    }

    if (shippingOption.requiresUpload && !uploadedFile) {
      toast.error("Please upload a shipment label");
      return;
    }
    
    // Clear cart and navigate back
    sessionStorage.removeItem('wtb-cart');
    toast.success(`Bulk WTB order created for ${cartItems.length} items`);
    navigate(-1);
  };

  const selectedShippingOption = shippingOptions.find(option => option.id === selectedShipping);
  const allProductsHavePayout = cartItems.every(product => 
    payoutPrices[product.id] && parseFloat(payoutPrices[product.id]) > 0
  );
  const allProductsHaveVat = cartItems.every(product => vatTreatments[product.id]);
  const canSubmit = selectedSeller && selectedShipping && allProductsHavePayout && allProductsHaveVat &&
    (!selectedShippingOption?.requiresUpload || uploadedFile);

  const totalPayout = Object.values(payoutPrices).reduce((sum, price) => 
    sum + (parseFloat(price) || 0), 0
  );
  const totalWithVat = calculateTotalWithVat();

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Bulk WTB Order ({cartItems.length} items)
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Select Seller */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Select Seller
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-12"
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
            </CardContent>
          </Card>

          {/* Cart Items */}
          {selectedSeller && (
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
                          onClick={() => handleRemoveFromCart(product.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* VAT & Payout */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* VAT Treatment */}
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

                        {/* Payout */}
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
                <div className="bg-muted/30 rounded-lg p-4">
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
              </CardContent>
            </Card>
          )}

          {/* Shipping Method */}
          {selectedSeller && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Shipping Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                  {shippingOptions.map((option) => (
                    <div key={option.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="font-medium cursor-pointer">
                          {option.name}
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>

                {selectedShipping === "upload" && (
                  <div className="space-y-3 mt-4">
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
                      <p className="text-sm text-green-600">
                        ✓ File uploaded: {uploadedFile.name}
                      </p>
                    )}
                    {selectedShipping === "upload" && !uploadedFile && (
                      <p className="text-sm text-red-600">
                        Please upload a PDF shipment label to continue
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {selectedSeller && (
            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePurchase}
                disabled={!canSubmit}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Purchase All ({cartItems.length} items)
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}