import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SellerSelection } from "./SellerSelection";
import { PricingSection } from "./PricingSection";
import { ShippingSection } from "./ShippingSection";
import { sellersApi } from "@/lib/api/sellers";

interface WTBOrderFlowProps {
  product: {
    id: string;
    name: string;
    sku: string;
    price: string;
    status: string;
    currency?: string;
    // Additional details from API
    orderId?: number;
    orderNumber?: string;
    orderUrl?: string;
    variant?: string;
    vendor?: string;
    quantity?: number;
    totalPrice?: number;
    customerEmail?: string;
    orderCreatedAt?: string;
    // Customer details
    customerName?: string;
    customerPhone?: string;
    customerAddress?: {
      address1: string;
      address2: string;
      city: string;
      province: string;
      country: string;
      zip: string;
      phone: string;
    };
    // Product details
    productType?: string;
    barcode?: string;
    weight?: number;
    weightUnit?: string;
    taxable?: boolean;
    requiresShipping?: boolean;
    fulfillmentStatus?: string;
    // Tax details
    taxLines?: any[];
    // Price details
    netPrice?: number;
    totalDiscount?: number;
  };
}

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

  // Fetch sellers from API
  const {
    data: sellersResponse,
    isLoading: isLoadingSellers,
    error: sellersError,
  } = useQuery({
    queryKey: ['wtb-sellers'], // Unique key for WTB page
    queryFn: () => {
      console.log('Fetching sellers for WTB page...');
      return sellersApi.getSellers(1, 100);
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Debug log to see API response
  console.log('Sellers API Response:', sellersResponse);
  console.log('Is Loading Sellers:', isLoadingSellers);
  console.log('Sellers Error:', sellersError);

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

  const calculateRegularVatPayout = (sellerName: string) => {
    const seller = availableSellers.find(s => s.name === sellerName);
    
    if (seller && product) {
      const listedPrice = parseFloat(product.price.replace(/[^\d.-]/g, ''));
      const payoutPriceCalc = listedPrice / (1 + Number(seller.vatRate));
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
                      <p><span className="font-medium">Phone:</span> {product.customerAddress.phone || "N/A"}</p>
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