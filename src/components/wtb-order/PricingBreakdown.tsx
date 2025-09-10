import { Card, CardContent } from "@/components/ui/card";
import { getVATRateByCountryCode } from "@/data/euCountryVAT";

interface PricingBreakdownProps {
  product: { 
    price: string;
    customerAddress?: {
      country_code: string;
    };
  };
  selectedSeller: string;
  vatTreatment: string;
  payoutPrice: string;
  vatRefundIncluded: boolean;
  availableSellers: Array<{ 
    name: string; 
    vatRate: number; 
    vatRegistered: boolean;
    vatNumber: string | null;
  }>;
}

export function PricingBreakdown({ 
  product, 
  selectedSeller, 
  vatTreatment, 
  payoutPrice, 
  vatRefundIncluded,
  availableSellers 
}: PricingBreakdownProps) {
  if (!selectedSeller || !vatTreatment) return null;

  const seller = availableSellers.find(s => s.name === selectedSeller);
  if (!seller) return null;

  // Debug logs
  console.log('PricingBreakdown - selectedSeller:', selectedSeller);
  console.log('PricingBreakdown - vatTreatment:', vatTreatment);
  console.log('PricingBreakdown - vatRefundIncluded:', vatRefundIncluded);
  console.log('PricingBreakdown - payoutPrice:', payoutPrice);
  console.log('PricingBreakdown - product.price:', product.price);
  
  // Calculate profit
  const listedPrice = parseFloat(product.price.replace(/[^\d.-]/g, ''));
  const payoutPriceNum = parseFloat(payoutPrice);
  
  // Get customer country VAT rate for VAT refund included case
  const customerCountryCode = product.customerAddress?.country_code;
  const customerVatRate = customerCountryCode ? getVATRateByCountryCode(customerCountryCode) : null;
  const customerVatRatePercent = customerVatRate ? customerVatRate / 100 : 0;
  
  // Calculate VAT amount and seller payout with VAT
  const vatAmount = payoutPriceNum * customerVatRatePercent;
  const sellerPayoutWithVat = payoutPriceNum + vatAmount;
  
  // Calculate profit based on VAT treatment and refund status
  const profit = vatTreatment === 'regular' && vatRefundIncluded
    ? listedPrice - sellerPayoutWithVat  // Regular VAT with refund: Listed Price - (Seller Payout + VAT)
    : listedPrice - payoutPriceNum;      // All other cases: Listed Price - Seller Payout
  
  console.log('PricingBreakdown - listedPrice:', listedPrice);
  console.log('PricingBreakdown - payoutPriceNum:', payoutPriceNum);
  console.log('PricingBreakdown - profit:', profit);

  return (
    <Card className="bg-muted/20 border">
      <CardContent className="p-4 space-y-3">
        <h4 className="font-medium text-foreground">Pricing Breakdown</h4>
        
        {vatTreatment === 'regular' ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Listed Price:</span>
              <span className="font-medium">{product.price}</span>
            </div>
            
            {vatRefundIncluded ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seller Payout Price:</span>
                  <span className="font-medium text-red-600">-€{payoutPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    VAT ({customerVatRate ? customerVatRate.toFixed(0) : 'N/A'}%):
                  </span>
                  <span className="font-medium text-red-600">
                    -€{vatAmount.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Seller Payout with VAT:</span>
                    <span className="font-bold text-red-600">-€{sellerPayoutWithVat.toFixed(2)}</span>
                  </div>
                </div>
                {payoutPrice && (
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Profit:</span>
                      <span className="font-bold text-green-600">
                        €{profit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  <strong>Regular VAT with Refund:</strong> The seller pays VAT to tax authorities. You receive the product and can claim input VAT.
                </div>
              </>
            ) : (
              <>
                {payoutPrice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seller Payout Price:</span>
                    <span className="font-medium text-red-600">-€{payoutPrice}</span>
                  </div>
                )}
                {payoutPrice && (
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Profit:</span>
                      <span className="font-bold text-green-600">
                        €{profit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  <strong>Regular VAT without Refund:</strong> You pay the full listed price. No VAT refund available.
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Listed Price:</span>
              <span className="font-medium">{product.price}</span>
            </div>
            {payoutPrice && (
              <div className="flex justify-between">
                <span className="font-medium">Seller Receives:</span>
                <span className="font-bold text-red-600">-€{payoutPrice}</span>
              </div>
            )}
            {payoutPrice && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Margin:</span>
                <span className="font-medium text-green-600">
                  €{profit.toFixed(2)}
                </span>
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              <strong>Margin Scheme:</strong> For second-hand goods. VAT is only paid on your profit margin, not the full sale price. Lower admin burden.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}