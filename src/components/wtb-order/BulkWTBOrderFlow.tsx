import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { SellerSelection } from "./SellerSelection";
import { BulkPricingSection } from "./BulkPricingSection";
import { ShippingSection } from "./ShippingSection";
import { Product } from "@/components/dashboard/sections/ProductsOverview/types";

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

export function BulkWTBOrderFlow() {
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [selectedSeller, setSelectedSeller] = useState("");
  const [payoutPrices, setPayoutPrices] = useState<{[key: string]: string}>({});
  const [vatTreatments, setVatTreatments] = useState<{[key: string]: string}>({});
  const [selectedShipping, setSelectedShipping] = useState("");
  const [paymentTiming, setPaymentTiming] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    // Get cart items from sessionStorage
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
    } else if (value === "margin") {
      // Clear payout for margin scheme to let user enter manually
      setPayoutPrices(prev => ({
        ...prev,
        [productId]: ""
      }));
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
          
          {/* Seller Selection */}
          <SellerSelection
            selectedSeller={selectedSeller}
            onSellerChange={handleSellerChange}
            availableSellers={availableSellers}
          />

          {selectedSeller && (
            <>
              {/* Bulk Pricing Section */}
              <BulkPricingSection
                cartItems={cartItems}
                selectedSeller={selectedSeller}
                payoutPrices={payoutPrices}
                vatTreatments={vatTreatments}
                onPayoutChange={handlePayoutChange}
                onVatChange={handleVatChange}
                onRemoveFromCart={handleRemoveFromCart}
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
                  Confirm Bulk Purchase
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}