import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { productsApi } from "@/lib/api/products";
import { BulkWTBOrderFlow } from "@/components/wtb-order/BulkWTBOrderFlow";

export default function BulkWTBOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productIdsParam = searchParams.get("productIds");

  const productIds = productIdsParam ? productIdsParam.split(',').map(id => id.trim()).filter(Boolean) : [];

  // Debug logs
  console.log('BulkWTBOrder - URL:', window.location.href);
  console.log('BulkWTBOrder - searchParams:', searchParams.toString());
  console.log('BulkWTBOrder - productIdsParam:', productIdsParam);
  console.log('BulkWTBOrder - productIds:', productIds);
  console.log('BulkWTBOrder - productIds.length:', productIds.length);

  const {
    data: orderItemsResponse,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ['bulk-order-items-details', productIdsParam],
    queryFn: () => {
      console.log('Fetching multiple order items for IDs:', productIds.join(','));
      return productsApi.getMultipleOrderItems(productIds.join(','));
    },
    enabled: productIds.length > 0, // Only fetch if productIds are available
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data
  });

  useEffect(() => {
    console.log('BulkWTBOrder useEffect - isError:', isError, 'productIds.length:', productIds.length, 'isLoading:', isLoading);
    
    if (isError) {
      console.log('BulkWTBOrder - API Error occurred:', error);
      toast.error("Error fetching order items", {
        description: error?.message || "An unexpected error occurred.",
      });
      navigate(-1); // Go back on error
    }
    
    // Only redirect if we're not loading and have no product IDs
    if (productIds.length === 0 && !isLoading && !isError) {
      console.log('BulkWTBOrder - No product IDs provided, redirecting...');
      toast.warning("No product IDs provided", {
        description: "Please select products to proceed with a bulk WTB order.",
      });
      navigate(-1); // Go back if no IDs
    }
  }, [isError, error, navigate, productIds.length, isLoading]);

  // Convert API data to product format for BulkWTBOrderFlow
  const products = orderItemsResponse?.data?.order_items?.map(item => {
    const customerDetails = item.customer_details
      ? (typeof item.customer_details === 'string' ? JSON.parse(item.customer_details) : item.customer_details)
      : null;

    return {
      id: item.id.toString(),
      name: item.product_name,
      sku: item.sku || "N/A",
      price: `${item.currency} ${item.price.toFixed(2)}`,
      status: "open" as const, // Assuming a default status
      orderId: item.order_id,
      orderNumber: item.order_number,
      orderUrl: item.order_url,
      variant: item.variant_title,
      vendor: item.vendor,
      quantity: item.quantity,
      totalPrice: item.total_price,
      customerEmail: item.customer_email,
      orderCreatedAt: item.order_created_at,
      currency: item.currency,
      customerName: customerDetails?.first_name && customerDetails?.last_name
        ? `${customerDetails.first_name} ${customerDetails.last_name}`
        : item.customer_name || "N/A",
      customerPhone: customerDetails?.phone || "N/A",
      customerAddress: customerDetails?.default_address ? {
        address1: customerDetails.default_address.address1,
        address2: customerDetails.default_address.address2,
        city: customerDetails.default_address.city,
        province: customerDetails.default_address.province,
        country: customerDetails.default_address.country,
        country_code: customerDetails.default_address.country_code,
        zip: customerDetails.default_address.zip,
        phone: customerDetails.default_address.phone,
      } : null,
      productType: item.product_type,
      barcode: item.barcode,
      weight: item.weight,
      weightUnit: item.weight_unit,
      taxable: item.taxable,
      requiresShipping: item.requires_shipping,
      fulfillmentStatus: item.fulfillment_status,
      taxLines: item.tax_lines,
      netPrice: item.net_price,
      totalDiscount: item.total_discount,
    };
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading bulk order items...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg text-destructive">Error: {error?.message || "Failed to load order items."}</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg text-muted-foreground">No order items found for the given IDs.</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return <BulkWTBOrderFlow products={products} />;
}