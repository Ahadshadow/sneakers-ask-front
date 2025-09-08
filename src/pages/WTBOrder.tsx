import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { WTBOrderFlow } from "@/components/wtb-order/WTBOrderFlow";
import { productsApi } from "@/lib/api/products";

export default function WTBOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  
  // Fetch product details from API
  const {
    data: productDetailsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['order-item-details', productId],
    queryFn: () => productsApi.getOrderItemDetails(Number(productId)),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Convert API data to product format
  const product = productDetailsResponse?.data?.order_item ? {
    id: productDetailsResponse.data.order_item.id.toString(),
    name: productDetailsResponse.data.order_item.product_name,
    sku: productDetailsResponse.data.order_item.sku || "N/A",
    price: `${productDetailsResponse.data.order_item.currency} ${productDetailsResponse.data.order_item.price.toFixed(2)}`,
    status: "open" as const,
    // Additional details from API
    orderId: productDetailsResponse.data.order_item.order_id,
    orderNumber: productDetailsResponse.data.order_item.order_number,
    orderUrl: productDetailsResponse.data.order_item.order_url,
    variant: productDetailsResponse.data.order_item.variant_title,
    vendor: productDetailsResponse.data.order_item.vendor,
    quantity: productDetailsResponse.data.order_item.quantity,
    totalPrice: productDetailsResponse.data.order_item.total_price,
    customerEmail: productDetailsResponse.data.order_item.customer_email,
    orderCreatedAt: productDetailsResponse.data.order_item.order_created_at,
  } : null;

  useEffect(() => {
    if (!productId) {
      toast.error("Product ID not found");
      navigate(-1);
      return;
    }

    if (error) {
      toast.error("Failed to load product details");
      navigate(-1);
      return;
    }
  }, [productId, error, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </div>
    );
  }

  return <WTBOrderFlow product={product} />;
}