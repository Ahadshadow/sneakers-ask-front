import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, PackageCheck } from "lucide-react";
import { mockOffers } from "./offerMockData";
import { Offer } from "./OfferTypes";

export function MyOffers() {
  const [offers] = useState<Offer[]>(mockOffers);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesSearch = searchTerm === "" ||
        offer.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [offers, searchTerm]);

  const getStatusBadge = (status: Offer["status"]) => {
    const variants = {
      pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      accepted: "bg-green-500/10 text-green-700 dark:text-green-400",
      rejected: "bg-red-500/10 text-red-700 dark:text-red-400"
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Offers</h1>
          <p className="text-muted-foreground mt-2">
            Track your submitted offers and their status
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {offers.length} Total Offers
        </Badge>
      </div>

      {/* Search */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardContent className="p-4">
          <div className="flex-1">
            <Label htmlFor="search" className="text-sm font-medium mb-2 block">
              Search Offers
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by product name, SKU, or offer ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredOffers.length} of {offers.length} offers
        </span>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOffers.map((offer) => (
          <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={offer.image}
                  alt={offer.productName}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(offer.status)}
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground line-clamp-1">
                    {offer.productName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{offer.sku}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <p className="font-medium">{offer.size}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <p className="font-medium">{offer.offeredQuantity} pairs</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Your Price:</span>
                    <p className="font-medium text-primary">€{offer.offeredPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">WTB Price:</span>
                    <p className="font-medium">€{offer.wtbPayoutPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    Submitted: {new Date(offer.submittedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOffers.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <PackageCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No offers found</p>
          </div>
        </Card>
      )}
    </div>
  );
}
