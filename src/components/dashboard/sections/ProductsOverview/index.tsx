import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, Filter, Loader2, AlertCircle, WifiOff } from "lucide-react";

import { ProductsTable } from "./ProductsTable";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { Product } from "./types";
import { useToast } from "@/hooks/use-toast";
import { productsApi } from "@/lib/api";
import { OrderItem } from "./types";

export function ProductsOverview() {
  const [searchParams] = useSearchParams();
  const statusFromUrl = searchParams.get("status");
  const vendorFromUrl = searchParams.get("vendor");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [saleChannelFilter, setSaleChannelFilter] = useState<string>("all");
  const [vendorFilter, setVendorFilter] = useState<string>(vendorFromUrl || "all");
  const [showFearOfGodOnly, setShowFearOfGodOnly] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { toast } = useToast();

  // Update filter when URL changes
  useEffect(() => {
    if (statusFromUrl) {
      setSaleChannelFilter(statusFromUrl);
      setCurrentPage(1); // Reset to first page when filter changes
    } else {
      setSaleChannelFilter("all");
    }
  }, [statusFromUrl]);

  // Update vendor filter when URL changes
  useEffect(() => {
    if (vendorFromUrl) {
      setVendorFilter(vendorFromUrl);
      setCurrentPage(1);
    } else {
      setVendorFilter("all");
    }
  }, [vendorFromUrl]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Fetch order items from API
  const {
    data: orderItemsResponse,
    isLoading: isLoadingOrderItems,
    error: orderItemsError,
    refetch: refetchOrderItems,
  } = useQuery({
    queryKey: ['order-items', currentPage, debouncedSearchTerm, saleChannelFilter, vendorFilter],
    queryFn: async () => {
      // If a vendor is specified, we pass it through the status param as requested
      const statusParam = vendorFilter !== "all"
        ? vendorFilter
        : (saleChannelFilter !== "all" ? saleChannelFilter : undefined);

      return await productsApi.getOrderItems(
        currentPage,
        10,
        debouncedSearchTerm || undefined,
        statusParam
      );
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data
  });

  // Convert API order items to UI products
  const apiOrderItems = useMemo(() => {
    if (orderItemsResponse?.data?.order_items) {
      return orderItemsResponse.data.order_items.map((orderItem: OrderItem) => {
        // Parse customer details if available (can be string or object)
        const customerDetails = orderItem.customer_details
          ? (typeof orderItem.customer_details === 'string' 
              ? JSON.parse(orderItem.customer_details) 
              : orderItem.customer_details)
          : null;

        // Use shipping_address first, then fall back to customer_details.default_address
        const shippingAddress = orderItem.shipping_address || customerDetails?.default_address;
        
        // Format customer name
        const customerName = orderItem.customer_name 
          || orderItem.customer
          || (shippingAddress ? `${shippingAddress.first_name} ${shippingAddress.last_name}` : 'N/A');

        return {
          id: orderItem.id.toString(),
          name: orderItem.product_name,
          sku: orderItem.sku === "N/A" ? "N/A" : orderItem.sku,
          category: orderItem.variant.variant || 'N/A',
          price: `${orderItem.currency} ${orderItem.price.toFixed(2)}`,
          stock: orderItem.quantity,
          status: orderItem.status as 'open' | 'sourcing' | 'stock' | 'fliproom_sale' | 'sneakerask' | 'bought' | 'wtb' | 'consignment',
          seller: orderItem.seller,
          shopifyId: orderItem.order_id.toString(),
          orderUrl: orderItem.order_url,
          variant: orderItem.variant.variant || orderItem.variant_title,


          
          orders: [{
            orderId: orderItem.order_id.toString(),
            orderNumber: orderItem.order_number,
            quantity: orderItem.quantity,
            orderDate: new Date().toISOString().split('T')[0],
            customerName: customerName,
            orderTotal: orderItem.price.toString(),
            orderUrl: orderItem.order_url,
          }],
          // New fields from API
          orderId: orderItem.order_id,
          orderNumber: orderItem.order_number,
          currency: orderItem.currency,
          totalPrice: orderItem.total_price || orderItem.price,
          quantity: orderItem.quantity,
          customerName: customerName,
          customerEmail: orderItem.customer_email,
          customerAddress: shippingAddress ? {
            address1: shippingAddress.address1,
            address2: shippingAddress.address2,
            city: shippingAddress.city,
            province: shippingAddress.province,
            country: shippingAddress.country,
            country_code: shippingAddress.country_code,
            zip: shippingAddress.zip,
            phone: shippingAddress.phone,
          } : null,
          destination: orderItem.destination,
          manualStatus: orderItem.manual_status,
          processedAt: orderItem.processed_at,
          shipmentLabel: orderItem.shipment_label,
          hasShipmentLabel: orderItem.has_shipment_label || false,
          vendorName: orderItem.vendor_name || null,
          vendorOrderId: orderItem.vendor_order_id || null,
          vendorPrice: orderItem.vendor_price || null,
        };
      });
    }
    return [];
  }, [orderItemsResponse]);

  // Get unique values for filter dropdowns
  const availableSellers = useMemo(() => {
    return Array.from(new Set(apiOrderItems.map(product => product.seller?.store_name || '--'))).sort();
  }, [apiOrderItems]);

  // Get unique vendor names for filter
  const availableVendors = useMemo(() => {
    return Array.from(
      new Set(
        apiOrderItems
          .map(product => product.vendorName)
          .filter((vendor): vendor is string => vendor !== null && vendor !== undefined)
      )
    ).sort();
  }, [apiOrderItems]);

  const filteredProducts = useMemo(() => {
    // If we have a search term or sale channel filter, the API already filtered the results
    // But we still need to apply vendor filter client-side
    let filtered = apiOrderItems;

    // Apply vendor filter (client-side)
    if (vendorFilter !== "all") {
      filtered = filtered.filter(product => product.vendorName === vendorFilter);
    }

    // Apply Fear of God filter for stock products (case insensitive)
    if (showFearOfGodOnly) {
      filtered = filtered.filter(product => 
        product.status === "stock" && 
        product.name.toLowerCase().includes("fear of god")
      );
    }

    // If we have a search term or sale channel filter, the API already filtered the results
    // So we just return the filtered results
    if (debouncedSearchTerm || saleChannelFilter !== "all") {
      return filtered;
    }
    
    // Only apply client-side filtering when no search/filter is active
    return filtered.filter(product => {
      // Search filter
      const matchesSearch = debouncedSearchTerm === "" || 
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (product.seller?.store_name || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      // Sale channel filter
      const matchesSaleChannel = saleChannelFilter === "all" || product.status === saleChannelFilter;

      return matchesSearch && matchesSaleChannel;
    });
  }, [apiOrderItems, debouncedSearchTerm, saleChannelFilter, vendorFilter, showFearOfGodOnly]);

  const handleAddToCart = (product: Product) => {
    if (!cart.find(item => item.id === product.id)) {
      setCart(prev => [...prev, product]);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const cartTotal = cart.reduce((total, item) => {
    const price = parseFloat(item.price.replace(/[^\d.-]/g, ''));
    return total + price;
  }, 0);

  // Error handling
  const hasError = orderItemsError;
  const isLoading = isLoadingOrderItems;
  const refetch = refetchOrderItems;

  // Show error state
  if (hasError) {
    return (
      <div className="space-y-6">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <WifiOff className="h-6 w-6 text-destructive" />
              <div>
                <h3 className="font-semibold text-destructive">Connection Error</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Something went wrong. Please check your connection and try again.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  className="mt-3"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Bar */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                Search Products
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by product name, SKU, or seller..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Clear Search */}
            {searchTerm && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              </div>
            )}

            {/* Fear of God Filter Toggle */}
            <div className="flex items-end">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fear-of-god-filter"
                  checked={showFearOfGodOnly}
                  onChange={(e) => setShowFearOfGodOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label 
                  htmlFor="fear-of-god-filter" 
                  className="text-sm font-medium cursor-pointer whitespace-nowrap"
                >
                  Show only Fear of God (Stock)
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredProducts.length} of {orderItemsResponse?.data?.pagination?.total || 0} products
          {isLoading && (
            <span className="ml-2 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading...
            </span>
          )}
        </span>
        {(searchTerm || saleChannelFilter !== "all" || vendorFilter !== "all" || showFearOfGodOnly) && (
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span>Filters active</span>
          </div>
        )}
      </div>

      {/* No Records State */}
      {!isLoading && filteredProducts.length === 0 && (
        <Card className="bg-muted/20 border-border">
          <CardContent className="p-8">
            <div className="text-center space-y-3">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">No Products Found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || saleChannelFilter !== "all" || vendorFilter !== "all" || showFearOfGodOnly
                  ? "No products match your current filters."
                  : "No products available at the moment."
                }
              </p>
              {(searchTerm || saleChannelFilter !== "all" || vendorFilter !== "all" || showFearOfGodOnly) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSaleChannelFilter("all");
                    setVendorFilter("all");
                    setShowFearOfGodOnly(false);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {!isLoading && filteredProducts.length > 0 && (
        <ProductsTable
          products={filteredProducts}
          onAddToCart={handleAddToCart}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={orderItemsResponse?.data?.pagination?.last_page || 1}
          onPageChange={setCurrentPage}
          totalItems={orderItemsResponse?.data?.pagination?.total || 0}
          itemsPerPage={orderItemsResponse?.data?.pagination?.per_page || 10}
          onRefetch={refetchOrderItems}
          showVendorColumns={vendorFilter !== "all"}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading products...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-xl border-0 min-w-64">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm">WTB Cart</p>
                  <p className="text-xs opacity-90">
                    {cart.length} item{cart.length > 1 ? 's' : ''} • EUR{cartTotal.toFixed(2)}
                  </p>
                </div>
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // Get product IDs from cart
                    console.log('Cart items:', cart);
                    const productIds = cart.map(item => item.id).join(',');
                    console.log('Cart product IDs:', productIds);
                    console.log('Cart length:', cart.length);
                    
                    // Navigate to bulk WTB order with product IDs
                    window.location.href = `/bulk-wtb-order?productIds=${productIds}`;
                  }}
                  className="bg-white text-primary hover:bg-white/90 transition-all duration-300 font-semibold"
                >
                  Proceed to WTB
                </Button>
              </div>
              
              {/* Cart Items Preview */}
              <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-white/10 rounded p-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="opacity-75">{item.price}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="text-white hover:bg-white/20 h-6 w-6 p-0 ml-2"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}