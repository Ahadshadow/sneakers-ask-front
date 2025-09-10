import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { CreditCard, ExternalLink, CheckCircle, Clock, Euro, Search, CalendarIcon, Filter, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { sellersApi, SellerPayout } from "@/lib/api/sellers";

export function PayoutManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [pendingFilter, setPendingFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch seller payouts from API
  const {
    data: payoutsResponse,
    isLoading: isLoadingPayouts,
    error: payoutsError,
    refetch: refetchPayouts,
  } = useQuery({
    queryKey: ['seller-payouts', currentPage, itemsPerPage],
    queryFn: () => sellersApi.getSellerPayouts(currentPage, itemsPerPage),
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  const payouts = payoutsResponse?.data?.payouts || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "processing": return <CreditCard className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending": return "destructive";
      case "processing": return "secondary";
      case "completed": return "default";
      default: return "outline";
    }
  };

  const handlePayWithRevolut = async (seller: SellerPayout) => {
    try {
      // Create Revolut payment link
      const amount = parseFloat(seller.seller_payout_amount).toFixed(2);
      const recipient = encodeURIComponent(seller.seller_email);
      const reference = encodeURIComponent(`Payout for ${seller.item_name}`);
      
      // Revolut Pay link format
      const revolutUrl = `https://revolut.me/pay?amount=${amount}&currency=EUR&recipient=${recipient}&reference=${reference}`;
      
      // Update status to processing via API
      await sellersApi.updatePayoutStatus(seller.id.toString(), "processing");
      
      // Refetch data to get updated status
      refetchPayouts();
      
      // Open Revolut in new tab
      window.open(revolutUrl, '_blank');
      
      toast({
        title: "Revolut Payment Initiated",
        description: `Payment of EUR${amount} to ${seller.seller_store} has been initiated via Revolut.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update payout status",
        variant: "destructive",
      });
    }
  };

  const markAsCompleted = async (sellerId: number) => {
    try {
      await sellersApi.markPayoutCompleted(sellerId.toString());
      
      // Refetch data to get updated status
      refetchPayouts();
      
      toast({
        title: "Payment Completed",
        description: "Payout has been marked as completed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark payout as completed",
        variant: "destructive",
      });
    }
  };

  const filteredPayouts = useMemo(() => {
    return payouts.filter(payout => {
      // Search filter
      const matchesSearch = payout.seller_store.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payout.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payout.seller_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payout.item_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || payout.status === statusFilter;
      
      // Date filter
      const payoutDate = new Date(payout.payment_date);
      const matchesDateFrom = !dateFrom || payoutDate >= dateFrom;
      const matchesDateTo = !dateTo || payoutDate <= dateTo;
      
      // Pending/Unpaid filter based on 5 days after payment date
      const matchesPendingFilter = (() => {
        if (pendingFilter === "all") return true;
        
        if (pendingFilter === "overdue") {
          // Show pending payments where it's been more than 5 days since payment date
          if (payout.status !== "pending") return false;
          
          const currentDate = new Date();
          const paymentDate = new Date(payout.payment_date);
          const daysSincePayment = Math.floor((currentDate.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return daysSincePayment >= 5;
        }
        
        if (pendingFilter === "upcoming") {
          // Show pending payments where it's been less than 5 days since payment date
          if (payout.status !== "pending") return false;
          
          const currentDate = new Date();
          const paymentDate = new Date(payout.payment_date);
          const daysSincePayment = Math.floor((currentDate.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return daysSincePayment < 5;
        }
        
        return true;
      })();
      
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo && matchesPendingFilter;
    });
  }, [payouts, searchTerm, statusFilter, dateFrom, dateTo, pendingFilter]);

  // Use API pagination instead of client-side pagination
  const totalPages = payoutsResponse?.data?.pagination?.last_page || 1;
  const paginatedPayouts = filteredPayouts; // API already handles pagination

  const pendingPayouts = payouts.filter(p => p.status === "pending");
  const totalPendingAmount = pendingPayouts.reduce((sum, p) => sum + parseFloat(p.seller_payout_amount), 0);

  // Show error state only if there's an error
  if (payoutsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load payouts</p>
            <Button onClick={() => refetchPayouts()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
                {isLoadingPayouts ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-2xl font-bold text-primary">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-primary">€{totalPendingAmount.toFixed(2)}</p>
                )}
              </div>
              <Euro className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Sellers</p>
                {isLoadingPayouts ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-2xl font-bold text-primary">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-primary">{pendingPayouts.length}</p>
                )}
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                {isLoadingPayouts ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-2xl font-bold text-primary">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-primary">{payouts.length}</p>
                )}
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                Search Sellers & Products
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by seller name, email, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Label htmlFor="status" className="text-sm font-medium mb-2 block">
                Status
              </Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Pending/Unpaid Filter */}
            <div>
              <Label htmlFor="pendingFilter" className="text-sm font-medium mb-2 block">
                Payments
              </Label>
              <select
                id="pendingFilter"
                value={pendingFilter}
                onChange={(e) => setPendingFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Payments</option>
                <option value="overdue">Overdue (5+ days)</option>
                <option value="upcoming">Upcoming (&lt;5 days)</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <Label className="text-sm font-medium mb-2 block">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div>
              <Label className="text-sm font-medium mb-2 block">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "MMM dd") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDateFrom(undefined);
                  setDateTo(undefined);
                  setPendingFilter("all");
                  setCurrentPage(1);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {isLoadingPayouts ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading payouts...
            </div>
          ) : (
            `Showing ${filteredPayouts.length} of ${payoutsResponse?.data?.pagination?.total || 0} payouts`
          )}
        </span>
        {(searchTerm || statusFilter !== "all" || dateFrom || dateTo || pendingFilter !== "all") && (
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span>Filters active</span>
          </div>
        )}
      </div>

      {/* Payouts Table */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Seller Payouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden hide-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/5">
                  <TableHead className="font-semibold text-foreground">Seller</TableHead>
                  <TableHead className="font-semibold text-foreground">Items</TableHead>
                  <TableHead className="font-semibold text-foreground">Amount</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPayouts ? (
                  // Loading skeleton rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="border-border">
                      <TableCell className="py-4">
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded animate-pulse w-32"></div>
                          <div className="h-2 bg-muted rounded animate-pulse w-48"></div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded animate-pulse w-16"></div>
                          <div className="h-2 bg-muted rounded animate-pulse w-40"></div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="h-6 bg-muted rounded animate-pulse w-24 ml-auto"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  paginatedPayouts.map((payout, index) => (
                    <TableRow 
                      key={payout.id} 
                      className="border-border hover:bg-muted/10 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <h3 className="font-medium text-foreground">{payout.seller_store}</h3>
                          <p className="text-xs text-muted-foreground">{payout.seller_email}</p>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div>
                          <span className="font-medium text-foreground">1 item</span>
                          <div className="text-xs text-muted-foreground mt-1">
                            <div className="truncate max-w-[200px]">
                              {payout.item_name}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="font-bold text-primary text-lg">
                          EUR{parseFloat(payout.seller_payout_amount).toFixed(2)}
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <Badge 
                          variant={getStatusVariant(payout.status)}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getStatusIcon(payout.status)}
                          {payout.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right py-4">
                        <div className="flex gap-2 justify-end">
                          {payout.status === "pending" && (
                            <Button 
                              onClick={() => handlePayWithRevolut(payout)}
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Pay via Revolut
                            </Button>
                          )}
                          {payout.status === "processing" && (
                            <Button 
                              onClick={() => markAsCompleted(payout.id)}
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Mark Complete
                            </Button>
                          )}
                          {payout.status === "completed" && (
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {isLoadingPayouts ? (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading pagination...</span>
          </div>
        </div>
      ) : (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={payoutsResponse?.data?.pagination?.total || 0}
        />
      )}
    </div>
  );
}