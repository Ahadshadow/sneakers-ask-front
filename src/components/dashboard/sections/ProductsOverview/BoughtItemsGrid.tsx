import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package2, Truck, CheckCircle, Clock } from "lucide-react";
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
      default: return <Package2 className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "processing": return "secondary";
      case "shipped": return "outline";
      case "delivered": return "default";
      default: return "outline";
    }
  };

  if (purchases.length === 0) {
    return (
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardContent className="p-8 text-center">
          <Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Purchases Yet</h3>
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
        <h2 className="text-xl font-semibold">Bought Items ({purchases.length})</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {purchases.map((purchase, index) => (
          <Card 
            key={purchase.id} 
            className="bg-gradient-card border-border shadow-soft hover:shadow-md transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-start justify-between">
                <span className="truncate pr-2">{purchase.product.name}</span>
                <Badge 
                  variant={getStatusVariant(purchase.status)}
                  className="flex items-center gap-1 text-xs"
                >
                  {getStatusIcon(purchase.status)}
                  {purchase.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-medium">{purchase.product.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seller:</span>
                  <span className="font-medium truncate max-w-[120px]">{purchase.seller}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Payout:</span>
                  <span className="font-semibold text-primary">${purchase.payoutPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="font-medium text-xs">{purchase.shippingMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchase Date:</span>
                  <span className="font-medium">{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}