import { WTBRequest } from "./types";
import { WTBRequestCard } from "./WTBRequestCard";

interface WTBRequestsGridProps {
  requests: WTBRequest[];
  onSubmitOffer: (request: WTBRequest) => void;
}

export function WTBRequestsGrid({ requests, onSubmitOffer }: WTBRequestsGridProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">No WTB requests match your filters</p>
        <p className="text-muted-foreground text-sm mt-2">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {requests.map((request) => (
        <WTBRequestCard
          key={request.id}
          request={request}
          onSubmitOffer={onSubmitOffer}
        />
      ))}
    </div>
  );
}
