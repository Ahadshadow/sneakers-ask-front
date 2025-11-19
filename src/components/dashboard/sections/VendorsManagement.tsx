import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Plus, Edit, Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { vendorsApi, Vendor, CreateVendorRequest, UpdateVendorRequest, DeleteVendorErrorResponse } from "@/lib/api/vendors";
import { PaginationControls } from "../PaginationControls";

type SortField = 'name' | 'email' | 'phone' | 'created_at' | 'updated_at';
type SortOrder = 'asc' | 'desc';

export function VendorsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; vendor: Vendor | null }>({
    open: false,
    vendor: null
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
  });
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch vendors from API using React Query
  const {
    data: vendorsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vendors', pagination.current_page, pagination.per_page, searchTerm, sortBy, sortOrder],
    queryFn: () => vendorsApi.getVendors({
      per_page: pagination.per_page,
      page: pagination.current_page,
      search: searchTerm || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    staleTime: 0,
    gcTime: 0,
  });

  // Handle errors from React Query
  useEffect(() => {
    if (error) {
      console.error('Error loading vendors:', error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Failed to load vendors. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Delete vendor mutation
  const deleteVendorMutation = useMutation({
    mutationFn: (id: number) => vendorsApi.deleteVendor(id),
    onSuccess: () => {
      const vendorName = deleteDialog.vendor?.name || "Vendor";
      setDeleteDialog({ open: false, vendor: null });
      toast({
        title: "Vendor Deleted",
        description: `${vendorName} has been deleted successfully.`,
      });
      refetch();
    },
    onError: (error: any) => {
      console.error('Error deleting vendor:', error);
      
      // Check if it's a DeleteVendorErrorResponse
      if (error && typeof error === 'object' && 'order_items_count' in error) {
        const deleteError = error as DeleteVendorErrorResponse;
        toast({
          title: "Cannot Delete Vendor",
          description: deleteError.message || `Cannot delete vendor. It is linked to ${deleteError.order_items_count || 0} order item(s).`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Something went wrong",
          description: error instanceof Error ? error.message : "Failed to delete vendor. Please try again later.",
          variant: "destructive",
        });
      }
    },
  });

  // Create/Update vendor mutation
  const saveVendorMutation = useMutation({
    mutationFn: (data: CreateVendorRequest | UpdateVendorRequest) => {
      if (editingVendor) {
        return vendorsApi.updateVendor(editingVendor.id, data as UpdateVendorRequest);
      } else {
        return vendorsApi.createVendor(data as CreateVendorRequest);
      }
    },
    onSuccess: (response) => {
      toast({
        title: editingVendor ? "Vendor Updated" : "Vendor Created",
        description: `Vendor "${response.data.name}" has been ${editingVendor ? 'updated' : 'created'} successfully.`,
      });
      resetForm();
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error('Error saving vendor:', error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : `Failed to ${editingVendor ? 'update' : 'create'} vendor. Please try again later.`,
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "" });
    setFormErrors({});
    setEditingVendor(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleDeleteVendor = (vendor: Vendor) => {
    setDeleteDialog({ open: true, vendor });
  };

  const confirmDelete = () => {
    if (deleteDialog.vendor) {
      deleteVendorMutation.mutate(deleteDialog.vendor.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const vendorData: CreateVendorRequest | UpdateVendorRequest = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      };

      saveVendorMutation.mutate(vendorData);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-muted-foreground" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const vendors = vendorsResponse?.data?.data || [];
  const paginationData = vendorsResponse?.data || {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  };

  const canDelete = (vendor: Vendor | null) => {
    if (!vendor) return false;
    return !vendor.order_items_count || vendor.order_items_count === 0;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPagination(prev => ({ ...prev, current_page: 1 }));
            }}
            className="pl-10 w-64"
          />
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Vendor
        </Button>
      </div>

      {/* Vendors Table */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Vendors
            {isLoading && (
              <div className="flex items-center gap-2 ml-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {/* Loading header */}
              <div className="flex items-center justify-between">
                <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
                <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
              </div>
              
              {/* Loading table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    {/* <TableHead>Order Items</TableHead> */}
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <TableRow key={`loading-${index}`} className="animate-pulse">
                      <TableCell>
                        <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-16 bg-muted animate-pulse rounded-full"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto"></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center hover:text-foreground"
                      >
                        Name
                        {getSortIcon('name')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center hover:text-foreground"
                      >
                        Email
                        {getSortIcon('email')}
                      </button>
                    </TableHead>
                    <TableHead>Phone</TableHead>
                    {/* <TableHead>Order Items</TableHead> */}
                    <TableHead>
                      <button
                        onClick={() => handleSort('created_at')}
                        className="flex items-center hover:text-foreground"
                      >
                        Created Date
                        {getSortIcon('created_at')}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No vendors found matching your search' : 'No vendors found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell>
                          <p className="font-medium text-card-foreground">
                            {vendor.name}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">
                            {vendor.email || '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">
                            {vendor.phone || '-'}
                          </p>
                        </TableCell>
                        {/* <TableCell>
                          <Badge variant="outline">
                            {vendor.order_items_count || 0}
                          </Badge>
                        </TableCell> */}
                        <TableCell className="text-muted-foreground">
                          {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditVendor(vendor)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button> */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteVendor(vendor)}
                              disabled={!canDelete(vendor) || deleteVendorMutation.isPending}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title={!canDelete(vendor) ? `Cannot delete: vendor has ${vendor.order_items_count || 0} linked order item(s)` : 'Delete vendor'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {paginationData.total > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                  <PaginationControls
                    currentPage={paginationData.current_page}
                    totalPages={paginationData.last_page}
                    onPageChange={(page) => setPagination(prev => ({ ...prev, current_page: page }))}
                    totalItems={paginationData.total}
                    itemsPerPage={paginationData.per_page}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Vendor Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        if (!open) {
          resetForm();
          setIsCreateOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingVendor ? 'Edit Vendor' : 'Create New Vendor'}</DialogTitle>
            <DialogDescription>
              {editingVendor ? 'Update vendor information below.' : 'Enter vendor information to create a new vendor.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    if (formErrors.name) {
                      setFormErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  placeholder="Vendor name"
                  className={formErrors.name ? 'border-destructive' : ''}
                />
                {formErrors.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                    if (formErrors.email) {
                      setFormErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  placeholder="vendor@example.com"
                  className={formErrors.email ? 'border-destructive' : ''}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsCreateOpen(false);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingVendor ? 'Update Vendor' : 'Create Vendor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, vendor: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.vendor?.name}"? 
              {deleteDialog.vendor && !canDelete(deleteDialog.vendor) && (
                <span className="block mt-2 text-destructive font-semibold">
                  This vendor has {deleteDialog.vendor.order_items_count} linked order item(s) and cannot be deleted.
                </span>
              )}
              {deleteDialog.vendor && canDelete(deleteDialog.vendor) && (
                <span className="block mt-2">This action cannot be undone.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={!deleteDialog.vendor || !canDelete(deleteDialog.vendor) || deleteVendorMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {deleteVendorMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </div>
              ) : (
                "Delete Vendor"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

