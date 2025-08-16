import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Plus, Edit, Trash2, Users, Eye, Package, Store, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: any;
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  color: string;
  permissions: string[];
}

const availablePermissions: Permission[] = [
  {
    id: "view_dashboard",
    name: "View Dashboard",
    description: "Access to dashboard overview and analytics",
    icon: Eye
  },
  {
    id: "manage_products",
    name: "Manage Products",
    description: "View and manage Shopify products",
    icon: Package
  },
  {
    id: "manage_users",
    name: "Manage Users",
    description: "Add, edit, and delete team members",
    icon: Users
  },
  {
    id: "manage_roles",
    name: "Manage Roles",
    description: "Create and modify user roles and permissions",
    icon: Shield
  },
  {
    id: "manage_sellers",
    name: "Manage Sellers",
    description: "Oversee seller accounts and onboarding",
    icon: Store
  },
  {
    id: "system_settings",
    name: "System Settings",
    description: "Access to system configuration and settings",
    icon: Settings
  }
];

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Admin",
    description: "Full system access and management privileges",
    userCount: 2,
    color: "destructive",
    permissions: ["view_dashboard", "manage_products", "manage_users", "manage_roles", "manage_sellers", "system_settings"]
  },
  {
    id: "2", 
    name: "Manager",
    description: "Manage team members and oversee operations",
    userCount: 3,
    color: "default",
    permissions: ["view_dashboard", "manage_products", "manage_users", "manage_sellers"]
  },
  {
    id: "3",
    name: "Employee",
    description: "Standard employee access to daily tasks",
    userCount: 8,
    color: "secondary",
    permissions: ["view_dashboard", "manage_products"]
  },
  {
    id: "4",
    name: "Support",
    description: "Customer support and assistance",
    userCount: 4,
    color: "outline",
    permissions: ["view_dashboard", "manage_products", "manage_sellers"]
  }
];

export function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; role: Role | null }>({
    open: false,
    role: null
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(id => id !== permissionId)
    }));
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", permissions: [] });
    setEditingRole(null);
  };

  const handleCreateRole = () => {
    if (!formData.name.trim()) return;
    
    const newRole: Role = {
      id: (roles.length + 1).toString(),
      name: formData.name,
      description: formData.description,
      userCount: 0,
      color: "outline",
      permissions: formData.permissions
    };
    
    setRoles([...roles, newRole]);
    toast({
      title: "Role Created",
      description: `Role "${formData.name}" has been created successfully.`,
    });
    
    resetForm();
    setIsCreateOpen(false);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions || []
    });
    setIsCreateOpen(true);
  };

  const handleUpdateRole = () => {
    if (!editingRole || !formData.name.trim()) return;
    
    setRoles(roles.map(role => 
      role.id === editingRole.id 
        ? { ...role, name: formData.name, description: formData.description, permissions: formData.permissions }
        : role
    ));
    
    toast({
      title: "Role Updated",
      description: `Role "${formData.name}" has been updated successfully.`,
    });
    
    resetForm();
    setIsCreateOpen(false);
  };

  const handleDeleteRole = (role: Role) => {
    setDeleteDialog({ open: true, role });
  };

  const confirmDelete = () => {
    if (deleteDialog.role) {
      setRoles(roles.filter(role => role.id !== deleteDialog.role!.id));
      toast({
        title: "Role Deleted",
        description: `Role "${deleteDialog.role.name}" has been deleted.`,
      });
      setDeleteDialog({ open: false, role: null });
    }
  };

  const handleCloseDialog = () => {
    setIsCreateOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">User Roles</h3>
          <p className="text-sm text-muted-foreground">Define and manage employee roles and permissions</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 transition-all duration-200 hover-scale">
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-border">
            <DialogHeader>
              <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name *</Label>
                <Input
                  id="roleName"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter role name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleDescription">Description</Label>
                <Textarea
                  id="roleDescription"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the role responsibilities"
                  rows={3}
                />
              </div>
              
              {/* Permissions Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Permissions</Label>
                <div className="grid grid-cols-1 gap-3 p-4 border border-border rounded-lg bg-muted/20">
                  {availablePermissions.map((permission) => {
                    const Icon = permission.icon;
                    return (
                      <div key={permission.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={permission.id}
                          checked={formData.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(permission.id, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <Label 
                              htmlFor={permission.id} 
                              className="text-sm font-medium cursor-pointer"
                            >
                              {permission.name}
                            </Label>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button 
                  onClick={editingRole ? handleUpdateRole : handleCreateRole}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  {editingRole ? "Update Role" : "Create Role"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="bg-gradient-card border-border shadow-soft hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRole(role)}
                    className="h-8 w-8 p-0 hover:bg-muted/50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRole(role)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{role.description}</p>
              
              {/* Permissions Display */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions?.slice(0, 3).map((permissionId) => {
                    const permission = availablePermissions.find(p => p.id === permissionId);
                    return permission ? (
                      <Badge key={permissionId} variant="outline" className="text-xs px-2 py-1">
                        {permission.name}
                      </Badge>
                    ) : null;
                  })}
                  {role.permissions && role.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      +{role.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <Badge variant={role.color as any} className="text-xs">
                  {role.name}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, role: null })}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{deleteDialog.role?.name}"? 
              {deleteDialog.role?.userCount && deleteDialog.role.userCount > 0 
                ? ` This will affect ${deleteDialog.role.userCount} user${deleteDialog.role.userCount > 1 ? 's' : ''}.`
                : " This action cannot be undone."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}