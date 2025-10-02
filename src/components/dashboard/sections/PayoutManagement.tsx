import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, CheckCircle, Clock, Search, Filter, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInView } from "react-intersection-observer";

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
  const [pendingFilter, setPendingFilter] = useState<string>("all");
  const [displayCount, setDisplayCount] = useState(20);
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });
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
      case "processing": return <ExternalLink className="h-4 w-4" />;
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
      
      return matchesSearch && matchesStatus && matchesPendingFilter;
    });
  }, [payouts, searchTerm, statusFilter, pendingFilter]);

  // Load more items when scrolling
  useEffect(() => {
    if (inView && displayCount < filteredPayouts.length) {
      setTimeout(() => {
        setDisplayCount(prev => Math.min(prev + 20, filteredPayouts.length));
      }, 100);
    }
  }, [inView, displayCount, filteredPayouts.length]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(20);
  }, [searchTerm, statusFilter, pendingFilter]);

  const displayedPayouts = useMemo(() => {
    return filteredPayouts.slice(0, displayCount);
  }, [filteredPayouts, displayCount]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">

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
                  placeholder="Search sellers, products, SKUs..."
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

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
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
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>
          Showing {filteredPayouts.length} of {payouts.length} sellers
        </span>
        {(searchTerm || statusFilter !== "all" || pendingFilter !== "all") && (
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span>Filters active</span>
          </div>
        )}
      </div>

      {/* Payouts Table */}
      <div className="w-full">
        <div className="overflow-x-auto custom-scrollbar">
          <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-muted-foreground text-sm py-4">Seller</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-sm py-4">Items</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-sm py-4">Amount</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-sm py-4">Status</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-sm py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedPayouts.map((payout, index) => (
                  <TableRow 
                    key={payout.id} 
                    className="hover:bg-muted/5 transition-colors duration-200 border-b"
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
                {displayCount < filteredPayouts.length && (
                  <TableRow ref={ref}>
                    <TableCell colSpan={5} className="h-24 text-center border-b">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading more sellers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className="px-4 py-3 bg-muted/10 mt-2">
          <p className="text-xs text-muted-foreground text-center">
            Showing <span className="font-medium text-foreground">{displayedPayouts.length}</span> of <span className="font-medium text-foreground">{filteredPayouts.length}</span> sellers
            {displayCount < filteredPayouts.length && <span className="ml-1">(scroll for more)</span>}
          </p>
        </div>
      </div>
    </div>
  );
}