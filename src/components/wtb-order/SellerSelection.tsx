import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Users, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SellerSelectionProps {
  selectedSeller: string;
  onSellerChange: (seller: string) => void;
  availableSellers: Array<{ name: string; country: string; vatRate: number }>;
}

export function SellerSelection({ selectedSeller, onSellerChange, availableSellers }: SellerSelectionProps) {
  const [open, setOpen] = useState(false);

  const handleSellerSelect = (sellerName: string) => {
    onSellerChange(sellerName);
    setOpen(false);
  };

  const seller = availableSellers.find(s => s.name === selectedSeller);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Select Seller
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-12"
            >
              {selectedSeller || "Choose seller"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search sellers..." />
              <CommandList>
                <CommandEmpty>No seller found.</CommandEmpty>
                <CommandGroup>
                  {availableSellers.map((seller) => (
                    <CommandItem
                      key={seller.name}
                      value={seller.name}
                      onSelect={handleSellerSelect}
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
                          {seller.country} • VAT: {(seller.vatRate * 100).toFixed(0)}%
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {seller && (
          <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
            <strong>{seller.country}</strong> VAT rate: <strong>{(seller.vatRate * 100).toFixed(0)}%</strong>
          </div>
        )}
      </CardContent>
    </Card>
  );
}