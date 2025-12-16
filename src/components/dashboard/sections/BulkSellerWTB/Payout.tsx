import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Wallet, TrendingUp, Calendar, Download, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { sellersApi, type SellerPayoutItem } from "@/lib/api/sellers";
import { useToast } from "@/hooks/use-toast";

export function Payout() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast: toastHook } = useToast();

  // Fetch seller payouts from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['seller-payouts-dashboard'],
    queryFn: () => sellersApi.getSellerPayoutsDashboard(),
    retry: 1,
  });

  const payouts = data?.data?.payouts || [];
  const summary = data?.data?.summary;

  const filteredPayouts = useMemo(() => {
    return payouts.filter((payout) => {
      const matchesSearch = searchTerm === "" ||
        payout.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payout.payout_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payout.shopify_order_number && payout.shopify_order_number.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  }, [payouts, searchTerm]);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    let variant: "default" | "secondary" | "outline" = "outline";
    let label = status;

    if (statusLower === "completed" || statusLower === "paid") {
      variant = "default";
      label = status.charAt(0).toUpperCase() + status.slice(1);
    } else if (statusLower === "processing") {
      variant = "secondary";
      label = "Processing";
    } else if (statusLower === "pending") {
      variant = "outline";
      label = "Pending";
    } else {
      variant = "outline";
      label = status.charAt(0).toUpperCase() + status.slice(1);
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
      toastHook({
        title: "Error loading payouts",
        description: error instanceof Error ? error.message : "Failed to load seller payouts",
        variant: "destructive",
      });
    }
  }, [error, toastHook]);

  // Format date from YYYY-MM-DD or other formats
  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString === "N/A") return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Extract numeric value from currency string
  const parseAmount = (amountString: string): number => {
    if (!amountString) return 0;
    const numericValue = amountString.replace(/[€,\s]/g, "");
    return parseFloat(numericValue) || 0;
  };

  const totalEarnings = summary ? parseAmount(summary.total_earnings) : 0;
  const currentMonthEarnings = summary ? parseAmount(summary.current_month_earnings) : 0;

  const handleDownloadInvoice = (payout: SellerPayoutItem) => {
    toast.success(`Downloading invoice for ${payout.payout_id}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payouts</h1>
          <p className="text-muted-foreground mt-2">
            Track your earnings and payout history
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-primary">{summary?.total_earnings || "€0.00"}</p>
              </div>
              <Wallet className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Month</p>
                <p className="text-2xl font-bold text-foreground">
                  {summary?.current_month_earnings || "€0.00"}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Payout</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card> */}
      </div>


      {/* Search */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardContent className="p-4">
          <div className="flex-1">
            <Label htmlFor="search" className="text-sm font-medium mb-2 block">
              Search Payouts
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by period or payout ID..."
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
              <p className="text-muted-foreground">Loading payouts...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Failed to load payouts. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {!isLoading && !error && (
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredPayouts.length} of {payouts.length} payouts
            </span>
          </div>

          {/* Payouts Table */}
          <Card className="bg-gradient-card border-border shadow-soft">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payout ID</TableHead>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Item Name</TableHead>
                    {/* <TableHead className="text-right">Amount (ex VAT)</TableHead> */}
                    <TableHead className="text-right">Payout Amount</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.map((payout) => (
                    <TableRow key={payout.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{payout.payout_id}</TableCell>
                      <TableCell>{payout.shopify_order_number || "N/A"}</TableCell>
                      <TableCell className="max-w-xs truncate">{payout.item_name || "N/A"}</TableCell>
                      {/* <TableCell className="text-right">
                        €{payout.seller_payout_amount}
                      </TableCell> */}
                      <TableCell className="text-right">
                        <span className="font-semibold text-primary">
                          €{payout.seller_payout_amount_with_vat}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(payout.payment_date)}</TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell>
                        {payout.created_by ? (
                          <div className="text-sm">
                            <div className="font-medium">{payout.created_by.name || "N/A"}</div>
                            <div className="text-muted-foreground text-xs">{payout.created_by.email || "N/A"}</div>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        {(payout.status === "completed" || payout.status === "paid") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(payout)}
                            className="h-8"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredPayouts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payouts found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
