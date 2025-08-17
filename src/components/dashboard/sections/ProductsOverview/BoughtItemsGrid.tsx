import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package2, Truck, CheckCircle, Clock, AlertCircle, PackageCheck } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WTBPurchase } from "./types";

interface BoughtItemsGridProps {
  purchases: WTBPurchase[];
}

export function BoughtItemsGrid({ purchases }: BoughtItemsGridProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing": return <Clock className="h-4 w-4" />;
      case "shipped": return <Truck className="h-4 w-4" />;
      case "delivered": return <CheckCircle className="h-4 w-4" />;
      case "confirmed": return <PackageCheck className="h-4 w-4" />;
      case "pending": return <AlertCircle className="h-4 w-4" />;
      default: return <Package2 className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "processing": return "secondary";
      case "shipped": return "outline"; 
      case "delivered": return "default";
      case "confirmed": return "default";
      case "pending": return "destructive";
      default: return "outline";
    }
  };

  if (purchases.length === 0) {
    return (
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardContent className="p-8 text-center">
          <Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No WTB Purchases Yet</h3>
          <p className="text-muted-foreground">
            Start browsing products and make your first WTB purchase.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package2 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">WTB Purchases Overview</h2>
        <span className="text-muted-foreground">Browse and track your sourced products</span>
      </div>
      
      <div className="rounded-lg border border-border bg-gradient-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-[400px] sm:max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/5">
                  <TableHead className="font-semibold text-foreground text-sm">Product</TableHead>
                  <TableHead className="font-semibold text-foreground text-sm">Payout</TableHead>
                  <TableHead className="font-semibold text-foreground text-sm hidden md:table-cell">Seller</TableHead>
                  <TableHead className="font-semibold text-foreground text-sm hidden lg:table-cell">Status</TableHead>
                  <TableHead className="font-semibold text-foreground text-sm hidden xl:table-cell">VAT</TableHead>
                  <TableHead className="font-semibold text-foreground text-sm text-right">Purchase Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase, index) => (
                  <TableRow 
                    key={purchase.id} 
                    className="border-border hover:bg-muted/10 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Product Column */}
                    <TableCell className="py-3 sm:py-4">
                      <div className="space-y-1">
                        <h3 className="font-medium text-foreground text-sm leading-tight">
                          {purchase.product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          SKU: {purchase.product.sku}
                        </p>
                      </div>
                    </TableCell>

                    {/* Payout Column */}
                    <TableCell className="py-3 sm:py-4">
                      <div className="font-bold text-primary text-base">
                        €{purchase.payoutPrice}
                      </div>
                    </TableCell>

                    {/* Seller Column */}
                    <TableCell className="py-3 sm:py-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground text-sm truncate max-w-[120px]">
                          {purchase.seller}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {purchase.shippingMethod}
                        </p>
                      </div>
                    </TableCell>

                    {/* Status Column */}
                    <TableCell className="py-3 sm:py-4 hidden lg:table-cell">
                      <Badge 
                        variant={getStatusVariant(purchase.status)}
                        className="flex items-center gap-1 w-fit text-xs"
                      >
                        {getStatusIcon(purchase.status)}
                        {purchase.status}
                      </Badge>
                    </TableCell>

                    {/* VAT Column */}
                    <TableCell className="py-3 sm:py-4 hidden xl:table-cell">
                      <Badge variant="outline" className="text-xs capitalize">
                        {purchase.vatTreatment === 'regular' ? 'Regular VAT' : 'Margin Scheme'}
                      </Badge>
                    </TableCell>

                    {/* Purchase Date Column */}
                    <TableCell className="text-right py-3 sm:py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground text-sm">
                          {new Date(purchase.purchaseDate).toLocaleDateString('en-GB')}
                        </p>
                        <p className="text-xs text-muted-foreground lg:hidden">
                          {purchase.status}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

    </div>
  );
}