import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, MoreHorizontal, Package } from "lucide-react";
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
}

export function ProductsTable({ products }: ProductsTableProps) {
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

  return (
    <div className="rounded-lg border border-border bg-gradient-card shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <div className="max-h-[600px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/5">
            <TableHead className="font-semibold text-foreground">Product</TableHead>
            <TableHead className="font-semibold text-foreground">Price</TableHead>
            <TableHead className="font-semibold text-foreground hidden md:table-cell">Orders</TableHead>
            <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow 
              key={product.id} 
              className="border-border hover:bg-muted/10 transition-colors duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="py-4">
                <div className="space-y-1">
                  <p className="font-medium text-foreground leading-none">{product.name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <span className="font-semibold text-foreground text-lg">{product.price}</span>
              </TableCell>
              <TableCell className="py-4 hidden md:table-cell">
                {product.orders.length > 0 ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleShopifyOrdersClick(product)}
                    className="h-8 px-3 gap-2 hover-scale transition-all duration-200 border-primary/20 hover:border-primary/40"
                  >
                    <Package className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-medium">
                      {product.orders.length} order{product.orders.length > 1 ? 's' : ''}
                    </span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">No orders</span>
                )}
              </TableCell>
              <TableCell className="text-right py-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 hover-scale transition-all duration-200"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
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