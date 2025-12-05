import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, ArrowLeft, Loader2, Package, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { SellerSelection } from "./SellerSelection";
import { BulkPricingSection } from "./BulkPricingSection";
import { ShippingSection } from "./ShippingSection";
import { PricingBreakdown } from "./PricingBreakdown";
import { SendCloudModal } from "./SendCloudModal";
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
  const [payoutPrices, setPayoutPrices] = useState<{ [key: string]: string }>({});
  const [vatTreatments, setVatTreatments] = useState<{ [key: string]: string }>({});
  const [vatRefundIncluded, setVatRefundIncluded] = useState<{ [key: string]: boolean }>({});
  const [selectedShipping, setSelectedShipping] = useState<{ [key: string]: string }>({});
  const [paymentTiming, setPaymentTiming] = useState<{ [key: string]: string }>({});
  const [uploadedFile, setUploadedFile] = useState<{ [key: string]: File | null }>({});
  const [uploadedFileUrl, setUploadedFileUrl] = useState<{ [key: string]: string | null }>({});
  const [isUploadingFile, setIsUploadingFile] = useState<{ [key: string]: boolean }>({});
  const [trackingData, setTrackingData] = useState<{ [key: string]: FileUploadResponse }>({});


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
      tinNumber: seller.tin_number,
      shipmentMethodCode: seller.shipment_method_code,
      storeName: seller.store_name || undefined,
      contactName: seller.contact_person || undefined
    };
  }) || [];

  // Check if selected seller is eligible for VAT refund
  const selectedSellerData = availableSellers.find(s => s.name === selectedSeller);
  const isVatRefundEligible = selectedSellerData?.vatRegistered && selectedSellerData?.vatNumber;


  // Set default VAT treatment to "margin" for all products
  useEffect(() => {
    if (selectedSeller) {
      const defaultVatTreatments: {[key: string]: string} = {};
      products.forEach(product => {
        if (!vatTreatments[product.id]) {
          defaultVatTreatments[product.id] = 'margin';
        }
      });
      
      if (Object.keys(defaultVatTreatments).length > 0) {
        setVatTreatments(prev => ({
          ...prev,
          ...defaultVatTreatments
        }));
      }
    }
  }, [products, selectedSeller]);

  // Set shipping method default to "sendcloud" for all products
  useEffect(() => {
    if (selectedSeller) {
      const shippingMethods: {[key: string]: string} = {};
      products.forEach(product => {
        shippingMethods[product.id] = 'sendcloud';
      });
      
      setSelectedShipping(shippingMethods);
    }
  }, [products, selectedSeller]);

  // Set payment timing default to "after-delivery" for all products
  useEffect(() => {
    if (selectedSeller) {
      const paymentTimings: {[key: string]: string} = {};
      products.forEach(product => {
        if (!paymentTiming[product.id]) {
          paymentTimings[product.id] = 'after-delivery';
        }
      });
      
      if (Object.keys(paymentTimings).length > 0) {
        setPaymentTiming(prev => ({
          ...prev,
          ...paymentTimings
        }));
      }
    }
  }, [products, selectedSeller]);

  const calculateRegularVatPayout = (productId: string, sellerName: string) => {
    // Don't auto-fill payout price, let user enter manually
    // This function is kept for future use but doesn't auto-calculate
  };

  const handleSellerChange = (sellerName: string) => {
    setSelectedSeller(sellerName);
    // Clear all related fields when seller changes
    setPayoutPrices({});
    setVatRefundIncluded({});
    setVatTreatments({});
    setSelectedShipping({});
    setPaymentTiming({});
    setUploadedFile({});
    setUploadedFileUrl({});
    setTrackingData({});
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

  const handleSendCloudLabelCreated = (productId: string, labelData: any) => {
    // Reuse tracking data section: backend returns same shape as upload-file
    setTrackingData(prev => ({ ...prev, [productId]: labelData }));
    // Mark shipping method as sendcloud for this product
    setSelectedShipping(prev => ({ ...prev, [productId]: 'sendcloud' }));
    toast.success(`SendCloud label created for ${products.find(p => p.id === productId)?.name || 'product'}`);
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
    setTrackingData(prev => {
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
          shipment_label_file: trackingData[product.id]?.file_path || null,

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
      const response = await wtbOrdersApi.createBulkWTBOrders(commonData, itemsData);

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

  // Check if all products have required shipping labels based on selected method
  const allProductsHaveRequiredShipping = products.every(product => {
    const method = selectedShipping[product.id];
    if (method === 'upload') {
      return !!uploadedFile[product.id];
    }
    if (method === 'sendcloud') {
      return !!trackingData[product.id];
    }
    return false;
  });

  const canSubmit = selectedSeller && allProductsHaveShipping && allProductsHavePayout && allProductsHaveVat && allProductsHaveRequiredShipping;

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Bulk WTB Order
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {products.length} items selected
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                {products.length} Items
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Seller Selection - At the Top */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <div className="p-1 bg-primary/20 rounded">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                Select Seller
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Choose the seller for all items in this bulk order
              </p>
            </div>
            <div className="p-6">
              <SellerSelection
                selectedSeller={selectedSeller}
                onSellerChange={handleSellerChange}
                availableSellers={availableSellers}
                isLoading={isLoadingSellers}
                error={sellersError}
              />
            </div>
          </div>

          {/* Individual Item Cards */}
          {selectedSeller && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Order Items
                </h2>
               
              </div>
              
              <div className="grid gap-6">
                {products.map((product, index) => (
                  <Card key={product.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 text-primary font-bold rounded-lg">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                                {product.sku}
                              </span>
                              <span className="text-sm font-medium text-primary">
                                {product.price}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromCart(product.id)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-6">
                      {/* Product Details Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Product Info */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            Product Information
                          </h4>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-slate-600 dark:text-slate-400">Variant:</span>
                                <p className="font-medium text-slate-900 dark:text-slate-100">{product.variant || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-slate-600 dark:text-slate-400">Vendor:</span>
                                <p className="font-medium text-slate-900 dark:text-slate-100">{product.vendor || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-slate-600 dark:text-slate-400">Type:</span>
                                <p className="font-medium text-slate-900 dark:text-slate-100">{product.productType || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-slate-600 dark:text-slate-400">Quantity:</span>
                                <p className="font-medium text-slate-900 dark:text-slate-100">{product.quantity || 1}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Information */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Order Details
                          </h4>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-slate-600 dark:text-slate-400">Order ID:</span>
                                <p className="font-medium text-slate-900 dark:text-slate-100 font-mono text-xs">{product.orderId || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-slate-600 dark:text-slate-400">Order #:</span>
                                <p className="font-medium text-slate-900 dark:text-slate-100">{product.orderNumber || "N/A"}</p>
                              </div>
                              <div>
                                <span className="text-slate-600 dark:text-slate-400">Date:</span>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                  {product.orderCreatedAt ? new Date(product.orderCreatedAt).toLocaleDateString() : "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-slate-600 dark:text-slate-400">Total:</span>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                  {product.totalPrice ? `${product.currency || ' EUR'} ${product.totalPrice}` : "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Customer Information */}
                      {product.customerName && (
                        <div className="border-t border-slate-200 dark:border-slate-600 pt-6">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Customer Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-slate-600 dark:text-slate-400">Name:</span>
                                  <p className="font-medium text-slate-900 dark:text-slate-100">{product.customerName}</p>
                                </div>
                                <div>
                                  <span className="text-slate-600 dark:text-slate-400">Email:</span>
                                  <p className="font-medium text-slate-900 dark:text-slate-100">{product.customerEmail || "N/A"}</p>
                                </div>
                                <div>
                                  <span className="text-slate-600 dark:text-slate-400">Phone:</span>
                                  <p className="font-medium text-slate-900 dark:text-slate-100">{product.customerAddress?.phone || "N/A"}</p>
                                </div>
                                <div>
                                  <span className="text-slate-600 dark:text-slate-400">Country:</span>
                                  <p className="font-medium text-slate-900 dark:text-slate-100">{product.customerAddress?.country || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                            {product.customerAddress && (
                              <div className="space-y-3">
                                <div className="text-sm">
                                  <span className="text-slate-600 dark:text-slate-400">Address:</span>
                                  <div className="mt-1 space-y-1 text-slate-900 dark:text-slate-100">
                                    <p className="font-medium">{product.customerAddress.address1}</p>
                                    {product.customerAddress.address2 && <p className="text-slate-600 dark:text-slate-400">{product.customerAddress.address2}</p>}
                                    <p className="text-slate-600 dark:text-slate-400">
                                      {product.customerAddress.city}, {product.customerAddress.province}
                                    </p>
                                    <p className="text-slate-600 dark:text-slate-400">
                                      {product.customerAddress.country} {product.customerAddress.zip}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Configuration Form */}
                      <div className="border-t border-slate-200 dark:border-slate-600 pt-6">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-6">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Configuration
                        </h4>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* VAT Treatment */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">VAT Treatment</Label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleVatChange(product.id, 'margin')}
                                className={`flex-1 px-4 py-3 text-sm rounded-lg border transition-all duration-200 ${
                                  vatTreatments[product.id] === 'margin'
                                    ? 'border-primary bg-primary text-white shadow-md'
                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-primary/50 hover:bg-primary/5'
                                }`}
                              >
                                Margin Scheme
                              </button>
                              <button
                                type="button"
                                onClick={() => handleVatChange(product.id, 'regular')}
                                className={`flex-1 px-4 py-3 text-sm rounded-lg border transition-all duration-200 ${
                                  vatTreatments[product.id] === 'regular'
                                    ? 'border-primary bg-primary text-white shadow-md'
                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-primary/50 hover:bg-primary/5'
                                }`}
                              >
                                Regular VAT
                              </button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {vatTreatments[product.id] === 'regular' 
                                ? "Standard VAT treatment - seller pays VAT to authorities"
                                : "For second-hand goods - VAT only on profit margin"
                              }
                            </p>
                          </div>

                          {/* Payout Price */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Seller Payout Price</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
                                €
                              </span>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={payoutPrices[product.id] || ""}
                                onChange={(e) => handlePayoutChange(product.id, e.target.value)}
                                className="pl-8 text-right h-12 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary/20"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            {vatTreatments[product.id] !== 'margin' && (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`vat-refund-included-${product.id}`}
                                  checked={vatRefundIncluded[product.id] || false}
                                  onCheckedChange={(checked) => handleVatRefundIncludedChange(product.id, checked as boolean)}
                                  disabled={!isVatRefundEligible}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <label
                                  htmlFor={`vat-refund-included-${product.id}`}
                                  className={`text-xs font-medium leading-none ${
                                    !isVatRefundEligible 
                                      ? 'text-slate-400 cursor-not-allowed' 
                                      : 'text-slate-600 dark:text-slate-300 cursor-pointer'
                                  }`}
                                >
                                  VAT Refund Included
                                  {!isVatRefundEligible && (
                                    <span className="block text-slate-400">
                                      (Seller must be VAT registered)
                                    </span>
                                  )}
                                </label>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Shipping Method */}
                        <div className="mt-6">
                          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">Shipping Method</Label>
                          <div className="space-y-3">
                            {/* Method selector */}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleShippingChange(product.id, 'sendcloud')}
                                className={`flex-1 px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
                                  selectedShipping[product.id] === 'sendcloud'
                                    ? 'border-primary bg-primary text-white shadow-md'
                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-primary/50 hover:bg-primary/5'
                                }`}
                              >
                                SendCloud
                              </button>
                              <button
                                type="button"
                                onClick={() => handleShippingChange(product.id, 'upload')}
                                className={`flex-1 px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
                                  selectedShipping[product.id] === 'upload'
                                    ? 'border-primary bg-primary text-white shadow-md'
                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-primary/50 hover:bg-primary/5'
                                }`}
                              >
                                Upload Label
                              </button>
                            </div>
                            {/* Upload Option */}
                            {selectedShipping[product.id] === 'upload' && (
                            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 border-2 border-primary rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                                    Upload Shipment Label
                                  </Label>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Upload a PDF or image shipment label for this order
                                  </p>
                                </div>
                              </div>
                              
                              <div className="mt-4 space-y-2">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Shipment Label</Label>
                                <div className="flex items-center gap-3">
                                  <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                                    onChange={(e) => handleFileUpload(product.id, e.target.files?.[0] || null)}
                                    className="flex-1 h-10 border-slate-300 dark:border-slate-600"
                                  />
                                  {isUploadingFile[product.id] ? (
                                    <div className="flex items-center gap-2 text-xs text-blue-600">
                                      <Upload className="h-3 w-3 animate-spin" />
                                      Uploading...
                                    </div>
                                  ) : uploadedFile[product.id] ? (
                                    <div className="flex items-center gap-2 text-xs text-green-600">
                                      <Upload className="h-3 w-3" />
                                      Ready
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-xs text-red-500">
                                      Required
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            )}

                            {/* SendCloud Option */}
                            {selectedShipping[product.id] === 'sendcloud' && (
                            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 border-2 border-primary rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                                    SendCloud Shipment Label
                                  </Label>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Create a SendCloud shipment label for this order
                                  </p>
                                </div>
                              </div>
                              
                              <div className="mt-4 space-y-2">
                                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Create SendCloud Label</Label>
                                <SendCloudModal
                                  customerCountryCode={product.customerAddress?.country_code || ""}
                                  orderItem={product}
                                  onLabelCreated={(labelData) => handleSendCloudLabelCreated(product.id, labelData)}
                                  defaultShipmentMethodCode={availableSellers.find(s => s.name === selectedSeller)?.shipmentMethodCode}
                                  orderItemStatus="sourcing"
                                >
                                  <Button className="w-full" variant="outline">
                                    <Package className="h-4 w-4 mr-2" />
                                    Create SendCloud Label
                                  </Button>
                                </SendCloudModal>
                                {trackingData[product.id] ? (
                                  <div className="flex items-center gap-2 text-xs text-green-600">
                                    <Package className="h-3 w-3" />
                                    Label Created
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-xs text-red-500">
                                    Required
                                  </div>
                                )}
                              </div>
                            </div>
                            )}
                          </div>
                        </div>

                        {/* Tracking Information - Inside each card */}
                        {trackingData[product.id] && (
                          <div className="mt-6 border-t border-slate-200 dark:border-slate-600 pt-6">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Tracking Information
                            </h4>
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-green-700 dark:text-green-300">Shipment Method</Label>
                                  <p className="text-sm text-green-600 dark:text-green-400 font-mono">{trackingData[product.id].shipment_method}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-green-700 dark:text-green-300">Tracking Number</Label>
                                  <p className="text-sm text-green-600 dark:text-green-400 font-mono">{trackingData[product.id].tracking_consignment_number}</p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <Label className="text-sm font-medium text-green-700 dark:text-green-300">Raw Data</Label>
                                <p className="text-xs text-green-600 dark:text-green-400 bg-green-200 dark:bg-green-800 p-2 rounded font-mono break-all">
                                  {trackingData[product.id].raw_data}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        

                        {/* Pricing Breakdown */}
                        {vatTreatments[product.id] && (
                          <div className="mt-6">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Payment Timing Section */}
          {selectedSeller && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <div className="p-1 bg-blue-500/20 rounded">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  Payment Timing
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Choose when payment should be made for all items
                </p>
              </div>
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {["before-shipping", "after-delivery"].map((timing) => (
                    <div 
                      key={timing}
                      className={`flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        paymentTiming[products[0]?.id] === timing
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-slate-200 dark:border-slate-600 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                      onClick={() => {
                        const newPaymentTiming: {[key: string]: string} = {};
                        products.forEach(product => {
                          newPaymentTiming[product.id] = timing;
                        });
                        setPaymentTiming(newPaymentTiming);
                      }}
                    >
                      <div className="relative">
                        <div className={`h-5 w-5 border-2 rounded-full flex items-center justify-center ${
                          paymentTiming[products[0]?.id] === timing
                            ? 'border-primary bg-primary'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {paymentTiming[products[0]?.id] === timing && (
                            <div className="h-2 w-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                          {timing === "before-shipping" ? "Before shipping" : "After delivery"}
                        </Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {timing === "before-shipping" 
                            ? "Payment is made before the item is shipped"
                            : "Payment is made after the item is delivered"
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {selectedSeller && (
            <div className="flex gap-4 pt-6">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)} 
                className="flex-1 h-12 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePurchase}
                disabled={!canSubmit}
                className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canSubmit ? 'Confirm Bulk Purchase' : 'Complete All Fields'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}