import { useState, useMemo } from "react";
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
import { CreditCard, ExternalLink, CheckCircle, Clock, Euro, Search, CalendarIcon, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SellerPayout {
  id: string;
  sellerName: string;
  email: string;
  totalAmount: number;
  itemCount: number;
  status: "pending" | "processing" | "completed";
  lastPayoutDate?: string;
  items: {
    productName: string;
    sku: string;
    amount: number;
    purchaseDate: string;
  }[];
}

export function PayoutManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [pendingFilter, setPendingFilter] = useState<string>("all");
  const [payouts, setPayouts] = useState<SellerPayout[]>([
    {
      id: "1",
      sellerName: "Premium Kicks Store",
      email: "payments@premiumkicks.com",
      totalAmount: 145,
      itemCount: 1,
      status: "pending",
      items: [
        {
          productName: "Nike Air Jordan 1 Retro High OG",
          sku: "555088-134",
          amount: 145,
          purchaseDate: "2024-01-15"
        }
      ]
    },
    {
      id: "2",
      sellerName: "Sneaker World",
      email: "finance@sneakerworld.com",
      totalAmount: 195,
      itemCount: 1,
      status: "pending",
      items: [
        {
          productName: "Adidas Yeezy Boost 350 V2",
          sku: "GZ5541",
          amount: 195,
          purchaseDate: "2024-01-14"
        }
      ]
    },
    {
      id: "3",
      sellerName: "Urban Footwear",
      email: "payouts@urbanfootwear.com",
      totalAmount: 85,
      itemCount: 1,
      status: "pending",
      items: [
        {
          productName: "Nike Dunk Low Retro",
          sku: "DD1391-100",
          amount: 85,
          purchaseDate: "2024-01-13"
        }
      ]
    },
    {
      id: "4",
      sellerName: "Classic Runners",
      email: "admin@classicrunners.com",
      totalAmount: 95,
      itemCount: 1,
      status: "completed",
      lastPayoutDate: "2024-01-10",
      items: [
        {
          productName: "New Balance 550 White Green",
          sku: "BB550WTG",
          amount: 95,
          purchaseDate: "2024-01-12"
        }
      ]
    }
  ]);

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

  const handlePayWithRevolut = (seller: SellerPayout) => {
    // Create Revolut payment link
    const amount = seller.totalAmount.toFixed(2);
    const recipient = encodeURIComponent(seller.email);
    const reference = encodeURIComponent(`Payout for ${seller.itemCount} items`);
    
    // Revolut Pay link format
    const revolutUrl = `https://revolut.me/pay?amount=${amount}&currency=EUR&recipient=${recipient}&reference=${reference}`;
    
    // Update status to processing
    setPayouts(prev => prev.map(p => 
      p.id === seller.id ? { ...p, status: "processing" as const } : p
    ));
    
    // Open Revolut in new tab
    window.open(revolutUrl, '_blank');
    
    toast({
      title: "Revolut Payment Initiated",
      description: `Payment of €${amount} to ${seller.sellerName} has been initiated via Revolut.`,
    });
  };

  const markAsCompleted = (sellerId: string) => {
    setPayouts(prev => prev.map(p => 
      p.id === sellerId ? { 
        ...p, 
        status: "completed" as const,
        lastPayoutDate: new Date().toISOString().split('T')[0]
      } : p
    ));
    
    toast({
      title: "Payment Completed",
      description: "Payout has been marked as completed.",
    });
  };

  const filteredPayouts = useMemo(() => {
    return payouts.filter(payout => {
      // Search filter
      const matchesSearch = payout.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payout.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payout.items.some(item => 
                            item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.sku.toLowerCase().includes(searchTerm.toLowerCase())
                          );
      
      // Status filter
      const matchesStatus = statusFilter === "all" || payout.status === statusFilter;
      
      // Date filter
      const latestItemDate = new Date(Math.max(...payout.items.map(item => new Date(item.purchaseDate).getTime())));
      const matchesDateFrom = !dateFrom || latestItemDate >= dateFrom;
      const matchesDateTo = !dateTo || latestItemDate <= dateTo;
      
      // Pending/Unpaid filter based on 5 days after arrival
      const matchesPendingFilter = (() => {
        if (pendingFilter === "all") return true;
        
        if (pendingFilter === "overdue") {
          // Show pending payments where it's been more than 5 days since arrival
          if (payout.status !== "pending") return false;
          
          const currentDate = new Date();
          const arrivalDate = new Date(Math.max(...payout.items.map(item => new Date(item.purchaseDate).getTime())));
          const daysSinceArrival = Math.floor((currentDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return daysSinceArrival >= 5;
        }
        
        if (pendingFilter === "upcoming") {
          // Show pending payments where it's been less than 5 days since arrival
          if (payout.status !== "pending") return false;
          
          const currentDate = new Date();
          const arrivalDate = new Date(Math.max(...payout.items.map(item => new Date(item.purchaseDate).getTime())));
          const daysSinceArrival = Math.floor((currentDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return daysSinceArrival < 5;
        }
        
        return true;
      })();
      
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo && matchesPendingFilter;
    });
  }, [payouts, searchTerm, statusFilter, dateFrom, dateTo, pendingFilter]);

  const pendingPayouts = payouts.filter(p => p.status === "pending");
  const totalPendingAmount = pendingPayouts.reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
                <p className="text-2xl font-bold text-primary">€{totalPendingAmount.toFixed(2)}</p>
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
                <p className="text-2xl font-bold text-primary">{pendingPayouts.length}</p>
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
                <p className="text-2xl font-bold text-primary">{payouts.reduce((sum, p) => sum + p.itemCount, 0)}</p>
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
          Showing {filteredPayouts.length} of {payouts.length} sellers
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
          <div className="rounded-lg border border-border overflow-hidden">
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
                {filteredPayouts.map((payout, index) => (
                  <TableRow 
                    key={payout.id} 
                    className="border-border hover:bg-muted/10 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <h3 className="font-medium text-foreground">{payout.sellerName}</h3>
                        <p className="text-xs text-muted-foreground">{payout.email}</p>
                        {payout.lastPayoutDate && (
                          <p className="text-xs text-muted-foreground">
                            Last: {new Date(payout.lastPayoutDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div>
                        <span className="font-medium text-foreground">{payout.itemCount} items</span>
                        <div className="text-xs text-muted-foreground mt-1">
                          {payout.items.map((item, i) => (
                            <div key={i} className="truncate max-w-[200px]">
                              {item.productName}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="font-bold text-primary text-lg">
                        €{payout.totalAmount.toFixed(2)}
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}