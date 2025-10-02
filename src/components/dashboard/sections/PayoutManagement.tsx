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
import { CheckCircle, Clock, Search, Filter, Loader2, Undo } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInView } from "react-intersection-observer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; payout: SellerPayout | null }>({ 
    open: false, 
    payout: null 
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
    },
    {
      id: "5",
      sellerName: "Elite Sneakers Co",
      email: "billing@elitesneakers.com",
      totalAmount: 320,
      itemCount: 2,
      status: "pending",
      items: [
        {
          productName: "Jordan 4 Retro Military Black",
          sku: "DH6927-111",
          amount: 175,
          purchaseDate: "2024-01-16"
        },
        {
          productName: "Nike SB Dunk Low Pro",
          sku: "BQ6817-008",
          amount: 145,
          purchaseDate: "2024-01-16"
        }
      ]
    },
    {
      id: "6",
      sellerName: "Street Style Kicks",
      email: "payments@streetstyle.com",
      totalAmount: 210,
      itemCount: 1,
      status: "processing",
      items: [
        {
          productName: "Off-White x Nike Air Force 1",
          sku: "AO4297-100",
          amount: 210,
          purchaseDate: "2024-01-11"
        }
      ]
    },
    {
      id: "7",
      sellerName: "Retro Sneaker Hub",
      email: "finance@retrosneakerhub.com",
      totalAmount: 165,
      itemCount: 1,
      status: "completed",
      lastPayoutDate: "2024-01-09",
      items: [
        {
          productName: "Air Max 1 Anniversary",
          sku: "908375-104",
          amount: 165,
          purchaseDate: "2024-01-08"
        }
      ]
    },
    {
      id: "8",
      sellerName: "Kicks Warehouse",
      email: "admin@kickswarehouse.com",
      totalAmount: 280,
      itemCount: 2,
      status: "pending",
      items: [
        {
          productName: "Travis Scott x Air Jordan 1 Low",
          sku: "DM7866-162",
          amount: 155,
          purchaseDate: "2024-01-17"
        },
        {
          productName: "Sacai x Nike LDWaffle",
          sku: "BV0073-101",
          amount: 125,
          purchaseDate: "2024-01-17"
        }
      ]
    },
    {
      id: "9",
      sellerName: "Sole Traders",
      email: "payouts@soletraders.com",
      totalAmount: 190,
      itemCount: 1,
      status: "pending",
      items: [
        {
          productName: "Yeezy 700 V3 Azael",
          sku: "FW4980",
          amount: 190,
          purchaseDate: "2024-01-15"
        }
      ]
    },
    {
      id: "10",
      sellerName: "Premium Footwear Ltd",
      email: "billing@premiumfootwear.com",
      totalAmount: 395,
      itemCount: 3,
      status: "completed",
      lastPayoutDate: "2024-01-08",
      items: [
        {
          productName: "Union x Air Jordan 4",
          sku: "DJ5718-001",
          amount: 165,
          purchaseDate: "2024-01-07"
        },
        {
          productName: "Nike Air Max 97 Silver Bullet",
          sku: "884421-001",
          amount: 135,
          purchaseDate: "2024-01-07"
        },
        {
          productName: "Converse Chuck 70 High",
          sku: "162050C",
          amount: 95,
          purchaseDate: "2024-01-07"
        }
      ]
    },
    {
      id: "11",
      sellerName: "Fresh Kicks Market",
      email: "payments@freshkicks.com",
      totalAmount: 175,
      itemCount: 1,
      status: "processing",
      items: [
        {
          productName: "New Balance 992 Grey",
          sku: "M992GR",
          amount: 175,
          purchaseDate: "2024-01-12"
        }
      ]
    },
    {
      id: "12",
      sellerName: "Sneaker Vault",
      email: "finance@sneakervault.com",
      totalAmount: 245,
      itemCount: 2,
      status: "pending",
      items: [
        {
          productName: "Air Jordan 11 Retro Cool Grey",
          sku: "378037-001",
          amount: 155,
          purchaseDate: "2024-01-18"
        },
        {
          productName: "Puma RS-X3",
          sku: "372849-01",
          amount: 90,
          purchaseDate: "2024-01-18"
        }
      ]
    },
    {
      id: "13",
      sellerName: "Urban Sole Collection",
      email: "admin@urbansolecollection.com",
      totalAmount: 310,
      itemCount: 2,
      status: "pending",
      items: [
        {
          productName: "Balenciaga Triple S",
          sku: "524039-W09E1-9000",
          amount: 210,
          purchaseDate: "2024-01-16"
        },
        {
          productName: "Common Projects Achilles Low",
          sku: "1528-0506",
          amount: 100,
          purchaseDate: "2024-01-16"
        }
      ]
    },
    {
      id: "14",
      sellerName: "Hype Sneakers Pro",
      email: "billing@hypesneakerspro.com",
      totalAmount: 140,
      itemCount: 1,
      status: "completed",
      lastPayoutDate: "2024-01-11",
      items: [
        {
          productName: "Vans Old Skool Black White",
          sku: "VN000D3HY28",
          amount: 140,
          purchaseDate: "2024-01-10"
        }
      ]
    },
    {
      id: "15",
      sellerName: "Authentic Kicks Store",
      email: "payments@authentickicks.com",
      totalAmount: 425,
      itemCount: 3,
      status: "pending",
      items: [
        {
          productName: "Dior x Air Jordan 1 High",
          sku: "CN8607-002",
          amount: 185,
          purchaseDate: "2024-01-19"
        },
        {
          productName: "Yeezy Slide Bone",
          sku: "FZ5897",
          amount: 120,
          purchaseDate: "2024-01-19"
        },
        {
          productName: "Nike Blazer Mid 77 Vintage",
          sku: "BQ6806-100",
          amount: 120,
          purchaseDate: "2024-01-19"
        }
      ]
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "processing": return <Clock className="h-4 w-4" />;
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

  const confirmMarkAsPaid = (seller: SellerPayout) => {
    setConfirmDialog({ open: true, payout: seller });
  };

  const markAsPaid = () => {
    if (!confirmDialog.payout) return;
    
    const seller = confirmDialog.payout;
    const payoutDate = new Date().toISOString().split('T')[0];
    
    setPayouts(prev => prev.map(p => 
      p.id === seller.id ? { 
        ...p, 
        status: "completed" as const,
        lastPayoutDate: payoutDate
      } : p
    ));
    
    toast({
      title: "Payment Completed",
      description: `Payout of €${seller.totalAmount.toFixed(2)} to ${seller.sellerName} marked as paid on ${new Date(payoutDate).toLocaleDateString()}.`,
    });
    
    setConfirmDialog({ open: false, payout: null });
  };

  const undoPayout = (seller: SellerPayout) => {
    setPayouts(prev => prev.map(p => 
      p.id === seller.id ? { 
        ...p, 
        status: "pending" as const,
        lastPayoutDate: undefined
      } : p
    ));
    
    toast({
      title: "Payment Undone",
      description: `Payout for ${seller.sellerName} has been reverted to pending.`,
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
                            onClick={() => confirmMarkAsPaid(payout)}
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark as Paid
                          </Button>
                        )}
                        {payout.status === "processing" && (
                          <Button 
                            onClick={() => confirmMarkAsPaid(payout)}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark as Paid
                          </Button>
                        )}
                        {payout.status === "completed" && (
                          <>
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Paid
                            </Badge>
                            <Button 
                              onClick={() => undoPayout(payout)}
                              size="sm"
                              variant="ghost"
                              className="flex items-center gap-1"
                            >
                              <Undo className="h-4 w-4" />
                              Undo
                            </Button>
                          </>
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

      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, payout: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this payout as paid?
            </DialogDescription>
          </DialogHeader>
          {confirmDialog.payout && (
            <div className="py-4">
              <p className="text-sm"><strong>Seller:</strong> {confirmDialog.payout.sellerName}</p>
              <p className="text-sm"><strong>Amount:</strong> €{confirmDialog.payout.totalAmount.toFixed(2)}</p>
              <p className="text-sm"><strong>Items:</strong> {confirmDialog.payout.itemCount}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, payout: null })}>
              Cancel
            </Button>
            <Button onClick={markAsPaid}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}