import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, MoreHorizontal, Package, ShoppingCart, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "./types";

interface ProductsTableProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  cart?: Product[];
}

export function ProductsTable({ products, onAddToCart, cart = [] }: ProductsTableProps) {
  const navigate = useNavigate();
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open": return "secondary";
      case "fliproom_sale": return "outline";
      case "sneakerask": return "default";
      default: return "outline";
    }
  };

  const handleShopifyOrdersClick = (product: Product) => {
    // In a real app, you would integrate with Shopify API
    // For now, we'll open Shopify admin in a new tab
    const shopifyDomain = "your-store.myshopify.com"; // This would come from your config
    const url = `https://${shopifyDomain}/admin/orders?query=product_id:${product.shopifyId}`;
    window.open(url, '_blank');
  };

  const handleWTBClick = (product: Product) => {
    navigate(`/wtb-order?productId=${product.id}`);
  };

  return (
    <div className="rounded-lg border border-border bg-gradient-card shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <div className="max-h-[400px] sm:max-h-[600px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/5">
            <TableHead className="font-semibold text-foreground text-sm">Product</TableHead>
            <TableHead className="font-semibold text-foreground text-sm">Price</TableHead>
            <TableHead className="font-semibold text-foreground text-sm hidden md:table-cell">Orders</TableHead>
            <TableHead className="font-semibold text-foreground text-sm hidden lg:table-cell">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow 
              key={product.id} 
              className="border-border hover:bg-muted/10 transition-colors duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="py-3 sm:py-4">
                <div className="space-y-1">
                  <p className="font-medium text-foreground leading-none text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{product.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">SKU: {product.sku}</p>
                  <Badge 
                    variant={getStatusBadgeVariant(product.status)}
                    className="lg:hidden mt-1 text-xs"
                  >
                    {product.status.replace('_', ' ')}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="py-3 sm:py-4">
                <span className="font-semibold text-foreground text-base sm:text-lg">{product.price}</span>
              </TableCell>
              <TableCell className="py-3 sm:py-4 hidden md:table-cell">
                {product.orders.length > 0 ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleShopifyOrdersClick(product)}
                    className="h-7 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-2 hover-scale transition-all duration-200 border-primary/20 hover:border-primary/40"
                  >
                    <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                    <span className="text-xs sm:text-sm font-medium">
                      {product.orders.length} order{product.orders.length > 1 ? 's' : ''}
                    </span>
                    <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-60" />
                  </Button>
                ) : (
                  <span className="text-xs sm:text-sm text-muted-foreground">No orders</span>
                )}
              </TableCell>
              <TableCell className="py-3 sm:py-4 hidden lg:table-cell">
                <Badge variant={getStatusBadgeVariant(product.status)}>
                  {product.status.replace('_', ' ')}
                </Badge>
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