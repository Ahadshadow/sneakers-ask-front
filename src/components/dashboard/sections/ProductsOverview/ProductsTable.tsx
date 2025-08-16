import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, ShoppingCart } from "lucide-react";
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

  return (
    <div className="rounded-lg border border-border bg-gradient-card shadow-soft overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/5">
            <TableHead className="font-semibold text-foreground">Product</TableHead>
            <TableHead className="font-semibold text-foreground">Price</TableHead>
            <TableHead className="font-semibold text-foreground">Orders</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
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
                  <p className="text-xs text-muted-foreground/80">{product.seller}</p>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <span className="font-semibold text-foreground text-lg">{product.price}</span>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-primary/10">
                      <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {product.orders.length} Shopify orders
                    </span>
                  </div>
                  {product.orders.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-3 text-xs hover-scale transition-all duration-200"
                    >
                      <Eye className="h-3 w-3 mr-1.5" />
                      View
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Badge 
                  variant={getStatusBadgeVariant(product.status)}
                  className="font-medium transition-all duration-200 hover-scale"
                >
                  {product.status === "fliproom_sale" ? "Fliproom Sale" : 
                   product.status === "sneakerask" ? "SneakerAsk" : 
                   product.status === "open" ? "Open" : product.status}
                </Badge>
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
  );
}