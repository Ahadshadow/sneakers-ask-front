import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package2, Truck, CheckCircle, Clock, AlertCircle, PackageCheck } from "lucide-react";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "shipped": return "text-blue-600 bg-blue-50 border-blue-200";
      case "delivered": return "text-green-600 bg-green-50 border-green-200";
      case "confirmed": return "text-green-600 bg-green-50 border-green-200";
      case "pending": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package2 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">WTB Sourced Products ({purchases.length})</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {purchases.map((purchase, index) => (
          <Card 
            key={purchase.id} 
            className="bg-card border border-border hover:shadow-lg transition-all duration-300 animate-fade-in relative overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Status Badge - Top Right */}
            <div className="absolute top-4 right-4 z-10">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(purchase.status)}`}>
                {getStatusIcon(purchase.status)}
                {purchase.status}
              </div>
            </div>

            <CardHeader className="pb-4">
              <CardTitle className="text-lg pr-24 leading-tight">
                {purchase.product.name}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Product Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">SKU</p>
                  <p className="font-semibold text-foreground">{purchase.product.sku}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">VAT Treatment</p>
                  <p className="font-semibold text-foreground capitalize">{purchase.vatTreatment}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Seller:</span>
                    <span className="font-semibold text-foreground text-right max-w-[140px] truncate">{purchase.seller}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Your Payout:</span>
                    <span className="font-bold text-primary text-lg">€{purchase.payoutPrice}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Shipping:</span>
                    <span className="font-medium text-foreground text-sm">{purchase.shippingMethod}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Purchase Date:</span>
                    <span className="font-medium text-foreground text-sm">
                      {new Date(purchase.purchaseDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Status Progress</span>
                  <span className="text-xs text-muted-foreground">
                    {purchase.status === 'processing' ? '1/3' : 
                     purchase.status === 'shipped' ? '2/3' : 
                     purchase.status === 'delivered' ? '3/3' : '1/3'}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      purchase.status === 'processing' ? 'w-1/3 bg-yellow-500' :
                      purchase.status === 'shipped' ? 'w-2/3 bg-blue-500' :
                      purchase.status === 'delivered' ? 'w-full bg-green-500' :
                      'w-1/4 bg-orange-500'
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}