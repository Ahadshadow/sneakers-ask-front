import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Users, Check, ChevronsUpDown, Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickAddSellerModal } from "./QuickAddSellerModal";
import { useQueryClient } from "@tanstack/react-query";

interface SellerSelectionProps {
  selectedSeller: string;
  onSellerChange: (seller: string) => void;
  availableSellers: Array<{ 
    name: string; 
    country: string; 
    vatRate: number; 
    id?: number; 
    email?: string; 
    status?: string;
    storeName?: string;
    contactName?: string;
  }>;
  isLoading?: boolean;
  error?: any;
}

export function SellerSelection({ selectedSeller, onSellerChange, availableSellers, isLoading, error }: SellerSelectionProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const queryClient = useQueryClient();

  const handleSellerSelect = (sellerName: string) => {
    onSellerChange(sellerName);
    setOpen(false);
    setSearchValue(""); // Clear search when seller is selected
  };

  const handleSellerCreated = () => {
    // Invalidate all seller queries to refresh the list
    queryClient.invalidateQueries({ queryKey: ['wtb-active-sellers'] });
    queryClient.invalidateQueries({ queryKey: ['bulk-wtb-active-sellers'] });
    queryClient.invalidateQueries({ queryKey: ['sellers'] });
  };

  const seller = availableSellers.find(s => s.name === selectedSeller);
  
  // Filter sellers based on search term (contact name, store name, seller name)
  const filteredSellers = useMemo(() => {
    if (!searchValue.trim()) {
      return availableSellers;
    }

    const searchLower = searchValue.toLowerCase().trim();
    return availableSellers.filter(seller => {
      // Search in seller name (owner_name)
      const nameMatch = seller.name?.toLowerCase().includes(searchLower);
      
      // Search in store name
      const storeNameMatch = seller.storeName?.toLowerCase().includes(searchLower);
      
      // Search in contact name
      const contactNameMatch = seller.contactName?.toLowerCase().includes(searchLower);
      
      // Search in email (bonus)
      const emailMatch = seller.email?.toLowerCase().includes(searchLower);

      return nameMatch || storeNameMatch || contactNameMatch || emailMatch;
    });
  }, [availableSellers, searchValue]);
  
  // Debug log to see what sellers are available
  console.log('Available sellers in dropdown:', availableSellers);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Select Seller
          </CardTitle>
          <QuickAddSellerModal onSellerCreated={handleSellerCreated}>
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Seller
            </Button>
          </QuickAddSellerModal>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Popover open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setSearchValue(""); // Clear search when popover closes
          }
        }}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading sellers...
                </>
              ) : (
                <>
                  {selectedSeller || "Choose seller"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command shouldFilter={false}>
              <CommandInput 
                placeholder="Search by name, store, or contact..." 
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading sellers...</span>
                  </div>
                ) : error ? (
                  <CommandEmpty>Failed to load sellers</CommandEmpty>
                ) : (
                  <>
                    {filteredSellers.length === 0 ? (
                      <CommandEmpty>No seller found.</CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {filteredSellers.map((seller) => (
                          <CommandItem
                            key={seller.name}
                            value={`${seller.name} ${seller.storeName || ''} ${seller.contactName || ''} ${seller.email || ''}`}
                            onSelect={() => handleSellerSelect(seller.name)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedSeller === seller.name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{seller.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {seller.storeName && <span>{seller.storeName} • </span>}
                                {seller.contactName && <span>{seller.contactName} • </span>}
                                {seller.email}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {seller && (
          <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
            <strong>Email:</strong> {seller.email}
          </div>
        )}
      </CardContent>
    </Card>
  );
}