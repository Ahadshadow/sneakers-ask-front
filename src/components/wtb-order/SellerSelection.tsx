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
    discordName?: string;
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
  
  // Filter sellers based on search term - only search in owner name, discord name, and email
  // Only show sellers where the search term matches exactly at the start of the field or at the start of a word
  const filteredSellers = useMemo(() => {
    // Create a unique key for each seller (prefer ID, fallback to name+email combination)
    const getSellerKey = (seller: typeof availableSellers[0]): string => {
      if (seller.id) return `id:${seller.id}`;
      // Use name and email combination to identify unique sellers
      return `name:${seller.name || ''}:email:${seller.email || ''}`;
    };

    if (!searchValue.trim()) {
      // Deduplicate sellers before returning
      const seen = new Set<string>();
      return availableSellers.filter(seller => {
        const key = getSellerKey(seller);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    const searchLower = searchValue.toLowerCase().trim();
    const seen = new Set<string>();
    
    return availableSellers.filter(seller => {
      // Deduplicate: skip if we've already seen this seller
      const key = getSellerKey(seller);
      if (seen.has(key)) return false;
      // Helper function to check if search term matches owner name or discord name
      const matchesNameField = (fieldValue: string | undefined): boolean => {
        if (!fieldValue) return false;
        const fieldLower = fieldValue.toLowerCase();
        
        // Check if search term starts the entire field
        if (fieldLower.startsWith(searchLower)) return true;
        
        // Check if search term starts any word in the field (word boundary matching)
        const fieldWords = fieldLower.split(/\s+/);
        return fieldWords.some(word => word.startsWith(searchLower));
      };
      
      // Helper function to check if search term matches email
      const matchesEmail = (email: string | undefined): boolean => {
        if (!email) return false;
        const emailLower = email.toLowerCase();
        
        // For email, check if search term is at the start of the email (before @)
        const emailParts = emailLower.split('@');
        if (emailParts.length > 0) {
          const emailPrefix = emailParts[0];
          // Check if search term starts the email prefix
          if (emailPrefix.startsWith(searchLower)) return true;
          // Check if search term starts any word in the email prefix (if it has dots or underscores)
          const emailWords = emailPrefix.split(/[._-]/);
          return emailWords.some(word => word.startsWith(searchLower));
        }
        return false;
      };
      
      // Search only in owner name (name)
      const nameMatch = matchesNameField(seller.name);
      
      // Search in discord name
      const discordNameMatch = matchesNameField(seller.discordName);
      
      // Search in email (with special handling)
      const emailMatch = matchesEmail(seller.email);

      const matches = nameMatch || discordNameMatch || emailMatch;
      
      // If it matches, add to seen set
      if (matches) {
        seen.add(key);
      }
      
      return matches;
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
                placeholder="Search by owner name, discord name, or email..." 
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
                        {filteredSellers.map((seller, index) => (
                          <CommandItem
                            key={seller.id ? `seller-${seller.id}` : `seller-${seller.name}-${seller.email}-${index}`}
                            value={seller.name}
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
                                {seller.discordName && <span>{seller.discordName} • </span>}
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