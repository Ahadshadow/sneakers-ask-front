import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Package, ShoppingCart, Plus, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { Product } from "./types";
import { toast } from "@/components/ui/use-toast";

interface ProductsTableProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function ProductsTable({ 
  products, 
  onAddToCart, 
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
  onPageChange: externalOnPageChange,
  totalItems: externalTotalItems,
  itemsPerPage: externalItemsPerPage
}: ProductsTableProps) {
  const navigate = useNavigate();
  const [unlockedProducts, setUnlockedProducts] = useState<Set<string>>(new Set());
  
  // Use external pagination if provided, otherwise use local pagination
  const currentPage = externalCurrentPage || 1;
  const totalPages = externalTotalPages || Math.ceil(products.length / 10);
  const onPageChange = externalOnPageChange || (() => {});
  const totalItems = externalTotalItems || products.length;
  const itemsPerPage = externalItemsPerPage || 10;

  // If external pagination is provided, show all products (API already paginated)
  // Otherwise, use local pagination
  const paginatedProducts = useMemo(() => {
    if (externalCurrentPage !== undefined) {
      // API pagination - show all products as they're already paginated
      return products;
    } else {
      // Local pagination - slice products
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return products.slice(startIndex, endIndex);
    }
  }, [products, currentPage, itemsPerPage, externalCurrentPage]);
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "open": 
        return "bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/25 px-3 py-1 rounded-full";
      case "fliproom_sale": 
        return "bg-blue-500/15 text-blue-600 border-blue-500/30 hover:bg-blue-500/25 px-3 py-1 rounded-full";
      case "sneakerask": 
        return "bg-primary/15 text-primary border-primary/30 hover:bg-primary/25 px-3 py-1 rounded-full";
      default: 
        return "bg-muted text-muted-foreground border-border px-3 py-1 rounded-full";
    }
  };

  const handleShopifyOrdersClick = (product: Product) => {
    // Check if product has order URL from API
    if (product.orderUrl) {
      // Use the order URL from API
      window.open(product.orderUrl, '_blank');
      toast({
        title: "Opening Order",
        description: "Redirecting to order details...",
      });
    } else if (product.orders.length > 0 && product.orders[0].orderUrl) {
      // Use the first order's URL if available
      window.open(product.orders[0].orderUrl, '_blank');
      toast({
        title: "Opening Order",
        description: "Redirecting to order details...",
      });
    } else {
      // Fallback to default Shopify admin URL
      const shopifyDomain = "your-store.myshopify.com";
      const url = `https://${shopifyDomain}/admin/orders?query=product_id:${product.shopifyId}`;
      window.open(url, '_blank');
      toast({
        title: "Opening Orders",
        description: "Redirecting to Shopify admin...",
      });
    }
  };

  const handleWTBClick = (product: Product) => {
    navigate(`/wtb-order?productId=${product.id}`);
  };

  const handleUnlockWTB = (productId: string) => {
    setUnlockedProducts(prev => new Set([...prev, productId]));
  };

  const isWTBLocked = (product: Product) => {
    return (product.status === "fliproom_sale" || product.status === "sneakerask") && 
           !unlockedProducts.has(product.id);
  };

  return (
    <div className="rounded-lg border border-border bg-gradient-card shadow-soft overflow-hidden">
      <div className="overflow-x-auto hide-scrollbar">
        <div className="max-h-[400px] sm:max-h-[600px] overflow-y-auto hide-scrollbar">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/5">
            <TableHead className="font-semibold text-foreground text-sm">Product</TableHead>
            <TableHead className="font-semibold text-foreground text-sm">Price</TableHead>
            <TableHead className="font-semibold text-foreground text-sm hidden md:table-cell">Orders</TableHead>
            <TableHead className="font-semibold text-foreground text-sm hidden lg:table-cell">Status</TableHead>
            <TableHead className="font-semibold text-foreground text-sm text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedProducts.map((product, index) => (
            <TableRow 
              key={product.id} 
              className="border-border hover:bg-muted/10 transition-colors duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="py-3 sm:py-4">
                <div className="space-y-1">
                  <p className="font-medium text-foreground leading-none text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{product.name}</p>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      SKU: {product.sku}
                      {product.variant && product.variant !== 'N/A' && (
                        <span className="text-muted-foreground ml-2">
                          | Variant: {product.variant}
                        </span>
                      )}
                    </p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`lg:hidden mt-1 text-xs font-medium border-0 ${getStatusBadgeClass(product.status)}`}
                  >
                    {product.status.replace('_', ' ')}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="py-3 sm:py-4">
                <span className="font-semibold text-foreground text-base sm:text-lg">{product.price}</span>
              </TableCell>
              <TableCell className="py-3 sm:py-4 hidden md:table-cell">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleShopifyOrdersClick(product)}
                  className="h-7 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-2 hover-scale transition-all duration-200 border-primary/20 hover:border-primary/40"
                >
                  <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                  <span className="text-xs sm:text-sm font-medium">
                    {product.orders.length > 0 ? 
                      `${product.orders.length} order${product.orders.length > 1 ? 's' : ''}` : 
                      'View orders'
                    }
                  </span>
                  <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-60" />
                </Button>
              </TableCell>
              <TableCell className="py-3 sm:py-4 hidden lg:table-cell">
                <Badge 
                  variant="outline" 
                  className={`font-medium border-0 ${getStatusBadgeClass(product.status)}`}
                >
                  {product.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="py-3 sm:py-4">
                <div className="flex gap-2 justify-end min-w-[120px]">
                  {product.status === "open" && onAddToCart && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onAddToCart(product)}
                        className="h-8 px-2 sm:px-3 gap-1 sm:gap-2 hover-scale transition-all duration-200 border-primary/30 hover:border-primary text-primary hover:bg-primary/10"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium hidden sm:inline">Cart</span>
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleWTBClick(product)}
                        className="h-8 px-2 sm:px-3 gap-1 sm:gap-2 hover-scale transition-all duration-200"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium hidden sm:inline">WTB</span>
                      </Button>
                    </>
                  )}
                  {product.status !== "open" && (
                    <>
                      {isWTBLocked(product) ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUnlockWTB(product.id)}
                          className="h-8 px-2 sm:px-3 gap-1 sm:gap-2 hover-scale transition-all duration-200 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:border-amber-500"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Unlock WTB</span>
                        </Button>
                      ) : (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleWTBClick(product)}
                          className="h-8 px-2 sm:px-3 gap-1 sm:gap-2 hover-scale transition-all duration-200"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">WTB</span>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
        </div>
      </div>
    </div>
  );
}