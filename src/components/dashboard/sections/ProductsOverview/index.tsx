import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Loader2, AlertCircle, WifiOff, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { ProductsTable } from "./ProductsTable";
import { Product } from "./types";
import { useToast } from "@/hooks/use-toast";
import { productsApi } from "@/lib/api";
import { OrderItem } from "./types";

export function ProductsOverview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const statusFromUrl = searchParams.get("status");
  const vendorFromUrl = searchParams.get("vendor");
  const trackingStatusFromUrl = searchParams.get("tracking");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [saleChannelFilter, setSaleChannelFilter] = useState<string>("all");
  const [vendorFilter, setVendorFilter] = useState<string>(vendorFromUrl || "all");
  const [trackingStatusFilter, setTrackingStatusFilter] = useState<string>(trackingStatusFromUrl || "all");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [cart, setCart] = useState<Product[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  // Update filter when URL changes
  useEffect(() => {
    if (statusFromUrl) {
      setSaleChannelFilter(statusFromUrl);
    } else {
      setSaleChannelFilter("all");
    }
  }, [statusFromUrl]);

  // Update vendor filter when URL changes
  useEffect(() => {
    if (vendorFromUrl) {
      setVendorFilter(vendorFromUrl);
    } else {
      setVendorFilter("all");
    }
  }, [vendorFromUrl]);

  // Update tracking status filter when URL changes
  useEffect(() => {
    if (trackingStatusFromUrl) {
      setTrackingStatusFilter(trackingStatusFromUrl);
    } else {
      setTrackingStatusFilter("all");
    }
  }, [trackingStatusFromUrl]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Fetch order items from API with infinite scroll
  const {
    data: orderItemsResponse,
    isLoading: isLoadingOrderItems,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: orderItemsError,
    refetch: refetchOrderItems,
  } = useInfiniteQuery({
    queryKey: ['order-items', debouncedSearchTerm, saleChannelFilter, vendorFilter, fromDate, toDate, trackingStatusFilter],
    queryFn: async ({ pageParam = 1 }) => {
      // If a vendor is specified, we pass it through the status param as requested
      const statusParam = vendorFilter !== "all"
        ? vendorFilter
        : (saleChannelFilter !== "all" ? saleChannelFilter : undefined);

      // Format dates as YYYY-MM-DD
      const fromDateStr = fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined;
      const toDateStr = toDate ? format(toDate, 'yyyy-MM-dd') : undefined;

      // Get tracking status filter
      const trackingStatusParam = trackingStatusFilter !== "all" ? trackingStatusFilter : undefined;

      return await productsApi.getOrderItems(
        pageParam,
        10,
        debouncedSearchTerm || undefined,
        statusParam,
        fromDateStr,
        toDateStr,
        trackingStatusParam
      );
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.data?.pagination?.current_page || 1;
      const lastPageNum = lastPage?.data?.pagination?.last_page || 1;
      return currentPage < lastPageNum ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Convert API order items to UI products - accumulate all pages
  const apiOrderItems = useMemo(() => {
    if (!orderItemsResponse?.pages) return [];
    
    // Flatten all pages into a single array
    const allOrderItems = orderItemsResponse.pages.flatMap(
      (page) => page?.data?.order_items || []
    );

    return allOrderItems.map((orderItem: OrderItem) => {
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
          buyPrice: (orderItem.vendor_name || orderItem.vendor_order_id) 
            ? (orderItem.vendor_price || null)
            : (orderItem.payout_price || null),
        };
      });
  }, [orderItemsResponse]);

  // Get tracking status options from API response with counts (from first page)
  const trackingStatusOptions = useMemo(() => {
    const firstPage = orderItemsResponse?.pages?.[0];
    if (firstPage?.data?.tracking_status_options && Array.isArray(firstPage.data.tracking_status_options)) {
      return firstPage.data.tracking_status_options;
    }
    return [];
  }, [orderItemsResponse]);

  // Extract unique tracking statuses from API response, filtered and sorted by length (shortest first)
  const uniqueTrackingStatuses = useMemo(() => {
    return trackingStatusOptions
      .filter(option => option.status && option.status.trim() !== "")
      .map(option => option.status)
      .sort((a, b) => a.length - b.length);
  }, [trackingStatusOptions]);

  // Create counts map from API response
  const trackingStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    trackingStatusOptions.forEach(option => {
      counts[option.status] = option.count;
    });
    return counts;
  }, [trackingStatusOptions]);

  // Handle tracking status change and update URL
  const handleTrackingStatusChange = (status: string) => {
    setTrackingStatusFilter(status);
    
    // Update URL
    const newSearchParams = new URLSearchParams(searchParams);
    if (status === "all") {
      newSearchParams.delete("tracking");
    } else {
      newSearchParams.set("tracking", status);
    }
    navigate(`/products?${newSearchParams.toString()}`, { replace: true });
  };

  // Get unique values for filter dropdowns
  const availableSellers = useMemo(() => {
    return Array.from(new Set(apiOrderItems.map(product => product.seller?.owner_name || '--'))).sort();
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
        (product.seller?.owner_name || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      // Sale channel filter
      const matchesSaleChannel = saleChannelFilter === "all" || product.status === saleChannelFilter;

      return matchesSearch && matchesSaleChannel;
    });
  }, [apiOrderItems, debouncedSearchTerm, saleChannelFilter, vendorFilter]);

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
      {/* Tracking Status Tabs - At the top */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading tracking statuses...
            </div>
          ) : uniqueTrackingStatuses.length > 0 ? (
            <div className="w-full">
              <Tabs 
                value={trackingStatusFilter} 
                onValueChange={handleTrackingStatusChange}
                className="w-full"
              >
                <TabsList className="w-full justify-start overflow-x-auto h-auto p-0 bg-transparent gap-1">
                  <TabsTrigger 
                    value="all" 
                    className={cn(
                      "h-10 px-4 rounded-lg border-2 transition-all",
                      "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-sm",
                      "data-[state=inactive]:bg-background data-[state=inactive]:text-foreground data-[state=inactive]:border-border data-[state=inactive]:hover:bg-muted"
                    )}
                  >
                    <span className="font-medium">All</span>
                  </TabsTrigger>
                  {uniqueTrackingStatuses.map((status) => {
                    const count = trackingStatusCounts[status] || 0;
                    const isActive = trackingStatusFilter === status;
                    return (
                      <TabsTrigger 
                        key={status}
                        value={status}
                        className={cn(
                          "h-10 px-4 rounded-lg border-2 transition-all",
                          "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-sm",
                          "data-[state=inactive]:bg-background data-[state=inactive]:text-foreground data-[state=inactive]:border-border data-[state=inactive]:hover:bg-muted"
                        )}
                      >
                        <span className="font-medium">{status}</span>
                        {count > 0 && (
                          <Badge 
                            variant={isActive ? "default" : "secondary"} 
                            className={cn(
                              "ml-2 h-5 min-w-[24px] flex items-center justify-center px-1.5 text-xs font-semibold",
                              isActive ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"
                            )}
                          >
                            {count}
                          </Badge>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              No tracking statuses available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
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
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 sm:flex-initial">
                <Label className="text-sm font-medium mb-2 block">From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full sm:w-[180px] justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "MMM dd, yyyy") : "Select from date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 sm:flex-initial">
                <Label className="text-sm font-medium mb-2 block">To Date</Label>
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full sm:w-[180px] justify-start text-left font-normal",
                          !toDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {toDate ? format(toDate, "MMM dd, yyyy") : "Select to date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={setToDate}
                        initialFocus
                        className="p-3"
                        disabled={(date) => fromDate ? date < fromDate : false}
                      />
                    </PopoverContent>
                  </Popover>
                  {/* Clear Date Range - Under To Date */}
                  {(fromDate || toDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFromDate(undefined);
                        setToDate(undefined);
                      }}
                      className="text-muted-foreground hover:text-foreground h-7 w-full sm:w-[180px]"
                    >
                      Clear Dates
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredProducts.length} of {orderItemsResponse?.pages?.[0]?.data?.pagination?.total || 0} products
          {isLoading && (
            <span className="ml-2 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading...
            </span>
          )}
        </span>
        {(searchTerm || saleChannelFilter !== "all" || vendorFilter !== "all" || fromDate || toDate) && (
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
                {searchTerm || saleChannelFilter !== "all" || vendorFilter !== "all" || fromDate || toDate
                  ? "No products match your current filters."
                  : "No products available at the moment."
                }
              </p>
              {(searchTerm || saleChannelFilter !== "all" || vendorFilter !== "all" || fromDate || toDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSaleChannelFilter("all");
                    setVendorFilter("all");
                    setFromDate(undefined);
                    setToDate(undefined);
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
        <>
          <ProductsTable
            products={filteredProducts}
            onAddToCart={handleAddToCart}
            isLoading={isLoading}
            onRefetch={refetchOrderItems}
            showVendorColumns={true}
          />
          {/* Infinite scroll trigger */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="h-20 flex items-center justify-center py-4">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading more products...
                </div>
              )}
            </div>
          )}
          {!hasNextPage && filteredProducts.length > 0 && (
            <div className="h-10 flex items-center justify-center py-4">
              <p className="text-sm text-muted-foreground">
                All products loaded
              </p>
            </div>
          )}
        </>
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