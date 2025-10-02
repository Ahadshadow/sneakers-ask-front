import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Package, Search, CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { ProductsTable } from "./ProductsTable";
import { mockProducts } from "./mockData";
import { Product } from "./types";
import { useToast } from "@/hooks/use-toast";

export function ProductsOverview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [cart, setCart] = useState<Product[]>([]);
  
  const { toast } = useToast();

  // Get unique values for filter dropdowns
  const availableSellers = useMemo(() => {
    return Array.from(new Set(mockProducts.map(product => product.seller))).sort();
  }, []);

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;

      // Seller filter
      const matchesSeller = sellerFilter === "all" || product.seller === sellerFilter;

      // Date filter (if product has a date field)
      const productDate = new Date(); // Assuming current date for products
      const matchesDateFrom = !dateFrom || productDate >= dateFrom;
      const matchesDateTo = !dateTo || productDate <= dateTo;

      return matchesSearch && matchesStatus && matchesSeller && matchesDateFrom && matchesDateTo;
    });
  }, [searchTerm, statusFilter, sellerFilter, dateFrom, dateTo]);

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
    const price = parseFloat(item.price.replace('€', ''));
    return total + price;
  }, 0);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Filters */}
          <Card className="bg-gradient-card border-border shadow-soft">
            <CardContent className="p-4">
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

                {/* Status Filter */}
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

                {/* Seller Filter */}
                <div>
                  <Label htmlFor="seller" className="text-sm font-medium mb-2 block">
                    Seller
                  </Label>
                  <select
                    id="seller"
                    value={sellerFilter}
                    onChange={(e) => setSellerFilter(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="all">All Sellers</option>
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
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>
          Showing {filteredProducts.length} of {mockProducts.length} products
        </span>
        {(searchTerm || statusFilter !== "all" || sellerFilter !== "all" || dateFrom || dateTo) && (
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span>Filters active</span>
          </div>
        )}
      </div>

      {/* Products Table */}
      <ProductsTable
        products={filteredProducts}
        onAddToCart={handleAddToCart}
      />
      
      {/* Products Summary */}
      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          Total products displayed: <span className="font-medium text-foreground">{filteredProducts.length}</span>
          {(searchTerm || statusFilter !== "all" || sellerFilter !== "all" || dateFrom || dateTo) && (
            <span className="ml-2 text-primary">(filtered from {mockProducts.length})</span>
          )}
        </p>
      </div>

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