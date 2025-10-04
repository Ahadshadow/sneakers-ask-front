import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { CreditCard, ExternalLink, CheckCircle, Clock, Euro, Search, CalendarIcon, Filter, Loader2, MessageCircle, X } from "lucide-react";
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
  const [selectedPayout, setSelectedPayout] = useState<SellerPayout | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending": return "bg-red-500 text-white hover:bg-red-600";
      case "processing": return "bg-gray-100 text-gray-700 hover:bg-gray-200";
      case "completed": return "bg-black text-white hover:bg-gray-800";
      default: return "bg-gray-100 text-gray-700 hover:bg-gray-200";
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

  const handleMarkAsPaidClick = (payout: SellerPayout) => {
    setSelectedPayout(payout);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayout) return;
    
    setIsUpdatingStatus(true);
    
    try {
      // Use the existing API function for updating payout status
      const result = await sellersApi.updatePayoutStatus(selectedPayout.id.toString(), "completed");
      
      // Refetch data to get updated status
      await refetchPayouts();
      
      toast({
        title: "Payment Completed",
        description: result.message || "Payout has been marked as completed.",
      });
      
      setIsConfirmModalOpen(false);
      setSelectedPayout(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update payout status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
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
      {/* Search and Filter Section */}
      <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
           <div className="">
               <div className="flex items-end gap-3">
               {/* Search */}
               <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Search Sellers & Products</label>
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                   <Input
                     placeholder="Search sellers, products, SKUs..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                   />
                 </div>
               </div>

               {/* Status Filter */}
               <div className="w-40">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                 <select
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                 >
                   <option value="all">All Status</option>
                   <option value="pending">Pending</option>
                   <option value="processing">Processing</option>
                   <option value="completed">Completed</option>
                 </select>
               </div>

               {/* Payments Filter */}
               <div className="w-40">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Payments</label>
                 <select
                   value={pendingFilter}
                   onChange={(e) => setPendingFilter(e.target.value)}
                   className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                 >
                   <option value="all">All Payments</option>
                   <option value="overdue">Overdue (5+ days)</option>
                   <option value="upcoming">Upcoming (&lt;5 days)</option>
                 </select>
               </div>

               {/* Clear Button */}
               <div>
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
                   className="text-gray-500 hover:text-gray-700 h-10 px-4"
                 >
                   Clear
                 </Button>
               </div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
          {isLoadingPayouts ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading payouts...
            </div>
          ) : (
          `Showing ${filteredPayouts.length} of ${payoutsResponse?.data?.pagination?.total || 0} sellers`
        )}
      </div>

      {/* Payouts Table */}
       <div className="overflow-hidden">
            <Table>
              <TableHeader>
             <TableRow className="border-b border-gray-200">
               <TableHead className="font-bold text-gray-400 py-3 px-0">Seller</TableHead>
               <TableHead className="font-bold text-gray-400 py-3 px-0">Items</TableHead>
               <TableHead className="font-bold text-gray-400 py-3 px-0">Amount</TableHead>
               <TableHead className="font-bold text-gray-400 py-3 px-0">Status</TableHead>
               <TableHead className="font-bold text-gray-400 py-3 px-0 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPayouts ? (
                  // Loading skeleton rows
                  Array.from({ length: 5 }).map((_, index) => (
                 <TableRow key={`skeleton-${index}`} className="border-b border-gray-200">
                   <TableCell className="py-4 px-0">
                        <div className="space-y-2">
                       <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                       <div className="h-3 bg-gray-200 rounded animate-pulse w-48"></div>
                        </div>
                      </TableCell>
                   <TableCell className="py-4 px-0">
                        <div className="space-y-2">
                       <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                       <div className="h-3 bg-gray-200 rounded animate-pulse w-40"></div>
                        </div>
                      </TableCell>
                   <TableCell className="py-4 px-0">
                     <div className="h-5 bg-gray-200 rounded animate-pulse w-20"></div>
                      </TableCell>
                   <TableCell className="py-4 px-0">
                     <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                      </TableCell>
                   <TableCell className="py-4 px-0">
                     <div className="h-8 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  paginatedPayouts.map((payout, index) => (
                    <TableRow 
                      key={payout.id} 
                   className="border-b border-gray-200 hover:bg-transparent"
                    >
                   <TableCell className="py-4 px-0">
                        <div className="space-y-1">
                       <div className="flex items-center gap-2">
                         <h3 className="font-semibold text-gray-900">{payout.seller_store}</h3>
                         <MessageCircle className="h-4 w-4 text-green-500" />
                       </div>
                       <p className="text-sm text-gray-500">{payout.seller_email}</p>
                        </div>
                      </TableCell>

                   <TableCell className="py-4 px-0">
                     <div className="space-y-1">
                       <span className="font-semibold text-gray-900">1 item</span>
                       <div className="text-sm text-gray-500">
                            <div className="truncate max-w-[200px]">
                              {payout.item_name}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                   <TableCell className="py-4 px-0">
                     <div className="font-bold text-black text-lg">
                       €{parseFloat(payout.seller_payout_amount).toFixed(2)}
                        </div>
                      </TableCell>

                   <TableCell className="py-4 px-0">
                     <Badge 
                       variant={getStatusVariant(payout.status)}
                       className={`flex items-center gap-1 w-fit rounded-full ${getStatusBadgeClass(payout.status)}`}
                     >
                       {getStatusIcon(payout.status)}
                       {payout.status}
                     </Badge>
                   </TableCell>

                   <TableCell className="text-right py-4 px-0">
                     <div className="flex justify-end">
                       {payout.status === "pending" && (
                         <Button 
                           onClick={() => handleMarkAsPaidClick(payout)}
                           size="sm"
                           className="flex items-center gap-1 bg-black hover:bg-gray-800 text-white rounded-md"
                         >
                           <CheckCircle className="h-4 w-4" />
                           Mark as Paid
                         </Button>
                       )}
                       {payout.status === "processing" && (
                         <Button 
                           onClick={() => handleMarkAsPaidClick(payout)}
                           size="sm"
                           className="flex items-center gap-1 bg-black hover:bg-gray-800 text-white rounded-md"
                         >
                           <CheckCircle className="h-4 w-4" />
                           Mark as Paid
                         </Button>
                       )}
                       {payout.status === "completed" && (
                         <Button 
                           size="sm"
                           className="flex items-center gap-1 bg-black text-white cursor-default rounded-md"
                         >
                           <CheckCircle className="h-4 w-4" />
                           Paid
                         </Button>
                       )}
                     </div>
                   </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

      {/* Pagination */}
      {isLoadingPayouts ? (
        <div className="flex items-center justify-center py-2">
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

       {/* Confirm Payment Modal */}
       <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
         <DialogContent className="w-[95vw] max-w-md p-0 bg-white rounded-lg shadow-xl">
           <div className="p-6">
             {/* Header */}
             <div className="flex items-center justify-between mb-3">
               <h2 className="text-lg font-bold text-gray-900">Confirm Payment</h2>
            
             </div>
             
             <p className="text-sm text-gray-600 mb-4">
               Are you sure you want to mark this payout as paid?
             </p>
             
             {selectedPayout && (
               <div className="space-y-4">
                 {/* Payment Details */}
                 <div className="space-y-3">
                   <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Payment Details</h3>
                   <div className="space-y-2">
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-medium text-gray-500">Seller:</span>
                       <span className="text-sm font-bold text-gray-900">{selectedPayout.seller_store}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-medium text-gray-500">Amount:</span>
                       <span className="text-lg font-bold text-gray-900">€{parseFloat(selectedPayout.seller_payout_amount).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-medium text-gray-500">Items:</span>
                       <span className="text-sm text-gray-900">1</span>
                     </div>
                   </div>
                 </div>

                 <div className="border-t border-gray-200"></div>

                 {/* Bank Details */}
                 <div className="space-y-3">
                   <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Bank Details</h3>
                   <div className="space-y-2">
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-medium text-gray-500">Account Holder:</span>
                       <span className="text-sm text-gray-900">{selectedPayout.account_holder || `${selectedPayout.seller_store} Ltd`}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-medium text-gray-500">IBAN:</span>
                       <span className="text-sm text-gray-900 font-mono">{selectedPayout.iban || "NL89 3704 0044 0532 0130 00"}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-medium text-gray-500">Bank Name:</span>
                       <span className="text-sm text-gray-900">{selectedPayout.bank_name || "ING Bank"}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-medium text-gray-500">Payment Schedule:</span>
                       <span className="text-sm text-gray-900 capitalize">{selectedPayout.payment_schedule || "Bi Weekly"}</span>
                     </div>
                   </div>
                 </div>
               </div>
             )}
           </div>

           {/* Footer */}
           <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
             <Button
               variant="outline"
               onClick={() => setIsConfirmModalOpen(false)}
               className="h-9 px-4 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium"
             >
               Cancel
             </Button>
             <Button
               onClick={handleConfirmPayment}
               disabled={isUpdatingStatus}
               className="h-9 px-4 bg-black hover:bg-gray-800 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isUpdatingStatus ? (
                 <div className="flex items-center gap-2">
                   <Loader2 className="h-4 w-4 animate-spin" />
                   Updating...
                 </div>
               ) : (
                 "Confirm Payment"
               )}
             </Button>
           </div>
         </DialogContent>
       </Dialog>
    </div>
  );
}