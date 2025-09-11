import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShoppingCart, ArrowLeft, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { SellerSelection } from "./SellerSelection";
import { BulkPricingSection } from "./BulkPricingSection";
import { ShippingSection } from "./ShippingSection";
import { Product } from "@/components/dashboard/sections/ProductsOverview/types";
import { sellersApi } from "@/lib/api/sellers";
import { getVATRateByCountryCode } from "@/data/euCountryVAT";
import { wtbOrdersApi, WTBOrderCommon, WTBOrderItem, FileUploadResponse } from "@/lib/api/wtb-orders";


interface BulkWTBOrderFlowProps {
  products: Product[];
}

export function BulkWTBOrderFlow({ products }: BulkWTBOrderFlowProps) {
  const navigate = useNavigate();
  
  const [selectedSeller, setSelectedSeller] = useState("");
  const [payoutPrices, setPayoutPrices] = useState<{[key: string]: string}>({});
  const [vatTreatments, setVatTreatments] = useState<{[key: string]: string}>({});
  const [vatRefundIncluded, setVatRefundIncluded] = useState<{[key: string]: boolean}>({});
  const [selectedShipping, setSelectedShipping] = useState<{[key: string]: string}>({});
  const [paymentTiming, setPaymentTiming] = useState<{[key: string]: string}>({});
  const [uploadedFile, setUploadedFile] = useState<{[key: string]: File | null}>({});
  const [uploadedFileUrl, setUploadedFileUrl] = useState<{[key: string]: string | null}>({});
  const [isUploadingFile, setIsUploadingFile] = useState<{[key: string]: boolean}>({});
  const [trackingData, setTrackingData] = useState<{[key: string]: FileUploadResponse}>({});


  // Fetch active sellers from API
  const {
    data: sellersResponse,
    isLoading: isLoadingSellers,
    error: sellersError,
  } = useQuery({
    queryKey: ['bulk-wtb-active-sellers'], // Unique key for bulk WTB page
    queryFn: () => {
      console.log('Fetching active sellers for Bulk WTB page...');
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


  // Set default VAT treatment to "regular" for all products
  useEffect(() => {
    const defaultVatTreatments: {[key: string]: string} = {};
    products.forEach(product => {
      if (!vatTreatments[product.id]) {
        defaultVatTreatments[product.id] = 'regular';
      }
    });
    
    if (Object.keys(defaultVatTreatments).length > 0) {
      setVatTreatments(prev => ({
        ...prev,
        ...defaultVatTreatments
      }));
    }
  }, [products, vatTreatments]);

  // Set shipping method to "upload" for all products (always upload)
  useEffect(() => {
    const shippingMethods: {[key: string]: string} = {};
    products.forEach(product => {
      shippingMethods[product.id] = 'upload';
    });
    
    setSelectedShipping(shippingMethods);
  }, [products]);

  const calculateRegularVatPayout = (productId: string, sellerName: string) => {
    // Don't auto-fill payout price, let user enter manually
    // This function is kept for future use but doesn't auto-calculate
  };

  const handleSellerChange = (sellerName: string) => {
    setSelectedSeller(sellerName);
    // Clear all related fields when seller changes
    setPayoutPrices({});
    setVatRefundIncluded({});
    // Don't auto-calculate payout price
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
    // Clear payout price and VAT refund for this product when VAT treatment changes
    setPayoutPrices(prev => {
      const newPayoutPrices = { ...prev };
      delete newPayoutPrices[productId];
      return newPayoutPrices;
    });
    setVatRefundIncluded(prev => {
      const newVatRefundIncluded = { ...prev };
      delete newVatRefundIncluded[productId];
      return newVatRefundIncluded;
    });
    // Don't auto-calculate payout price
  };

  const handleVatRefundIncludedChange = (productId: string, checked: boolean) => {
    setVatRefundIncluded(prev => ({
      ...prev,
      [productId]: checked
    }));
    // Don't auto-calculate payout price
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

  const handleFileUpload = async (productId: string, file: File | null) => {
    if (!file) {
      setUploadedFile(prev => ({ ...prev, [productId]: null }));
      setUploadedFileUrl(prev => ({ ...prev, [productId]: null }));
      return;
    }

    // Check if file is PDF or image
    const isValidFile = file.type === "application/pdf" || 
                       file.type.startsWith("image/");
    
    if (!isValidFile) {
      toast.error("Please select a PDF or image file");
      setUploadedFile(prev => ({ ...prev, [productId]: null }));
      setUploadedFileUrl(prev => ({ ...prev, [productId]: null }));
      return;
    }

    try {
      setIsUploadingFile(prev => ({ ...prev, [productId]: true }));
      setUploadedFile(prev => ({ ...prev, [productId]: file }));
      
      // Upload file to server and get tracking data
      const uploadResponse = await wtbOrdersApi.uploadFile(file);
      
      if (uploadResponse.success) {
        setTrackingData(prev => ({ ...prev, [productId]: uploadResponse }));
        setUploadedFileUrl(prev => ({ ...prev, [productId]: URL.createObjectURL(file) }));
        toast.success(`File uploaded successfully for ${products.find(p => p.id === productId)?.name || 'product'}`);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to upload file");
      setUploadedFile(prev => ({ ...prev, [productId]: null }));
      setUploadedFileUrl(prev => ({ ...prev, [productId]: null }));
    } finally {
      setIsUploadingFile(prev => ({ ...prev, [productId]: false }));
    }
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
    setVatRefundIncluded(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });

    toast.success("Product removed from bulk order");
  };


  const handlePurchase = async () => {
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

    try {
      // Get seller ID from selected seller
      const selectedSellerData = availableSellers.find(s => s.name === selectedSeller);
      const sellerId = selectedSellerData?.id;
      
      if (!sellerId) {
        toast.error("Invalid seller selected");
      return;
      }
      
      // Get common values (assuming all products have same buyer country and payment timing)
      const firstProduct = products[0];
      const buyerCountry = firstProduct.customerAddress?.country_code || "";
      const commonPaymentTiming = paymentTiming[Object.keys(paymentTiming)[0]] || "";
      
      // Prepare common data (same for all items)
      const commonData: WTBOrderCommon = {
        // 1. Seller ID
        seller_id: sellerId,
        
        // 3. Buyer Country
        buyer_country: buyerCountry,
        
        // 15. Payment Timing
        payment_timing: commonPaymentTiming
      };
      
      // Prepare items data (specific to each product)
      const itemsData: WTBOrderItem[] = products.map(product => {
        // Calculate VAT rate for this specific product based on its customer country
        const productBuyerCountry = product.customerAddress?.country_code || "";
        const productVatRate = productBuyerCountry ? getVATRateByCountryCode(productBuyerCountry) : 0;
        
        // Calculate VAT amount for this product
        const payoutPriceNum = parseFloat(payoutPrices[product.id] || "0");
        const productVatRefundIncluded = vatRefundIncluded[product.id] || false;
        const vatAmount = productVatRefundIncluded ? payoutPriceNum * (productVatRate / 100) : 0;
        
        // Calculate seller payout with VAT
        const sellerPayoutAmountWithVat = payoutPriceNum + vatAmount;
        
        // Calculate profit for this product
        const listedPrice = parseFloat(product.price.replace(/[^\d.-]/g, ''));
        const vatTreatment = vatTreatments[product.id];
        const profitMarginNet = vatTreatment === 'regular' && productVatRefundIncluded
          ? listedPrice - sellerPayoutAmountWithVat
          : listedPrice - payoutPriceNum;
        
        return {
          // 2. Order Item ID
          order_item_id: product.id,
          
          // 4. Seller VAT Registered
          seller_vat_registered: selectedSellerData?.vatRegistered || false,
          
          // 5. VAT Scheme
          vat_scheme: vatTreatment === 'regular' ? 'regular' : 'margin',
          
          // 6. VAT Rate
          vat_rate: productVatRate,
          
          // 7. VAT Amount
          vat_amount: vatAmount,
          
          // 8. VAT Refund Included
          vat_refund_included: productVatRefundIncluded,
          
          // 9. Profit Margin Gross (Seller Payout Amount)
          profit_margin_gross: payoutPriceNum,
          
          // 10. Profit Margin Net (Final Profit)
          profit_margin_net: profitMarginNet,
          
          // 11. Shipping Method
          shipping_method: selectedShipping[product.id],
          
          // 12. Shipment Label File (will be sent separately in FormData)
          shipment_label_file: null,
          
          // 13. Shipment Method
          shipment_method: trackingData[product.id]?.shipment_method || null,
          
          // 14. Tracking Consignment Number
          tracking_consignment_number: trackingData[product.id]?.tracking_consignment_number || null,
          
          // 15. Shipment Method Raw Data
          shipment_method_raw_data: trackingData[product.id]?.raw_data || null,
          
          // 16. Seller Payout Amount
          seller_payout_amount: payoutPriceNum,
          
          // 17. Seller Payout Amount with VAT
          seller_payout_amount_with_vat: sellerPayoutAmountWithVat
        };
      });
      
      
      // Show loading toast
      toast.loading(`Creating bulk WTB order for ${products.length} items...`);
      
      // Make API call to create bulk WTB orders with files
      const response = await wtbOrdersApi.createBulkWTBOrders(commonData, itemsData, uploadedFile);
    
    // Dismiss loading toast
    toast.dismiss();
    
    if (response.success) {
      toast.success(`Bulk WTB order created successfully! ${products.length} items processed.`);
      navigate(-1);
    } else {
      toast.error(response.message || "Failed to create bulk WTB order");
    }
    
  } catch (error: any) {
    // Dismiss loading toast
    toast.dismiss();
    
    console.error('Bulk WTB Order Creation Error:', error);
    toast.error(error?.message || "An error occurred while creating the bulk WTB order");
  }
  };

  const allProductsHavePayout = products.every(product => 
    payoutPrices[product.id] && parseFloat(payoutPrices[product.id]) > 0
  );
  const allProductsHaveVat = products.every(product => vatTreatments[product.id]);
  const allProductsHaveShipping = products.every(product => 
    selectedShipping[product.id] && selectedShipping[product.id].trim() !== ""
  );
  
  // Check if all products have required file uploads (always required for upload shipping)
  const allProductsHaveRequiredFiles = products.every(product => {
    return uploadedFile[product.id];
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
                          <p><span className="font-medium">Phone:</span> {product.customerAddress?.phone || "N/A"}</p>
                          <p><span className="font-medium">Country:</span> {product.customerAddress?.country || "N/A"}</p>
                          <p><span className="font-medium">Country Code:</span> {product.customerAddress?.country_code || "N/A"}</p>
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
                vatRefundIncluded={vatRefundIncluded}
                selectedShipping={selectedShipping}
                paymentTiming={paymentTiming}
                uploadedFile={uploadedFile}
                uploadedFileUrl={uploadedFileUrl}
                isUploadingFile={isUploadingFile}
                onPayoutChange={handlePayoutChange}
                onVatChange={handleVatChange}
                onVatRefundIncludedChange={handleVatRefundIncludedChange}
                onShippingChange={handleShippingChange}
                onPaymentTimingChange={handlePaymentTimingChange}
                onFileUpload={handleFileUpload}
                onRemoveFromCart={handleRemoveFromCart}
                availableSellers={availableSellers}
              />

              {/* Tracking Data Display */}
              {Object.keys(trackingData).length > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Tracking Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(trackingData).map(([productId, data]) => {
                      const product = products.find(p => p.id === productId);
                      return (
                        <div key={productId} className="border border-green-200 rounded-lg p-4 bg-green-100">
                          <h4 className="font-medium text-green-800 mb-3">{product?.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-green-700">Shipment Method</Label>
                              <p className="text-sm text-green-600 font-mono">{data.shipment_method}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-green-700">Tracking Number</Label>
                              <p className="text-sm text-green-600 font-mono">{data.tracking_consignment_number}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Label className="text-sm font-medium text-green-700">Raw Data</Label>
                            <p className="text-xs text-green-600 bg-green-200 p-2 rounded font-mono break-all">
                              {data.raw_data}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

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