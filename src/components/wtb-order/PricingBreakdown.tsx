import { Card, CardContent } from "@/components/ui/card";

interface PricingBreakdownProps {
  product: { price: string };
  selectedSeller: string;
  vatTreatment: string;
  payoutPrice: string;
  availableSellers: Array<{ name: string; vatRate: number }>;
}

export function PricingBreakdown({ 
  product, 
  selectedSeller, 
  vatTreatment, 
  payoutPrice, 
  availableSellers 
}: PricingBreakdownProps) {
  if (!selectedSeller || !vatTreatment || !payoutPrice) return null;

  const seller = availableSellers.find(s => s.name === selectedSeller);
  if (!seller) return null;

  return (
    <Card className="bg-muted/20 border">
      <CardContent className="p-4 space-y-3">
        <h4 className="font-medium text-foreground">Pricing Breakdown</h4>
        
        {vatTreatment === 'regular' ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Listed Price (incl. VAT):</span>
              <span className="font-medium">{product.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                VAT ({(seller.vatRate * 100).toFixed(0)}%):
              </span>
              <span className="font-medium text-red-600">
                -€{(parseFloat(product.price.replace('€', '')) - parseFloat(payoutPrice)).toFixed(2)}
              </span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between">
                <span className="font-medium">Seller Receives (net):</span>
                <span className="font-bold text-primary">€{payoutPrice}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              <strong>Regular VAT:</strong> The seller pays VAT to tax authorities. You receive the product and can claim input VAT (if VAT registered).
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Listed Price:</span>
              <span className="font-medium">{product.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Seller Receives:</span>
              <span className="font-bold text-primary">€{payoutPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Margin:</span>
              <span className="font-medium text-green-600">
                €{(parseFloat(product.price.replace('€', '')) - parseFloat(payoutPrice)).toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              <strong>Margin Scheme:</strong> For second-hand goods. VAT is only paid on your profit margin, not the full sale price. Lower admin burden.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}