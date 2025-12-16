import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, Search, Filter, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { WTBRequest } from "./types";
import { mockWTBRequests } from "./mockData";
import { WTBRequestsGrid } from "./WTBRequestsGrid";

export function BulkSellerWTBView() {
  const [requests, setRequests] = useState<WTBRequest[]>(mockWTBRequests);
  const [selectedRequest, setSelectedRequest] = useState<WTBRequest | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQuantity, setOfferQuantity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch = searchTerm === "" ||
        request.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [requests, searchTerm]);

  const handleSubmitOffer = () => {
    if (!selectedRequest || !offerPrice || !offerQuantity) {
      toast.error("Please fill in all fields");
      return;
    }

    setRequests(requests.map(req =>
      req.id === selectedRequest.id
        ? { ...req, status: "responded" as const }
        : req
    ));

    toast.success(`Offer submitted for ${selectedRequest.productName}`);
    setIsOfferDialogOpen(false);
    setOfferPrice("");
    setOfferQuantity("");
    setSelectedRequest(null);
  };

  const handleOpenOfferDialog = (request: WTBRequest) => {
    setSelectedRequest(request);
    setIsOfferDialogOpen(true);
  };

  

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">WTB Requests</h1>
          <p className="text-muted-foreground mt-2">
            View and respond to SneakerAsk's Want to Buy requests
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {filteredRequests.filter(r => r.status === "active").length} Active Requests
        </Badge>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Package className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Daily Email Notifications</p>
              <p className="text-sm text-muted-foreground mt-1">
                You'll receive a daily email with all active WTB requests from SneakerAsk
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardContent className="p-4">
          <div className="flex-1">
            <Label htmlFor="search" className="text-sm font-medium mb-2 block">
              Search Requests
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by product name, SKU, or request ID..."
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
          Showing {filteredRequests.length} of {requests.length} requests
        </span>
        {searchTerm && (
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span>Search active</span>
          </div>
        )}
      </div>

      {/* Grid */}
      <WTBRequestsGrid
        requests={filteredRequests}
        onSubmitOffer={handleOpenOfferDialog}
      />

      {/* Submit Offer Dialog */}
      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Offer</DialogTitle>
            <DialogDescription>
              Submit your offer for {selectedRequest?.productName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <p className="text-sm text-muted-foreground">
                {selectedRequest?.productName} ({selectedRequest?.sku})
              </p>
            </div>

            <div className="space-y-2">
              <Label>Requested Quantity</Label>
              <p className="text-sm text-muted-foreground">
                {selectedRequest?.quantity} pairs
              </p>
            </div>

            <div className="space-y-2">
              <Label>SneakerAsk Payout Price (per pair)</Label>
              <p className="text-sm font-semibold text-primary">
                €{selectedRequest?.payoutPrice.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offerQuantity">Your Available Quantity</Label>
              <Input
                id="offerQuantity"
                type="number"
                placeholder="Number of pairs you can supply"
                value={offerQuantity}
                onChange={(e) => setOfferQuantity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="offerPrice">Your Price per Pair (€)</Label>
              <Input
                id="offerPrice"
                type="number"
                step="0.01"
                placeholder="Your asking price"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOfferDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitOffer}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
