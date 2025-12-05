import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Mail, Loader2, RefreshCw, Clock, CheckCircle2, XCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InviteSellerModal } from "@/components/dashboard/InviteSellerModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { sellersApi, SellerInvitation } from "@/lib/api/sellers";

export function SellerInvitations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "expired">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Build query params
  const queryParams = useMemo(() => {
    const params: {
      page?: number;
      per_page?: number;
      search?: string;
      status?: "pending" | "completed" | "expired";
      sort_by?: "created_at" | "updated_at" | "expires_at" | "email" | "status";
      sort_order?: "asc" | "desc";
    } = {
      page: currentPage,
      per_page: 15,
      sort_by: "created_at",
      sort_order: "desc",
    };

    if (searchTerm.length >= 2) {
      params.search = searchTerm;
    }

    if (statusFilter !== "all") {
      params.status = statusFilter;
    }

    return params;
  }, [currentPage, searchTerm, statusFilter]);

  // Fetch invitations from API
  const {
    data: invitationsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["seller-invitations", queryParams],
    queryFn: () => sellersApi.getSellerInvitations(queryParams),
    staleTime: 0,
    gcTime: 0,
  });

  // Resend invitation mutation
  const resendMutation = useMutation({
    mutationFn: ({ id, frontendUrl }: { id: number; frontendUrl: string }) =>
      sellersApi.resendInvitation(id, frontendUrl),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["seller-invitations"] });
      toast({
        title: "Invitation Resent",
        description: `Invitation email has been resent to ${response.data.email}`,
      });
      setResendingId(null);
    },
    onError: (error) => {
      toast({
        title: "Resend Failed",
        description: error instanceof Error ? error.message : "Failed to resend invitation",
        variant: "destructive",
      });
      setResendingId(null);
    },
  });

  const handleResend = (invitation: SellerInvitation) => {
    if (invitation.status === "completed") {
      toast({
        title: "Cannot Resend",
        description: "Cannot resend invitation for completed registration",
        variant: "destructive",
      });
      return;
    }

    setResendingId(invitation.id);
    const frontendUrl = window.location.origin;
    resendMutation.mutate({ id: invitation.id, frontendUrl });
  };

  const getStatusBadge = (invitation: SellerInvitation) => {
    if (invitation.status === "completed") {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }
    if (invitation.status === "expired" || invitation.is_expired) {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }
    if (invitation.is_valid) {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Pending
          {invitation.days_until_expiry !== null && (
            <span className="ml-1">({ Math.floor(invitation.days_until_expiry)}d left)</span>
          )}
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const invitations = invitationsResponse?.data?.invitations || [];
  const pagination = invitationsResponse?.data?.pagination;
  const metrics = invitationsResponse?.metrics;

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-semibold text-destructive">Connection Error</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Something went wrong. Please check your connection and try again.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InviteSellerModal 
        open={inviteModalOpen} 
        onOpenChange={(open) => {
          setInviteModalOpen(open);
          if (!open) {
            // Refresh invitations list when modal closes (in case invitation was sent)
            queryClient.invalidateQueries({ queryKey: ["seller-invitations"] });
          }
        }} 
      />
      
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={() => setInviteModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Invite Seller
        </Button>
      </div>

      {/* Invitations Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invitations</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : metrics?.total_invitations || pagination?.total || 0}
                </p>
              </div>
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    metrics?.total_pending ?? invitations.filter((inv) => inv.status === "pending" && inv.is_valid).length
                  )}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    metrics?.total_completed ?? invitations.filter((inv) => inv.status === "completed").length
                  )}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    metrics?.total_expired ?? invitations.filter((inv) => inv.status === "expired" || inv.is_expired).length
                  )}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations Table */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Seller Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading invitations...</p>
              </div>
            </div>
          ) : invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">No invitations found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires At</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Completed At</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>{getStatusBadge(invitation)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(invitation.expires_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(invitation.created_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invitation.completed_at ? formatDate(invitation.completed_at) : "-"}
                      </TableCell>
                      <TableCell>
                        {invitation.seller ? (
                          <div>
                            <p className="font-medium">{invitation.seller.owner_name}</p>
                            {invitation.seller.store_name && (
                              <p className="text-sm text-muted-foreground">
                                {invitation.seller.store_name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {invitation.status !== "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResend(invitation)}
                            disabled={resendingId === invitation.id}
                          >
                            {resendingId === invitation.id ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-3 w-3 mr-2" />
                                Resend
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && (
                <div className="mt-4">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={pagination.last_page}
                    onPageChange={setCurrentPage}
                    itemsPerPage={pagination.per_page}
                    totalItems={pagination.total}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

