import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { HeaderActions } from "./HeaderActions";
import { ProductsTable } from "./ProductsTable";
import { FilterSystem, FilterOptions } from "./FilterSystem";
import { mockProducts } from "./mockData";

export function ProductsOverview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    minPrice: "",
    maxPrice: "",
    seller: "all"
  });

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

      // Price filter
      const productPrice = parseFloat(product.price.replace('$', ''));
      const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
      const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
      const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;

      return matchesSearch && matchesStatus && matchesSeller && matchesPrice;
    });
  }, [searchTerm, filters]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <SearchBar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
        />
        <HeaderActions />
      </div>

      {/* Filter System */}
      <FilterSystem 
        filters={filters}
        onFiltersChange={setFilters}
        availableSellers={availableSellers}
      />

      {/* Main Content */}
      <Card className="bg-gradient-card border-border shadow-soft animate-scale-in">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-foreground">Shopify Products Overview</span>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                Manage and monitor your product inventory
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ProductsTable products={filteredProducts} />
          
          {/* Results Summary */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> of{" "}
              <span className="font-medium text-foreground">{mockProducts.length}</span> products
              {(searchTerm || Object.entries(filters).some(([key, value]) => {
                if (key === 'minPrice' || key === 'maxPrice') return value !== "";
                return value !== "all";
              })) && (
                <span className="ml-2 text-primary">(filtered)</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}