import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Package, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SellerSelection } from "./SellerSelection";
import { PricingSection } from "./PricingSection";
import { ShippingSection } from "./ShippingSection";
import { sellersApi } from "@/lib/api/sellers";
import { getVATRateByCountryCode } from "@/data/euCountryVAT";
import { wtbOrdersApi, WTBOrderCommon, WTBOrderItem, FileUploadResponse } from "@/lib/api/wtb-orders";

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
      country_code: string;
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


export function WTBOrderFlow({ product }: WTBOrderFlowProps) {
  const navigate = useNavigate();
  
  const [selectedSeller, setSelectedSeller] = useState("");
  const [payoutPrice, setPayoutPrice] = useState("");
  const [vatTreatment, setVatTreatment] = useState("regular");
  const [vatRefundIncluded, setVatRefundIncluded] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState("upload");
  const [paymentTiming, setPaymentTiming] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [trackingData, setTrackingData] = useState<FileUploadResponse | null>(null);


  // Fetch active sellers from API
  const {
    data: sellersResponse,
    isLoading: isLoadingSellers,
    error: sellersError,
  } = useQuery({
    queryKey: ['wtb-active-sellers'], // Unique key for WTB page
    queryFn: () => {
      console.log('Fetching active sellers for WTB page...');
      return sellersApi.getActiveSellers();
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });



  // Convert API active sellers to dropdown format
  const availableSellers = sellersResponse?.data?.map(seller => {
    
    // Use default VAT rate based on country or 21% as fallback
    const defaultVatRate = 0.21; // Default VAT rate
    
    return {
      name: seller.owner_name,
      email: seller.email,
      country: seller.country || "Unknown",
      vatRate: defaultVatRate, // Use default VAT rate since API doesn't provide it
      id: seller.id,
      vatRegistered: seller.vat_registered,
      vatNumber: seller.vat_number,
      tinNumber: seller.tin_number
    };
  }) || [];

  const calculateRegularVatPayout = (sellerName: string) => {
    // Don't auto-fill payout price, let user enter manually
    // This function is kept for future use but doesn't auto-calculate
  };

  const handleSellerChange = (sellerName: string) => {
    setSelectedSeller(sellerName);
    // Clear all related fields when seller changes
    setPayoutPrice("");
    setVatRefundIncluded(false);
    // Don't auto-calculate payout price
  };

  const handleVatChange = (value: string) => {
    setVatTreatment(value);
    // Clear payout price and VAT refund when VAT treatment changes
    setPayoutPrice("");
    setVatRefundIncluded(false);
    // Don't auto-calculate payout price
  };

  const handleVatRefundIncludedChange = (checked: boolean) => {
    setVatRefundIncluded(checked);
    // Don't auto-calculate payout price
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setUploadedFile(null);
      setUploadedFileUrl(null);
      return;
    }

    // Check if file is PDF or image
    const isValidFile = file.type === "application/pdf" || 
                       file.type.startsWith("image/");
    
    if (!isValidFile) {
      toast.error("Please select a PDF or image file");
      setUploadedFile(null);
      setUploadedFileUrl(null);
      return;
    }

    try {
      setIsUploadingFile(true);
      setUploadedFile(file);
      
      // Upload file to server and get tracking data
      const uploadResponse = await wtbOrdersApi.uploadFile(file);
      
      if (uploadResponse.success) {
        setTrackingData(uploadResponse);
        setUploadedFileUrl(URL.createObjectURL(file));
        toast.success("File uploaded successfully");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to upload file");
      setUploadedFile(null);
      setUploadedFileUrl(null);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedSeller || !payoutPrice || !vatTreatment || !selectedShipping) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Always require file upload for shipping
    if (!uploadedFile) {
      toast.error("Please upload a shipment label");
      return;
    }
    
    try {
      // Get seller ID from selected seller
      const selectedSellerData = availableSellers.find(s => s.name === selectedSeller);
      const sellerId = selectedSellerData?.id;
      
      if (!sellerId) {
        toast.error("Invalid seller selected");
        return;
      }
      
      // Get customer country code
      const buyerCountry = product.customerAddress?.country_code || "";
      
      // Get VAT rate from customer country for this specific product
      const customerVatRate = buyerCountry ? getVATRateByCountryCode(buyerCountry) : null;
      const vatRate = customerVatRate || 0;
      
      // Calculate VAT amount
      const payoutPriceNum = parseFloat(payoutPrice);
      const vatAmount = vatRefundIncluded ? payoutPriceNum * (vatRate / 100) : 0;
      
      // Calculate seller payout with VAT
      const sellerPayoutAmountWithVat = payoutPriceNum + vatAmount;
      
      // Calculate profit
      const listedPrice = parseFloat(product.price.replace(/[^\d.-]/g, ''));
      const profitMarginNet = vatTreatment === 'regular' && vatRefundIncluded
        ? listedPrice - sellerPayoutAmountWithVat
        : listedPrice - payoutPriceNum;
      
      // Prepare common data (same for all items)
      const commonData: WTBOrderCommon = {
        // 1. Seller ID
        seller_id: sellerId,
        
        // 3. Buyer Country
        buyer_country: buyerCountry,
        
        // 15. Payment Timing
        payment_timing: paymentTiming
      };
      
      // Prepare item data (specific to this item)
      const itemData: WTBOrderItem = {
        // 2. Order Item ID
        order_item_id: product.id,
        
        // 4. Seller VAT Registered
        seller_vat_registered: selectedSellerData?.vatRegistered || false,
        
        // 5. VAT Scheme
        vat_scheme: vatTreatment === 'regular' ? 'regular' : 'margin',
        
        // 6. VAT Rate
        vat_rate: vatRate,
        
        // 7. VAT Amount
        vat_amount: vatAmount,
        
        // 8. VAT Refund Included
        vat_refund_included: vatRefundIncluded,
        
        // 9. Profit Margin Gross (Seller Payout Amount)
        profit_margin_gross: payoutPriceNum,
        
        // 10. Profit Margin Net (Final Profit)
        profit_margin_net: profitMarginNet,
        
        // 11. Shipping Method
        shipping_method: selectedShipping,
        
        // 12. Shipment Label File (will be sent separately in FormData)
        shipment_label_file: null,
        
        // 13. Shipment Method
        shipment_method: trackingData?.shipment_method || null,
        
        // 14. Tracking Consignment Number
        tracking_consignment_number: trackingData?.tracking_consignment_number || null,
        
        // 15. Shipment Method Raw Data
        shipment_method_raw_data: trackingData?.raw_data || null,
        
        // 16. Seller Payout Amount
        seller_payout_amount: payoutPriceNum,
        
        // 17. Seller Payout Amount with VAT
        seller_payout_amount_with_vat: sellerPayoutAmountWithVat
      };
      
      
      // Show loading toast
      toast.loading("Creating WTB order...");
      
      // Make API call to create WTB order with file
      const response = await wtbOrdersApi.createWTBOrder(commonData, itemData, trackingData?.file_path );
      
      // Dismiss loading toast
      toast.dismiss();
      
      if (response.success) {
        toast.success(`WTB order created successfully! Order ID: ${response.data.order_id}`);
        navigate(-1);
      } else {
        toast.error(response.message || "Failed to create WTB order");
      }
      
    } catch (error: any) {
      // Dismiss loading toast
      toast.dismiss();
      
      console.error('WTB Order Creation Error:', error);
      toast.error(error?.message || "An error occurred while creating the WTB order");
    }
  };

  const canSubmit = selectedSeller && payoutPrice && parseFloat(payoutPrice) > 0 && vatTreatment && selectedShipping && uploadedFile && !isUploadingFile;

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
                    <p><span className="font-medium">Total Price:</span> {product.totalPrice ? `${product.currency || ' EUR'} ${product.totalPrice}` : "N/A"}</p>
                    <p><span className="font-medium">Net Price:</span> {product.netPrice ? `${product.currency || ' EUR'} ${product.netPrice}` : "N/A"}</p>
                    <p><span className="font-medium">Discount:</span> {product.totalDiscount ? `${product.currency || ' EUR'} ${product.totalDiscount}` : "N/A"}</p>
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
                      <p><span className="font-medium">Country:</span> {product.customerAddress.country || "N/A"}</p>
                      <p><span className="font-medium">Country Code:</span> {product.customerAddress.country_code || "N/A"}</p>
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
                vatRefundIncluded={vatRefundIncluded}
                onVatChange={handleVatChange}
                onPayoutPriceChange={setPayoutPrice}
                onVatRefundIncludedChange={handleVatRefundIncludedChange}
                product={product}
                availableSellers={availableSellers}
              />

              {/* Shipping Section */}
              <ShippingSection
                paymentTiming={paymentTiming}
                onPaymentTimingChange={setPaymentTiming}
                selectedShipping={selectedShipping}
                onShippingChange={setSelectedShipping}
                uploadedFile={uploadedFile}
                onFileUpload={handleFileUpload}
                isUploadingFile={isUploadingFile}
              />

              {/* Tracking Data Display */}
              {trackingData && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Tracking Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-green-700">Shipment Method</Label>
                        <p className="text-sm text-green-600 font-mono">{trackingData.shipment_method}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-green-700">Tracking Number</Label>
                        <p className="text-sm text-green-600 font-mono">{trackingData.tracking_consignment_number}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-green-700">Raw Data</Label>
                      <p className="text-xs text-green-600 bg-green-100 p-2 rounded font-mono break-all">
                        {trackingData.raw_data}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

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