import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreditCard } from "lucide-react";
import { PricingBreakdown } from "./PricingBreakdown";

interface PricingSectionProps {
  selectedSeller: string;
  vatTreatment: string;
  payoutPrice: string;
  onVatChange: (value: string) => void;
  onPayoutPriceChange: (value: string) => void;
  product: { price: string };
  availableSellers: Array<{ name: string; vatRate: number }>;
}

const vatOptions = [
  { id: "regular", name: "Regular VAT", description: "Standard VAT treatment" },
  { id: "margin", name: "Margin Scheme", description: "For second-hand goods" }
];

export function PricingSection({ 
  selectedSeller, 
  vatTreatment, 
  payoutPrice, 
  onVatChange, 
  onPayoutPriceChange,
  product,
  availableSellers
}: PricingSectionProps) {
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
            disabled={vatTreatment === 'regular'}
          />
          
          <div className="text-sm space-y-1">
            <p className="text-muted-foreground">
              💡 <strong>What is payout price?</strong>
            </p>
            <p className="text-muted-foreground">
              This is the net amount the seller receives after VAT considerations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Breakdown */}
      {selectedSeller && vatTreatment && payoutPrice && (
        <div className="md:col-span-2">
          <PricingBreakdown
            product={product}
            selectedSeller={selectedSeller}
            vatTreatment={vatTreatment}
            payoutPrice={payoutPrice}
            availableSellers={availableSellers}
          />
        </div>
      )}
    </div>
  );
}