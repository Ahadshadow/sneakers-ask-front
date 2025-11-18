import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Store, Plus, MoreHorizontal, Building2, User, Edit, Trash2, Loader2, ToggleLeft, ToggleRight, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { sellersApi, Seller as ApiSeller } from "@/lib/api/sellers";
import { SellerInvitations } from "./SellerInvitations";

// UI Seller interface
interface Seller {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  contactPerson?: string;
  website?: string;
  tinNumber?: string;
  country?: string;
  businessDescription?: string;
  sellerType: "private" | "b2b";
  status: "active" | "pending" | "suspended";
  productsCount: number;
  totalSales: string;
  rating: number;
  joinDate: string;
  whatsappNumber?: string; // Add WhatsApp number field
  vatNumber?: string;
  vatRate?: string;
  vatRegistered?: boolean;
  accountHolder?: string;
  iban?: string;
  bankName?: string;
  paymentSchedule?: "weekly" | "bi-weekly" | "monthly";
  createdAt?: string;
  updatedAt?: string;
  vatSettings: {
    vatNumber?: string;
    vatRate: number;
    vatRegistered: boolean;
  };
  bankDetails: {
    accountHolder: string;
    iban: string;
    bankName: string;
    paymentSchedule: "weekly" | "bi-weekly" | "monthly";
  };
}

// Convert API seller to UI seller format
const convertApiSellerToUISeller = (apiSeller: ApiSeller) => ({
  id: apiSeller.id.toString(),
  storeName: apiSeller.store_name,
  ownerName: apiSeller.owner_name,
  email: apiSeller.email,
  contactPerson: apiSeller.contact_person,
  website: apiSeller.website,
  tinNumber: apiSeller.tin_number,
  country: apiSeller.country,
  businessDescription: apiSeller.business_description,
  sellerType: apiSeller.seller_type,
  status: apiSeller.status,
  productsCount: apiSeller.products_count,
  totalSales: `€${apiSeller.total_sales}`,
  rating: parseFloat(apiSeller.rating),
  joinDate: apiSeller.join_date,
  whatsappNumber: apiSeller.whatsapp_number, // Add WhatsApp number field
  vatNumber: apiSeller.vat_number,
  vatRate: apiSeller.vat_rate,
  vatRegistered: apiSeller.vat_registered,
  accountHolder: apiSeller.account_holder,
  iban: apiSeller.iban,
  bankName: apiSeller.bank_name,
  paymentSchedule: apiSeller.payment_schedule,
  shipmentMethodCode: apiSeller.shipment_method_code,
  createdAt: apiSeller.created_at,
  updatedAt: apiSeller.updated_at,
  vatSettings: {
    vatNumber: apiSeller.vat_number,
    vatRate: parseFloat(apiSeller.vat_rate),
    vatRegistered: apiSeller.vat_registered
  },
  bankDetails: {
    accountHolder: apiSeller.account_holder,
    iban: apiSeller.iban,
    bankName: apiSeller.bank_name,
    paymentSchedule: apiSeller.payment_schedule
  }
});

export function SellersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; seller: Seller | null }>({
    open: false,
    seller: null
  });
  const [updatingSellerId, setUpdatingSellerId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Reset to page 1 when debounced search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Fetch sellers from API
  const {
    data: sellersResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sellers', currentPage, debouncedSearchTerm],
    queryFn: () => sellersApi.getSellers(currentPage, 15, debouncedSearchTerm),
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data
  });

  // Convert API sellers to UI format
  const apiSellers = useMemo(() => {
    if (sellersResponse?.data?.data) {
      return sellersResponse.data.data.map(convertApiSellerToUISeller);
    }
    return [];
  }, [sellersResponse]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "pending": return "secondary";
      case "suspended": return "destructive";
      default: return "outline";
    }
  };

  const getSellerTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "b2b": return "default";
      case "private": return "outline";
      default: return "secondary";
    }
  };

  const handleEditSeller = (seller: Seller) => {
    // Convert UI seller back to API format for editing
    const apiSeller = {
      id: seller.id,
      store_name: seller.storeName,
      owner_name: seller.ownerName,
      email: seller.email,
      contact_person: seller.contactPerson,
      website: seller.website,
      tin_number: seller.tinNumber,
      country: seller.country,
      business_description: seller.businessDescription,
      seller_type: seller.sellerType,
      status: seller.status,
      whatsapp_number: seller.whatsappNumber, // Add WhatsApp number field
      vat_number: seller.vatNumber,
      vat_rate: seller.vatRate,
      vat_registered: seller.vatRegistered,
      account_holder: seller.accountHolder,
      iban: seller.iban,
      bank_name: seller.bankName,
      payment_schedule: seller.paymentSchedule,
      products_count: seller.productsCount,
      shipment_method_code: seller.shipmentMethodCode,
      total_sales: seller.totalSales,
      rating: seller.rating,
      join_date: seller.joinDate,
      created_at: seller.createdAt,
      updated_at: seller.updatedAt
    };
    
    navigate(`/edit-seller/${seller.id}`, { 
      state: { sellerData: apiSeller } 
    });
  };

  const handleDeleteSeller = (seller: Seller) => {
    setDeleteDialog({ open: true, seller });
  };

  // Delete seller mutation
  const deleteSellerMutation = useMutation({
    mutationFn: (id: number) => sellersApi.deleteSeller(id),
    onSuccess: () => {
      const sellerName = deleteDialog.seller?.storeName || deleteDialog.seller?.ownerName || "Seller";
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      toast({
        title: "Seller Deleted",
        description: `${sellerName} has been removed from your seller network.`,
      });
      setDeleteDialog({ open: false, seller: null });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete seller",
        variant: "destructive",
      });
    },
  });

  // Update seller status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "active" | "pending" | "suspended" }) => 
      sellersApi.updateSellerStatus(id, status),
    onSuccess: (response, variables) => {
      // Clear updating state
      setUpdatingSellerId(null);
      
      // Update the current query's cache with the updated seller from response
      queryClient.setQueryData(['sellers', currentPage, debouncedSearchTerm], (oldData: any) => {
        if (!oldData || !oldData.data?.data) return oldData;
        
        // Use the response data if available, otherwise update with the new status
        const updatedSeller = response.data || { id: variables.id, status: variables.status };
        
        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: oldData.data.data.map((seller: any) => 
              Number(seller.id) === variables.id 
                ? { ...seller, ...updatedSeller, status: variables.status }
                : seller
            )
          }
        };
      });
      
      // Also update all other seller queries in cache
      queryClient.setQueriesData(
        { queryKey: ['sellers'] },
        (oldData: any) => {
          if (!oldData || !oldData.data?.data) return oldData;
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              data: oldData.data.data.map((seller: any) => 
                Number(seller.id) === variables.id 
                  ? { ...seller, status: variables.status }
                  : seller
              )
            }
          };
        }
      );
      
      const statusText = variables.status.charAt(0).toUpperCase() + variables.status.slice(1);
      toast({
        title: "Status Updated",
        description: `Seller status changed to ${statusText}.`,
      });
    },
    onError: (error) => {
      // Clear updating state
      setUpdatingSellerId(null);
      
      // Revert optimistic update on error by invalidating
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update seller status",
        variant: "destructive",
      });
    },
  });

  const confirmDelete = () => {
    if (deleteDialog.seller) {
      deleteSellerMutation.mutate(Number(deleteDialog.seller.id));
    }
  };

  const handleStatusChange = (seller: Seller, newStatus: "active" | "pending" | "suspended") => {
    setUpdatingSellerId(seller.id);
    updateStatusMutation.mutate({ 
      id: Number(seller.id), 
      status: newStatus 
    });
  };



  return (
    <div className="space-y-6">
      <Tabs defaultValue="sellers" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="sellers">
              <Store className="h-4 w-4 mr-2" />
              Sellers
            </TabsTrigger>
            <TabsTrigger value="invitations">
              <Mail className="h-4 w-4 mr-2" />
              Invitations
            </TabsTrigger>
          </TabsList>
          <Button 
            onClick={() => navigate("/add-seller")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Seller
          </Button>
        </div>

        <TabsContent value="sellers" className="space-y-6">
          {/* Error State */}
          {error && (
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold text-destructive">Connection Error</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Something went wrong. Please check your connection and try again.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refetch()}
                      className="mt-3"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Header Actions */}
          {!error && (
            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sellers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          )}

          {/* Sellers Stats */}
          {!error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sellers</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : sellersResponse?.metrics?.total_sellers || sellersResponse?.data?.total || 0}
                </p>
              </div>
              <Store className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">B2B Sellers</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : sellersResponse?.metrics?.total_b2b ?? apiSellers.filter(s => s.sellerType === 'b2b').length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Private Sellers</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : sellersResponse?.metrics?.total_private ?? apiSellers.filter(s => s.sellerType === 'private').length}
                </p>
              </div>
              <User className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
            </div>
          )}

          {/* Sellers Table */}
          {!error && (
            <Card className="bg-gradient-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Sellers Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading sellers...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Owner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiSellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-card-foreground">{seller.ownerName}</p>
                      <p className="text-sm text-muted-foreground">{seller.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSellerTypeBadgeVariant(seller.sellerType)}>
                      {seller.sellerType === 'b2b' ? 'B2B' : 'Private'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {seller.productsCount}
                  </TableCell>
                  <TableCell className="font-medium text-success">
                    {seller.totalSales}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-24 justify-between"
                          disabled={updatingSellerId === seller.id}
                        >
                          {updatingSellerId === seller.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              {seller.status === 'active' ? 'Active' : seller.status === 'pending' ? 'Pending' : 'Suspended'}
                              <MoreHorizontal className="h-3 w-3 ml-1" />
                            </>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(seller, 'active')}
                          className={seller.status === 'active' ? 'bg-green-50 text-green-700' : ''}
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Active
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(seller, 'pending')}
                          className={seller.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : ''}
                        >
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(seller, 'suspended')}
                          className={seller.status === 'suspended' ? 'bg-red-50 text-red-700' : ''}
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          Suspended
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditSeller(seller)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteSeller(seller)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination */}
          {!isLoading && sellersResponse?.data && (
            <div className="mt-4">
              <PaginationControls
                currentPage={currentPage}
                totalPages={sellersResponse.data.last_page}
                onPageChange={setCurrentPage}
                itemsPerPage={sellersResponse.data.per_page}
                totalItems={sellersResponse.data.total}
              />
            </div>
          )}
        </CardContent>
      </Card>
          )}

          {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !deleteSellerMutation.isPending && setDeleteDialog({ open, seller: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Seller</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.seller?.storeName || deleteDialog.seller?.ownerName || 'this seller'}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSellerMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteSellerMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSellerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Seller"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6">
          <SellerInvitations />
        </TabsContent>
      </Tabs>
    </div>
  );
}