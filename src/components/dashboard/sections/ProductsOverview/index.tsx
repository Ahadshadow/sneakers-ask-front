import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingCart } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { HeaderActions } from "./HeaderActions";
import { ProductsTable } from "./ProductsTable";
import { FilterSystem, FilterOptions } from "./FilterSystem";
import { BoughtItemsGrid } from "./BoughtItemsGrid";
import { mockProducts } from "./mockData";
import { Product, WTBPurchase } from "./types";
import { useToast } from "@/hooks/use-toast";

export function ProductsOverview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    seller: "all"
  });
  const [purchases, setPurchases] = useState<WTBPurchase[]>([]);
  const [activeTab, setActiveTab] = useState("products");
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
      const matchesStatus = filters.status === "all" || product.status === filters.status;

      // Seller filter
      const matchesSeller = filters.seller === "all" || product.seller === filters.seller;

      return matchesSearch && matchesStatus && matchesSeller;
    });
  }, [searchTerm, filters]);

  const handleAddToCart = (product: Product) => {
    if (!cart.find(item => item.id === product.id)) {
      setCart(prev => [...prev, product]);
      toast({
        title: "Added to Cart",
        description: `${product.name} added to WTB cart`,
      });
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products ({filteredProducts.length})
          </TabsTrigger>
          <TabsTrigger value="bought" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Bought Items ({purchases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <SearchBar 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
            />
            <HeaderActions 
              cartCount={cart.length}
              cart={cart}
            />
          </div>

          {/* Filter System */}
          <FilterSystem 
            filters={filters}
            onFiltersChange={setFilters}
            availableSellers={availableSellers}
          />

          {/* Main Content */}
          <Card className="bg-gradient-card border-border shadow-soft animate-scale-in">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <span className="text-foreground">Shopify Products Overview</span>
                  <p className="text-xs sm:text-sm font-normal text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">
                    Browse and purchase shoes from sellers
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ProductsTable
                products={filteredProducts}
                onAddToCart={handleAddToCart}
                cart={cart}
              />
              
              {/* Results Summary */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> of{" "}
                  <span className="font-medium text-foreground">{mockProducts.length}</span> products
                  {(searchTerm || Object.entries(filters).some(([key, value]) => value !== "all")) && (
                    <span className="ml-2 text-primary">(filtered)</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bought" className="space-y-4 sm:space-y-6">
          <BoughtItemsGrid purchases={purchases} />
        </TabsContent>
      </Tabs>

    </div>
  );
}