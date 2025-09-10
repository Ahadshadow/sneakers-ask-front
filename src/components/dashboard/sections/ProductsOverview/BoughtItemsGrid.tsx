import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Package2, Truck, CheckCircle, Clock, AlertCircle, PackageCheck, Search, CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { WTBPurchase } from "./types";

interface BoughtItemsGridProps {
  purchases: WTBPurchase[];
}

export function BoughtItemsGrid({ purchases }: BoughtItemsGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredPurchases = useMemo(() => {
    return purchases.filter(purchase => {
      // Search filter
      const matchesSearch = purchase.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          purchase.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          purchase.seller.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
      
      // Date filter
      const purchaseDate = new Date(purchase.purchaseDate);
      const matchesDateFrom = !dateFrom || purchaseDate >= dateFrom;
      const matchesDateTo = !dateTo || purchaseDate <= dateTo;
      
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [purchases, searchTerm, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const paginatedPurchases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPurchases.slice(startIndex, endIndex);
  }, [filteredPurchases, currentPage, itemsPerPage]);
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing": return <Clock className="h-3.5 w-3.5" />;
      case "shipped": return <Truck className="h-3.5 w-3.5" />;
      case "delivered": return <CheckCircle className="h-3.5 w-3.5" />;
      case "confirmed": return <PackageCheck className="h-3.5 w-3.5" />;
      case "pending": return <Clock className="h-3.5 w-3.5" />;
      default: return <Package2 className="h-3.5 w-3.5" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20";
      case "processing":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20";
      case "shipped":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20";
      case "delivered":
        return "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20";
      case "confirmed":
        return "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (purchases.length === 0) {
    return (
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardContent className="p-8 text-center">
          <Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No WTB Purchases Yet</h3>
          <p className="text-muted-foreground">
            Start browsing products and make your first WTB purchase.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package2 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">WTB Purchases Overview</h2>
        <span className="text-muted-foreground">Browse and track your sourced products</span>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                Search Products
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by product name, SKU, or seller..."
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
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="confirmed">Confirmed</option>
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
          Showing {filteredPurchases.length} of {purchases.length} purchases
        </span>
        {(searchTerm || statusFilter !== "all" || dateFrom || dateTo) && (
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span>Filters active</span>
          </div>
        )}
      </div>
      
      <div className="rounded-lg border border-border bg-gradient-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="max-h-[400px] sm:max-h-[600px] overflow-y-auto hide-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/5">
                  <TableHead className="font-semibold text-foreground text-sm">Product</TableHead>
                  <TableHead className="font-semibold text-foreground text-sm">Payout</TableHead>
                  <TableHead className="font-semibold text-foreground text-sm hidden md:table-cell">Seller</TableHead>
                  <TableHead className="font-semibold text-foreground text-sm hidden lg:table-cell">Status</TableHead>
                  <TableHead className="font-semibold text-foreground text-sm text-right">Purchase Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPurchases.map((purchase, index) => (
                  <TableRow 
                    key={purchase.id} 
                    className="border-border hover:bg-muted/10 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Product Column */}
                    <TableCell className="py-3 sm:py-4">
                      <div className="space-y-1">
                        <h3 className="font-medium text-foreground text-sm leading-tight">
                          {purchase.product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          SKU: {purchase.product.sku}
                        </p>
                      </div>
                    </TableCell>

                    {/* Payout Column */}
                    <TableCell className="py-3 sm:py-4">
                      <div className="font-bold text-primary text-base">
                        EUR{purchase.payoutPrice}
                      </div>
                    </TableCell>

                    {/* Seller Column */}
                    <TableCell className="py-3 sm:py-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground text-sm truncate max-w-[120px]">
                          {purchase.seller}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {purchase.shippingMethod}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 sm:py-4 hidden lg:table-cell">
                      <Badge 
                        variant="outline"
                        className={`flex items-center gap-2 w-fit text-xs font-medium ${getStatusBadgeClass(purchase.status)}`}
                      >
                        {getStatusIcon(purchase.status)}
                        {purchase.status}
                      </Badge>
                    </TableCell>

                    {/* Purchase Date Column */}
                    <TableCell className="text-right py-3 sm:py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground text-sm">
                          {new Date(purchase.purchaseDate).toLocaleDateString('en-GB')}
                        </p>
                        <p className="text-xs text-muted-foreground lg:hidden">
                          {purchase.status}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredPurchases.length}
      />

    </div>
  );
}