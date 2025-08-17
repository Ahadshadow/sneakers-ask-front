import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Truck, CreditCard, Package, Users, ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock data - same as in WTBModal
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

// Mock products data - in real app this would come from API
const mockProducts = {
  "1": {
    id: "1",
    name: "Air Jordan 1 Retro High OG",
    sku: "AJ1-RH-001",
    price: "$170.00",
    status: "open" as const
  },
  "2": {
    id: "2", 
    name: "Nike Dunk Low Panda",
    sku: "NDL-P-002",
    price: "$110.00",
    status: "open" as const
  }
};

export default function WTBOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  
  const [selectedSeller, setSelectedSeller] = useState("");
  const [payoutPrice, setPayoutPrice] = useState("");
  const [vatTreatment, setVatTreatment] = useState("");
  const [selectedShipping, setSelectedShipping] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  // Get product data
  const product = productId ? mockProducts[productId as keyof typeof mockProducts] : null;

  useEffect(() => {
    if (!product) {
      toast.error("Product not found");
      navigate(-1);
    }
  }, [product, navigate]);

  const calculateRegularVatPayout = (sellerName: string) => {
    const seller = availableSellers.find(s => s.name === sellerName);
    
    if (seller && product) {
      const listedPrice = parseFloat(product.price.replace('$', ''));
      const payoutPriceCalc = listedPrice / (1 + seller.vatRate);
      setPayoutPrice(payoutPriceCalc.toFixed(2));
    }
  };

  const handleSellerChange = (sellerName: string) => {
    setSelectedSeller(sellerName);
    setOpen(false);
    
    if (vatTreatment === "regular") {
      calculateRegularVatPayout(sellerName);
    }
  };

  const handleVatChange = (value: string) => {
    setVatTreatment(value);

    if (value === "regular" && selectedSeller) {
      calculateRegularVatPayout(selectedSeller);
    } else if (value === "margin") {
      setPayoutPrice("");
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
    if (!product || !selectedSeller || !payoutPrice || !vatTreatment || !selectedShipping) {
      toast.error("Please fill in all required fields");
      return;
    }

    const shippingOption = shippingOptions.find(option => option.id === selectedShipping);
    if (!shippingOption) return;

    if (shippingOption.requiresUpload && !uploadedFile) {
      toast.error("Please upload a shipment label");
      return;
    }
    
    // Simulate purchase process
    toast.success(`WTB order created for ${product.name}`);
    navigate(-1);
  };

  const selectedShippingOption = shippingOptions.find(option => option.id === selectedShipping);
  const canSubmit = selectedSeller && payoutPrice && parseFloat(payoutPrice) > 0 && vatTreatment && selectedShipping && 
    (!selectedShippingOption?.requiresUpload || uploadedFile);

  if (!product) {
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
              <Package className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Want to Buy - {product.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Product Info */}
          <Card className="bg-muted/20 border border-border">
            <CardHeader>
              <CardTitle className="text-xl">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <h3 className="font-semibold text-lg text-foreground">{product.name}</h3>
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
              <p className="text-xl font-bold text-primary">Listed at: {product.price}</p>
            </CardContent>
          </Card>

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
                      : "Choose seller"}
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

          {selectedSeller && (
            <>
              {/* VAT Treatment */}
              <Card>
                <CardHeader>
                  <CardTitle>VAT Treatment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {vatOptions.map(option => (
                      <div
                        key={option.id}
                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                          vatTreatment === option.id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border bg-background hover:border-primary/50 hover:bg-muted/20'
                        }`}
                        onClick={() => handleVatChange(option.id)}
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
                </CardContent>
              </Card>

              {/* Payout Price */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Seller Payout Price
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter payout amount"
                    value={payoutPrice}
                    onChange={(e) => setPayoutPrice(e.target.value)}
                    className={`text-lg h-12 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] ${
                      vatTreatment === 'regular' ? 'bg-muted/30' : ''
                    }`}
                    min="0"
                    step="0.01"
                  />
                  <p className="text-sm text-muted-foreground">
                    This is the amount the seller will receive
                  </p>
                  {vatTreatment === 'regular' && (
                    <p className="text-sm text-primary">
                      Automatically calculated excluding VAT
                    </p>
                  )}
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

              {/* Action Buttons */}
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
                  Confirm Purchase
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}