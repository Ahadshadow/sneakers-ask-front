import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { HeaderActions } from "./HeaderActions";
import { ProductsTable } from "./ProductsTable";
import { mockProducts } from "./mockData";

export function ProductsOverview() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <SearchBar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
        />
        <HeaderActions />
      </div>

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
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}