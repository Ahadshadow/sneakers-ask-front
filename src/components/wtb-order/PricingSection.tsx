import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard } from "lucide-react";
import { PricingBreakdown } from "./PricingBreakdown";

interface PricingSectionProps {
  selectedSeller: string;
  vatTreatment: string;
  payoutPrice: string;
  vatRefundIncluded: boolean;
  onVatChange: (value: string) => void;
  onPayoutPriceChange: (value: string) => void;
  onVatRefundIncludedChange: (checked: boolean) => void;
  product: { price: string };
  availableSellers: Array<{ 
    name: string; 
    vatRate: number; 
    vatRegistered: boolean; 
    vatNumber: string | null; 
  }>;
}

const vatOptions = [
  { id: "margin", name: "Margin Scheme", description: "For second-hand goods" },
  { id: "regular", name: "Regular VAT", description: "Standard VAT treatment" }
];

export function PricingSection({ 
  selectedSeller, 
  vatTreatment, 
  payoutPrice, 
  vatRefundIncluded,
  onVatChange, 
  onPayoutPriceChange,
  onVatRefundIncludedChange,
  product,
  availableSellers
}: PricingSectionProps) {
  // Check if selected seller is eligible for VAT refund
  const selectedSellerData = availableSellers.find(s => s.name === selectedSeller);
  const isVatRefundEligible = selectedSellerData?.vatRegistered && selectedSellerData?.vatNumber;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* VAT Treatment */}
      <Card>
        <CardHeader>
          <CardTitle>VAT Treatment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {vatOptions.map(option => (
            <div
              key={option.id}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                vatTreatment === option.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onVatChange(option.id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full border-2 ${
                    vatTreatment === option.id
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  }`}
                >
                  {vatTreatment === option.id && (
                    <div className="h-full w-full rounded-full bg-primary-foreground scale-50" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">{option.name}</h4>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payout Price */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Seller Payout Price
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            placeholder="Enter payout amount"
            value={payoutPrice}
            onChange={(e) => onPayoutPriceChange(e.target.value)}
            className="text-lg h-12"
            min="0"
            step="0.01"
          />
          
          {vatTreatment !== 'margin' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vat-refund-included"
                  checked={vatRefundIncluded}
                  onCheckedChange={onVatRefundIncludedChange}
                  disabled={!isVatRefundEligible}
                />
                <label
                  htmlFor="vat-refund-included"
                  className={`text-sm font-medium leading-none ${
                    !isVatRefundEligible 
                      ? 'text-muted-foreground cursor-not-allowed' 
                      : 'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  }`}
                >
                  VAT Refund Included
                  {!isVatRefundEligible && (
                    <span className="text-xs text-muted-foreground block">
                      (Seller must be VAT registered with VAT number)
                    </span>
                  )}
                </label>
              </div>
              
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  💡 <strong>What is payout price?</strong>
                </p>
                <p className="text-muted-foreground">
                  This is the net amount the seller receives after VAT considerations.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Breakdown */}
      {selectedSeller && vatTreatment && (
        <div className="md:col-span-2">
          <PricingBreakdown
            product={product}
            selectedSeller={selectedSeller}
            vatTreatment={vatTreatment}
            payoutPrice={payoutPrice}
            vatRefundIncluded={vatRefundIncluded}
            availableSellers={availableSellers}
          />
        </div>
      )}
    </div>
  );
}