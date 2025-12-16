import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from "lucide-react";
import { WTBRequest } from "./types";

interface WTBRequestCardProps {
  request: WTBRequest;
  onSubmitOffer: (request: WTBRequest) => void;
}

export function WTBRequestCard({ request, onSubmitOffer }: WTBRequestCardProps) {
  const getWhatsAppLink = () => {
    const phoneNumber = "31612345678"; // Replace with SneakerAsk's WhatsApp number
    const message = `Hi SneakerAsk! I'm interested in the WTB request:\n\nProduct: ${request.productName}\nSKU: ${request.sku}\nSize: ${request.size}\nPayout: €${request.payoutPrice.toFixed(2)}\n\nCan we discuss this?`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };
  const getStatusBadge = (status: WTBRequest["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case "responded":
        return <Badge variant="secondary">Responded</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border bg-card">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative overflow-hidden bg-muted aspect-square">
          <img
            src={request.image}
            alt={request.productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            {getStatusBadge(request.status)}
          </div>
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              {request.id}
            </Badge>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 space-y-3">
          {/* Product Name */}
          <div>
            <h3 className="font-semibold text-base line-clamp-2 min-h-[2.5rem]">
              {request.productName}
            </h3>
            <p className="text-sm text-muted-foreground font-mono mt-1">{request.sku}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Size</p>
              <p className="font-medium">{request.size}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Quantity</p>
              <p className="font-medium">{request.quantity} pairs</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Payout Price</p>
              <p className="font-bold text-primary">€{request.payoutPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Date</p>
              <p className="font-medium">{request.requestDate}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => onSubmitOffer(request)}
              disabled={request.status === "closed"}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-1" />
              Submit Offer
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(getWhatsAppLink(), '_blank')}
              className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white border-[#25D366] hover:border-[#20BA5A]"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
