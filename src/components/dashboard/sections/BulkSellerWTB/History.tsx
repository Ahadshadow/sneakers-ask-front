import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, History as HistoryIcon, Package, TrendingUp, Truck, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sellersApi, type SellerHistoryItem } from "@/lib/api/sellers";
import { useToast } from "@/hooks/use-toast";

export function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch seller history from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['seller-history'],
    queryFn: () => sellersApi.getSellerHistory(),
    retry: 1,
  });

  const historyItems = data?.data?.history || [];
  const summary = data?.data?.summary;

  const filteredSales = useMemo(() => {
    return historyItems.filter((item) => {
      const matchesSearch = searchTerm === "" ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.carrier.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [historyItems, searchTerm]);

  const getDeliveryStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    let variant: "default" | "secondary" | "outline" = "outline";
    let label = status;

    if (statusLower.includes("delivered")) {
      variant = "default";
      label = "Delivered";
    } else if (statusLower.includes("transit") || statusLower.includes("in transit")) {
      variant = "secondary";
      label = "In Transit";
    } else {
      variant = "outline";
      label = status;
    }

    return (
      <Badge variant={variant}>
        {label}
      </Badge>
    );
  };

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading history",
        description: error instanceof Error ? error.message : "Failed to load seller history",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Format date from MM/DD/YYYY or other formats
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "N/A") return "N/A";
    try {
      // Handle MM/DD/YYYY format
      const parts = dateString.split("/");
      if (parts.length === 3) {
        const [month, day, year] = parts;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
      }
      // Try parsing as ISO date
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Extract numeric value from currency string like "€950.00"
  const parseAmount = (amountString: string): number => {
    if (!amountString) return 0;
    const numericValue = amountString.replace(/[€,\s]/g, "");
    return parseFloat(numericValue) || 0;
  };

  const totalEarnings = summary ? parseAmount(summary.total_earnings) : 0;
  const deliveredCount = summary?.total_shipped_items || 0;
  const totalItems = summary?.total_items || 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shipment History</h1>
          <p className="text-muted-foreground mt-2">
            Track all sales shipped to customers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-foreground">{totalItems}</p>
              </div>
              <Truck className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-foreground">{deliveredCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-primary">{summary?.total_earnings || "€0.00"}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Search */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardContent className="p-4">
          <div className="flex-1">
            <Label htmlFor="search" className="text-sm font-medium mb-2 block">
              Search Shipments
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by product, tracking number, or carrier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading history...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Failed to load history. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {!isLoading && !error && (
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredSales.length} of {historyItems.length} items
            </span>
          </div>

          {/* Shipments Table */}
          <Card className="bg-gradient-card border-border shadow-soft">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipped Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Status</TableHead>
                    {/* <TableHead className="text-right">Amount</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((item, index) => (
                    <TableRow key={`${item.tracking_number}-${index}`} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {formatDate(item.shipped_date)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{item.product}</TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell>{item.carrier}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {item.tracking_number}
                      </TableCell>
                      <TableCell>{getDeliveryStatusBadge(item.status)}</TableCell>
                      {/* <TableCell className="text-right">
                        <span className="font-semibold text-primary">
                          {item.amount}
                        </span>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredSales.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No history found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
