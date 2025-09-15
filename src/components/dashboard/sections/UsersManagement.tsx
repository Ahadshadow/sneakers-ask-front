import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, MoreHorizontal, Shield, Edit, Trash2, Loader2 } from "lucide-react";
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
import { usersApi, User, Role } from "@/lib/api";

// Remove the old User interface since we're importing it from the API

export function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "active" | "inactive" | "pending" }) => 
      usersApi.updateUserStatus(id, { status }),
    onSuccess: (response, variables) => {
      // Clear updating state
      setUpdatingUserId(null);
      
      // Optimistically update the cache instead of invalidating all queries
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === variables.id 
            ? { ...user, status: variables.status }
            : user
        )
      );
      
      toast({
        title: "Status Updated",
        description: `User status has been updated to ${variables.status}.`,
      });
    },
    onError: (error) => {
      setUpdatingUserId(null);
      console.error('Error updating user status:', error);
      toast({
        title: "Something went wrong",
        description: "Failed to update user status. Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: () => {
      const userName = deleteDialog.user?.full_name || deleteDialog.user?.email || "User";
      setDeleteDialog({ open: false, user: null });
      toast({
        title: "User Deleted",
        description: `${userName} has been deleted successfully.`,
      });
      // Refetch users after deletion
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast({
        title: "Something went wrong",
        description: "Failed to delete user. Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Fetch users from API using React Query
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', pagination.current_page, searchTerm],
    queryFn: () => usersApi.getUsers({
      search: searchTerm || undefined,
      per_page: pagination.per_page,
      page: pagination.current_page
    }),
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data
  });

  // Process users data when response changes
  useEffect(() => {
    if (usersResponse?.success) {
      const usersData = usersResponse.data.data || [];
      console.log('Received users data:', usersData); // Debug log
      
      // Process users to handle null values and create full_name
      const processedUsers = usersData.map((user: any) => ({
        ...user,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        full_name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user.email || 'Unknown User',
        role: user.role || { id: 0, name: 'No Role', description: 'No role assigned', color: '#6B7280' },
        join_date: user.join_date || new Date().toISOString()
      }));
      
      setUsers(processedUsers);
      setPagination({
        current_page: usersResponse.data.current_page || 1,
        last_page: usersResponse.data.last_page || 1,
        per_page: usersResponse.data.per_page || 15,
        total: usersResponse.data.total || 0
      });
    }
  }, [usersResponse]);

  // Update loading state based on React Query
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  // Handle errors from React Query
  useEffect(() => {
    if (error) {
      console.error('Error loading users:', error);
      setUsers([]); // Clear users on error
      
      // Show retry option for network errors
      if (retryCount < 3 && error instanceof Error && 
          (error.message.includes('Network error') || error.message.includes('timeout'))) {
        setRetryCount(prev => prev + 1);
        toast({
          title: "Connection Error",
          description: `Failed to load users. Retrying... (${retryCount + 1}/3)`,
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setRetryCount(0);
                refetch();
              }}
            >
              Retry Now
            </Button>
          ),
        });
      } else {
        toast({
          title: "Something went wrong",
          description: "Failed to load users. Please try again later.",
          variant: "destructive",
        });
      }
    }
  }, [error, retryCount, refetch, toast]);

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "admin": return "default";
      case "manager": return "secondary";
      case "support": return "outline";
      case "analyst": return "outline";
      case "no role": return "secondary";
      default: return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "pending": return "outline";
      default: return "outline";
    }
  };

  const handleEditUser = (user: User) => {
    navigate(`/edit-employee/${user.id}`);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteDialog({ open: true, user });
  };

  const confirmDelete = () => {
    if (deleteDialog.user) {
      deleteUserMutation.mutate(deleteDialog.user.id);
    }
  };

  const handleStatusChange = (user: User, newStatus: 'active' | 'inactive' | 'pending') => {
    setUpdatingUserId(user.id);
    updateStatusMutation.mutate({ 
      id: user.id, 
      status: newStatus 
    });
  };

  const handleSearch = () => {
    refetch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 w-64"
          />
        </div>
        <Button 
          onClick={() => navigate("/add-employee")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Users Table */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            SneakerAsk Team Members
            {loading && (
              <div className="flex items-center gap-2 ml-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
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
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <TableRow key={`loading-${index}`} className="animate-pulse">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-muted animate-pulse rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                            <div className="h-3 w-48 bg-muted animate-pulse rounded"></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-20 bg-muted animate-pulse rounded-full"></div>
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
              
              {/* Loading footer */}
              <div className="flex items-center justify-between pt-4">
                <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
                  <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
                  <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No users found matching your search' : 'No users found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-card-foreground">
                            {user.full_name || user.email || 'Unknown User'}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role?.name || 'No Role')}>
                          {user.role?.name || 'No Role'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {updatingUserId === user.id ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-sm text-muted-foreground">Updating...</span>
                          </div>
                        ) : (
                          <Badge variant={getStatusBadgeVariant(user.status)}>
                            {user.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.join_date ? new Date(user.join_date).toLocaleDateString() : 'Not set'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(user, user.status === 'active' ? 'inactive' : 'active')}
                              disabled={updatingUserId === user.id}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              {updatingUserId === user.id ? 'Updating...' : (user.status === 'active' ? 'Deactivate' : 'Activate')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.user?.full_name || deleteDialog.user?.email || 'this user'}"? This action cannot be undone and will remove their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}