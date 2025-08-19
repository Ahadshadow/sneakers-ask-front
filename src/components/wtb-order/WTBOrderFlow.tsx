import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { SellerSelection } from "./SellerSelection";
import { PricingSection } from "./PricingSection";
import { ShippingSection } from "./ShippingSection";

interface WTBOrderFlowProps {
  product: {
    id: string;
    name: string;
    sku: string;
    price: string;
    status: string;
  };
}

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

export function WTBOrderFlow({ product }: WTBOrderFlowProps) {
  const navigate = useNavigate();
  
  const [selectedSeller, setSelectedSeller] = useState("");
  const [payoutPrice, setPayoutPrice] = useState("");
  const [vatTreatment, setVatTreatment] = useState("");
  const [selectedShipping, setSelectedShipping] = useState("");
  const [paymentTiming, setPaymentTiming] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const calculateRegularVatPayout = (sellerName: string) => {
    const seller = availableSellers.find(s => s.name === sellerName);
    
    if (seller && product) {
      const listedPrice = parseFloat(product.price.replace('€', ''));
      const payoutPriceCalc = listedPrice / (1 + seller.vatRate);
      setPayoutPrice(payoutPriceCalc.toFixed(2));
    }
  };

  const handleSellerChange = (sellerName: string) => {
    setSelectedSeller(sellerName);
    
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
    if (!selectedSeller || !payoutPrice || !vatTreatment || !selectedShipping) {
      toast.error("Please fill in all required fields");
      return;
    }

    const shippingOption = shippingOptions.find(option => option.id === selectedShipping);
    if (!shippingOption) return;

    if (shippingOption.requiresUpload && !uploadedFile) {
      toast.error("Please upload a shipment label");
      return;
    }
    
    toast.success(`WTB order created for ${product.name}`);
    navigate(-1);
  };

  const selectedShippingOption = shippingOptions.find(option => option.id === selectedShipping);
  const canSubmit = selectedSeller && payoutPrice && parseFloat(payoutPrice) > 0 && vatTreatment && selectedShipping && 
    (!selectedShippingOption?.requiresUpload || uploadedFile);

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
        <div className="max-w-4xl mx-auto space-y-8">
          
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

          {/* Seller Selection */}
          <SellerSelection
            selectedSeller={selectedSeller}
            onSellerChange={handleSellerChange}
            availableSellers={availableSellers}
          />

          {selectedSeller && (
            <>
              {/* Pricing Section */}
              <PricingSection
                selectedSeller={selectedSeller}
                vatTreatment={vatTreatment}
                payoutPrice={payoutPrice}
                onVatChange={handleVatChange}
                onPayoutPriceChange={setPayoutPrice}
                product={product}
                availableSellers={availableSellers}
              />

              {/* Shipping Section */}
              <ShippingSection
                selectedShipping={selectedShipping}
                onShippingChange={setSelectedShipping}
                paymentTiming={paymentTiming}
                onPaymentTimingChange={setPaymentTiming}
                uploadedFile={uploadedFile}
                onFileUpload={handleFileUpload}
              />

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
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