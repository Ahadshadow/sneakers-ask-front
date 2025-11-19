import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vendorsApi } from "@/lib/api/vendors";
import { Loader2 } from "lucide-react";

interface VendorSelectProps {
  value?: number | string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showSecondaryInfo?: boolean;
}

export function VendorSelect({
  value,
  onValueChange,
  placeholder = "Select a vendor",
  disabled = false,
  showSecondaryInfo = false,
}: VendorSelectProps) {
  // Fetch all vendors for dropdown
  const {
    data: vendorsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['vendors', 'all'],
    queryFn: () => vendorsApi.getVendors({ per_page: 'all' }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const vendors = vendorsResponse?.data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading vendors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load vendors. Please try again.
      </div>
    );
  }

  return (
    <Select
      value={value?.toString()}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {vendors.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No vendors found
          </div>
        ) : (
          vendors.map((vendor) => (
            <SelectItem key={vendor.id} value={vendor.id.toString()}>
              <div className="flex flex-col">
                <span>{vendor.name}</span>
                {showSecondaryInfo && (vendor.email || vendor.phone) && (
                  <span className="text-xs text-muted-foreground">
                    {[vendor.email, vendor.phone].filter(Boolean).join(' • ')}
                  </span>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

