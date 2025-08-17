import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Filter, X, RotateCcw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface FilterOptions {
  status: string;
  seller: string;
}

interface FilterSystemProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableSellers: string[];
}

const statusOptions = [
  { value: "open", label: "Open", color: "bg-green-500" },
  { value: "fliproom_sale", label: "Fliproom Sale", color: "bg-blue-500" },
  { value: "sneakerask", label: "SneakerAsk", color: "bg-purple-500" }
];

export function FilterSystem({ 
  filters, 
  onFiltersChange, 
  availableSellers 
}: FilterSystemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: "all",
      seller: "all"
    });
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      return value !== "all";
    }).length;
  };

  const removeFilter = (key: keyof FilterOptions) => {
    updateFilter(key, "all");
  };

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center gap-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 h-9 sm:h-10 text-sm sm:text-base">
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs h-5 px-1.5">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Active Filters Display */}
                {getActiveFiltersCount() > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Active Filters</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-auto p-1 text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filters.status && filters.status !== "all" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Status: {statusOptions.find(s => s.value === filters.status)?.label}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => removeFilter("status")}
                          />
                        </Badge>
                      )}
                      {filters.seller && filters.seller !== "all" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Seller: {filters.seller}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => removeFilter("seller")}
                          />
                        </Badge>
                      )}
                    </div>
                    <Separator />
                  </div>
                )}

                {/* Filter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm">Status</Label>
                    <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border z-50">
                        <SelectItem value="all">All Statuses</SelectItem>
                        {statusOptions.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${status.color}`} />
                              {status.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Seller Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm">Seller</Label>
                    <Select value={filters.seller} onValueChange={(value) => updateFilter("seller", value)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Sellers" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border z-50">
                        <SelectItem value="all">All Sellers</SelectItem>
                        {availableSellers.map(seller => (
                          <SelectItem key={seller} value={seller}>{seller}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}