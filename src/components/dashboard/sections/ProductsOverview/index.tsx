import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingCart, Search, CalendarIcon, Filter, Loader2, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { ProductsTable } from "./ProductsTable";
import { BoughtItemsGrid } from "./BoughtItemsGrid";
import { mockProducts } from "./mockData";
import { Product, WTBPurchase } from "./types";
import { useToast } from "@/hooks/use-toast";
import { productsApi, OrderItem } from "@/lib/api";

export function ProductsOverview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [purchases, setPurchases] = useState<WTBPurchase[]>([]);
  const [activeTab, setActiveTab] = useState("products");
  const [cart, setCart] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [useOrderItems, setUseOrderItems] = useState(true); // Use order-items API by default
  
  const { toast } = useToast();

  // Fetch order items from API
  const {
    data: orderItemsResponse,
    isLoading: isLoadingOrderItems,
    error: orderItemsError,
    refetch: refetchOrderItems,
  } = useQuery({
    queryKey: ['order-items', currentPage, searchTerm, sellerFilter],
    queryFn: async () => {
      if (searchTerm) {
        return await productsApi.searchOrderItems(searchTerm, currentPage);
      } else if (sellerFilter !== "all") {
        return await productsApi.getOrderItemsByVendor(sellerFilter, currentPage);
      } else {
        return await productsApi.getOrderItems(currentPage);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: useOrderItems, // Only run when useOrderItems is true
  });

  // Fetch products from API (fallback)
  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['products', currentPage, searchTerm, statusFilter, sellerFilter],
    queryFn: async () => {
      if (searchTerm) {
        return await productsApi.searchProducts(searchTerm, currentPage);
      } else if (statusFilter !== "all") {
        return await productsApi.getProductsByStatus(statusFilter, currentPage);
      } else if (sellerFilter !== "all") {
        return await productsApi.getProductsByVendor(sellerFilter, currentPage);
      } else {
        return await productsApi.getProducts(currentPage);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !useOrderItems, // Only run when useOrderItems is false
  });

  // Convert API order items to UI products
  const apiOrderItems = useMemo(() => {
    if (orderItemsResponse?.data?.order_items) {
      return orderItemsResponse.data.order_items.map((orderItem: OrderItem) => ({
        id: orderItem.id.toString(),
        name: orderItem.product_name,
        sku: orderItem.sku === "N/A" ? "N/A" : orderItem.sku,
        category: orderItem.variant.variant || 'N/A',
        price: `${orderItem.currency} ${orderItem.price.toFixed(2)}`,
        stock: orderItem.quantity,
        status: 'open' as const,
        seller: orderItem.vendor,
        shopifyId: orderItem.order_id.toString(),
        orderUrl: orderItem.order_url, // Use the order_url from API
        variant: orderItem.variant.variant, // Add variant information
        orders: [{
          orderId: orderItem.order_id.toString(),
          orderNumber: `ORD-${orderItem.order_id}`,
          quantity: orderItem.quantity,
          orderDate: new Date().toISOString().split('T')[0],
          customerName: 'Customer',
          orderTotal: orderItem.price.toString(),
          orderUrl: orderItem.order_url, // Use the order_url from API
        }],
      }));
    }
    return [];
  }, [orderItemsResponse]);

  // Convert API products to UI products (existing logic)
  const apiProducts = useMemo(() => {
    if (productsResponse?.data?.products) {
      return productsResponse.data.products.map(apiProduct => ({
        id: apiProduct.id.toString(),
        name: apiProduct.name,
        sku: apiProduct.sku || 'N/A',
        category: apiProduct.product_type,
        price: `${apiProduct.currency} ${apiProduct.price}`,
        stock: apiProduct.variants_count,
        status: apiProduct.status === 'active' ? 'open' : 'fliproom_sale' as const,
        seller: apiProduct.vendor,
        shopifyId: apiProduct.shopify_id.toString(),
        orderUrl: apiProduct.order_status_urls?.[0] || undefined,
        variant: undefined, // No variant info for products API
        orders: apiProduct.order_item_ids.map((orderId, index) => ({
          orderId: orderId.toString(),
          orderNumber: `ORD-${orderId}`,
          quantity: 1,
          orderDate: apiProduct.created_at,
          customerName: 'Customer',
          orderTotal: apiProduct.price,
          orderUrl: apiProduct.order_status_urls?.[index] || undefined,
        })),
      }));
    }
    return [];
  }, [productsResponse]);

  // Determine which data to use
  const allProducts = useMemo(() => {
    if (useOrderItems) {
      return apiOrderItems; // Remove fallback to mockProducts
    } else {
      return apiProducts; // Remove fallback to mockProducts
    }
  }, [useOrderItems, apiOrderItems, apiProducts]);

  // Get unique values for filter dropdowns
  const availableSellers = useMemo(() => {
    return Array.from(new Set(allProducts.map(product => product.seller))).sort();
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;

      // Seller filter
      const matchesSeller = sellerFilter === "all" || product.seller === sellerFilter;

      // Date filter
      const productDate = new Date();
      const matchesDateFrom = !dateFrom || productDate >= dateFrom;
      const matchesDateTo = !dateTo || productDate <= dateTo;

      return matchesSearch && matchesStatus && matchesSeller && matchesDateFrom && matchesDateTo;
    });
  }, [allProducts, searchTerm, statusFilter, sellerFilter, dateFrom, dateTo]);

  const handleAddToCart = (product: Product) => {
    if (!cart.find(item => item.id === product.id)) {
      setCart(prev => [...prev, product]);
      toast({
        title: "Added to Cart",
        description: `${product.name} added to WTB cart`,
      });
    } else {
      toast({
        title: "Already in Cart",
        description: `${product.name} is already in your WTB cart`,
        variant: "destructive"
      });
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    toast({
      title: "Removed from Cart",
      description: "Item removed from WTB cart",
    });
  };

  const cartTotal = cart.reduce((total, item) => {
    const price = parseFloat(item.price.replace(/[^\d.-]/g, ''));
    return total + price;
  }, 0);

  // Error handling
  const hasError = useOrderItems ? orderItemsError : productsError;
  const isLoading = useOrderItems ? isLoadingOrderItems : isLoadingProducts;
  const refetch = useOrderItems ? refetchOrderItems : refetchProducts;

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
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {useOrderItems ? 'Order Items' : 'Products'} ({filteredProducts.length})
          </TabsTrigger>
          <TabsTrigger value="bought" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Bought Items ({purchases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4 sm:space-y-6">
          {/* Filter System */}
          <Card className="bg-gradient-card border-border shadow-soft">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                    Search {useOrderItems ? 'Order Items' : 'Products'}
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder={`Search by ${useOrderItems ? 'product name, SKU, or vendor' : 'product name, SKU, or seller'}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter - Only show for Products API */}
                {!useOrderItems && (
                  <div>
                    <Label htmlFor="status" className="text-sm font-medium mb-2 block">
                      Status
                    </Label>
                    <select
                      id="status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="all">All Status</option>
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                )}

                {/* Seller/Vendor Filter */}
                <div>
                  <Label htmlFor="seller" className="text-sm font-medium mb-2 block">
                    {useOrderItems ? 'Vendor' : 'Seller'}
                  </Label>
                  <select
                    id="seller"
                    value={sellerFilter}
                    onChange={(e) => setSellerFilter(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="all">All {useOrderItems ? 'Vendors' : 'Sellers'}</option>
                    {availableSellers.map(seller => (
                      <option key={seller} value={seller}>{seller}</option>
                    ))}
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[140px] justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date To */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[140px] justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "MMM dd") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setSellerFilter("all");
                      setDateFrom(undefined);
                      setDateTo(undefined);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredProducts.length} of {allProducts.length} {useOrderItems ? 'order items' : 'products'}
              {isLoading && (
                <span className="ml-2 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading...
                </span>
              )}
            </span>
            {(searchTerm || statusFilter !== "all" || sellerFilter !== "all" || dateFrom || dateTo) && (
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
                  <h3 className="text-lg font-semibold text-foreground">No Records Found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || statusFilter !== "all" || sellerFilter !== "all" || dateFrom || dateTo
                      ? `No ${useOrderItems ? 'order items' : 'products'} match your current filters.`
                      : `No ${useOrderItems ? 'order items' : 'products'} available at the moment.`
                    }
                  </p>
                  {(searchTerm || statusFilter !== "all" || sellerFilter !== "all" || dateFrom || dateTo) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setSellerFilter("all");
                        setDateFrom(undefined);
                        setDateTo(undefined);
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
            <Card className="bg-gradient-card border-border shadow-soft animate-scale-in">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-foreground">
                      {useOrderItems ? 'Order Items Overview' : 'Shopify Products Overview'}
                    </span>
                    <p className="text-xs sm:text-sm font-normal text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">
                      {useOrderItems 
                        ? 'Browse and manage order items from vendors'
                        : 'Browse and purchase shoes from sellers'
                      }
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ProductsTable
                  products={filteredProducts}
                  onAddToCart={handleAddToCart}
                />
                
                {/* Summary */}
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Total {useOrderItems ? 'order items' : 'products'} displayed: <span className="font-medium text-foreground">{filteredProducts.length}</span>
                    {(searchTerm || statusFilter !== "all" || sellerFilter !== "all" || dateFrom || dateTo) && (
                      <span className="ml-2 text-primary">(filtered from {allProducts.length})</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <Card className="bg-gradient-card border-border shadow-soft">
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Loading {useOrderItems ? 'order items' : 'products'}...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bought" className="space-y-4 sm:space-y-6">
          <BoughtItemsGrid purchases={purchases} />
        </TabsContent>
      </Tabs>

      {/* Floating Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-xl border-0 min-w-64">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm">WTB Cart</p>
                  <p className="text-xs opacity-90">
                    {cart.length} item{cart.length > 1 ? 's' : ''} • €{cartTotal.toFixed(2)}
                  </p>
                </div>
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    sessionStorage.setItem('wtb-cart', JSON.stringify(cart));
                    window.location.href = '/bulk-wtb-order';
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