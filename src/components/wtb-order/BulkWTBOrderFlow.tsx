import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SellerSelection } from "./SellerSelection";
import { BulkPricingSection } from "./BulkPricingSection";
import { ShippingSection } from "./ShippingSection";
import { Product } from "@/components/dashboard/sections/ProductsOverview/types";
import { sellersApi } from "@/lib/api/sellers";

const shippingOptions = [
  { id: "discord", name: "Shipper Discord", requiresUpload: false },
  { id: "upload", name: "Upload shipment label", requiresUpload: true }
];

interface BulkWTBOrderFlowProps {
  products: Product[];
}

export function BulkWTBOrderFlow({ products }: BulkWTBOrderFlowProps) {
  const navigate = useNavigate();
  
  const [selectedSeller, setSelectedSeller] = useState("");
  const [payoutPrices, setPayoutPrices] = useState<{[key: string]: string}>({});
  const [vatTreatments, setVatTreatments] = useState<{[key: string]: string}>({});
  const [selectedShipping, setSelectedShipping] = useState<{[key: string]: string}>({});
  const [paymentTiming, setPaymentTiming] = useState<{[key: string]: string}>({});
  const [uploadedFile, setUploadedFile] = useState<{[key: string]: File | null}>({});

  // Fetch sellers from API
  const {
    data: sellersResponse,
    isLoading: isLoadingSellers,
    error: sellersError,
  } = useQuery({
    queryKey: ['bulk-wtb-sellers'], // Unique key for bulk WTB page
    queryFn: () => {
      console.log('Fetching sellers for Bulk WTB page...');
      return sellersApi.getSellers(1, 100);
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Convert API sellers to dropdown format
  const availableSellers = sellersResponse?.data?.data?.map(seller => {
    console.log('Seller data from API:', seller); // Debug log
    console.log('Seller vat_rate:', seller.vat_rate, 'Type:', typeof seller.vat_rate);
    console.log('Seller country:', seller.country);
    console.log('Seller store_name:', seller.store_name);
    console.log('Seller owner_name:', seller.owner_name);
    return {
      name: seller.store_name || seller.owner_name,
      country: seller.country || "Unknown",
      vatRate: Number(seller.vat_rate) || 0.21, // Convert string to number
      id: seller.id,
      email: seller.email,
      status: seller.status
    };
  }) || [];

  console.log('Final availableSellers:', availableSellers);

  const calculateRegularVatPayout = (productId: string, sellerName: string) => {
    const seller = availableSellers.find(s => s.name === sellerName);
    const product = products.find(p => p.id === productId);
    
    if (seller && product) {
      const listedPrice = parseFloat(product.price.replace(/[^\d.-]/g, ''));
      const payoutPrice = listedPrice / (1 + Number(seller.vatRate));
      
      setPayoutPrices(prev => ({
        ...prev,
        [productId]: payoutPrice.toFixed(2)
      }));
    }
  };

  const handleSellerChange = (sellerName: string) => {
    setSelectedSeller(sellerName);
    
    // Auto-calculate payout for all products with Regular VAT
    products.forEach(product => {
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

  const handleShippingChange = (productId: string, value: string) => {
    setSelectedShipping(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handlePaymentTimingChange = (productId: string, value: string) => {
    setPaymentTiming(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleFileUpload = (productId: string, file: File | null) => {
    setUploadedFile(prev => ({
      ...prev,
      [productId]: file
    }));
  };

  const handleRemoveFromCart = (productId: string) => {
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

    toast.success("Product removed from bulk order");
  };


  const handlePurchase = () => {
    if (!selectedSeller) {
      toast.error("Please select a seller");
      return;
    }

    // Check if all products have shipping methods
    const allProductsHaveShipping = products.every(product => 
      selectedShipping[product.id] && selectedShipping[product.id].trim() !== ""
    );

    if (!allProductsHaveShipping) {
      toast.error("Please select shipping method for all products");
      return;
    }

    // Check if all products have payout prices and VAT treatments
    const allProductsHavePayout = products.every(product => 
      payoutPrices[product.id] && parseFloat(payoutPrices[product.id]) > 0
    );
    const allProductsHaveVat = products.every(product => vatTreatments[product.id]);
    
    if (!allProductsHavePayout || !allProductsHaveVat) {
      toast.error("Please complete all product configurations");
      return;
    }

    
    // Navigate back
    toast.success(`Bulk WTB order created for ${products.length} items`);
    navigate(-1);
  };

  const allProductsHavePayout = products.every(product => 
    payoutPrices[product.id] && parseFloat(payoutPrices[product.id]) > 0
  );
  const allProductsHaveVat = products.every(product => vatTreatments[product.id]);
  const allProductsHaveShipping = products.every(product => 
    selectedShipping[product.id] && selectedShipping[product.id].trim() !== ""
  );
  
  // Check if all products have required file uploads
  const allProductsHaveRequiredFiles = products.every(product => {
    const shippingOption = shippingOptions.find(option => option.id === selectedShipping[product.id]);
    return !shippingOption?.requiresUpload || uploadedFile[product.id];
  });
  
  const canSubmit = selectedSeller && allProductsHaveShipping && allProductsHavePayout && allProductsHaveVat && allProductsHaveRequiredFiles;

  if (products.length === 0) {
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
                Bulk WTB Order ({products.length} items)
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Product Details Cards */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Order Items Details</h2>
            {products.map((product) => (
              <Card key={product.id} className="bg-muted/20 border border-border">
                <CardHeader>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Product Info */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-foreground">{product.name}</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">SKU:</span> {product.sku}</p>
                        <p><span className="font-medium">Variant:</span> {product.variant || "N/A"}</p>
                        <p><span className="font-medium">Vendor:</span> {product.vendor || "N/A"}</p>
                        <p><span className="font-medium">Product Type:</span> {product.productType || "N/A"}</p>
                        <p><span className="font-medium">Quantity:</span> {product.quantity || 1}</p>
                      </div>
                      <p className="text-xl font-bold text-primary">Listed at: {product.price}</p>
                    </div>

                    {/* Order Info */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-md text-foreground">Order Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Order ID:</span> {product.orderId || "N/A"}</p>
                        <p><span className="font-medium">Order Number:</span> {product.orderNumber || "N/A"}</p>
                        <p><span className="font-medium">Order Date:</span> {product.orderCreatedAt ? new Date(product.orderCreatedAt).toLocaleDateString() : "N/A"}</p>
                        <p><span className="font-medium">Total Price:</span> {product.totalPrice ? `${product.currency || 'IDR'} ${product.totalPrice}` : "N/A"}</p>
                        <p><span className="font-medium">Net Price:</span> {product.netPrice ? `${product.currency || 'IDR'} ${product.netPrice}` : "N/A"}</p>
                        <p><span className="font-medium">Discount:</span> {product.totalDiscount ? `${product.currency || 'IDR'} ${product.totalDiscount}` : "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  {product.customerName && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-md text-foreground mb-3">Customer Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Name:</span> {product.customerName}</p>
                          <p><span className="font-medium">Email:</span> {product.customerEmail || "N/A"}</p>
                          <p><span className="font-medium">Phone:</span> {product.customerAddress?.phone || "N/A"}</p>
                        </div>
                        {product.customerAddress && (
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Address:</span></p>
                            <div className="pl-2 space-y-1">
                              <p>{product.customerAddress.address1}</p>
                              {product.customerAddress.address2 && <p>{product.customerAddress.address2}</p>}
                              <p>{product.customerAddress.city}, {product.customerAddress.province}</p>
                              <p>{product.customerAddress.country} {product.customerAddress.zip}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                 
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Seller Selection */}
          <SellerSelection
            selectedSeller={selectedSeller}
            onSellerChange={handleSellerChange}
            availableSellers={availableSellers}
            isLoading={isLoadingSellers}
            error={sellersError}
          />

          {selectedSeller && (
            <>
              {/* Bulk Pricing Section */}
              <BulkPricingSection
                cartItems={products}
                selectedSeller={selectedSeller}
                payoutPrices={payoutPrices}
                vatTreatments={vatTreatments}
                selectedShipping={selectedShipping}
                paymentTiming={paymentTiming}
                uploadedFile={uploadedFile}
                onPayoutChange={handlePayoutChange}
                onVatChange={handleVatChange}
                onShippingChange={handleShippingChange}
                onPaymentTimingChange={handlePaymentTimingChange}
                onFileUpload={handleFileUpload}
                onRemoveFromCart={handleRemoveFromCart}
                availableSellers={availableSellers}
              />

              {/* Payment Timing Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">Payment Timing</h2>
                <Card className="bg-muted/20 border border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Timing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Payment Timing */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Payment Timing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            {["before-shipping", "after-delivery"].map((timing) => (
                              <div 
                                key={timing}
                                className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                                onClick={() => {
                                  // Set payment timing for all products
                                  const newPaymentTiming: {[key: string]: string} = {};
                                  products.forEach(product => {
                                    newPaymentTiming[product.id] = timing;
                                  });
                                  setPaymentTiming(newPaymentTiming);
                                }}
                              >
                                <div className="relative">
                                  <div className="h-5 w-5 border-2 border-border rounded flex items-center justify-center">
                                    {paymentTiming[products[0]?.id] === timing && (
                                      <div className="h-3 w-3 bg-primary rounded-sm" />
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <Label className="text-sm font-medium cursor-pointer">
                                    {timing === "before-shipping" ? "Before shipping" : "After delivery"}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    {timing === "before-shipping" 
                                      ? "Payment is made before the item is shipped"
                                      : "Payment is made after the item is delivered"
                                    }
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>

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