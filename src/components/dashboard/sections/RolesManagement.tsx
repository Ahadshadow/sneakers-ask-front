import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Plus, Edit, Trash2, Users, Eye, Package, Store, Settings, Loader2 } from "lucide-react";
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
import { rolesApi, Role, Permission, CreateRoleRequest, UpdateRoleRequest } from "@/lib/api/roles";

// Icon mapping for permissions
const getPermissionIcon = (permissionName: string) => {
  const name = permissionName.toLowerCase();
  if (name.includes('dashboard') || name.includes('view')) return Eye;
  if (name.includes('product')) return Package;
  if (name.includes('user')) return Users;
  if (name.includes('role')) return Shield;
  if (name.includes('seller')) return Store;
  if (name.includes('setting')) return Settings;
  return Shield; // Default icon
};

// Color options for roles
const colorOptions = [
  { value: "#2563EB", label: "Blue", variant: "default" },
  { value: "#DC2626", label: "Red", variant: "destructive" },
  { value: "#059669", label: "Green", variant: "secondary" },
  { value: "#7C3AED", label: "Purple", variant: "outline" },
  { value: "#EA580C", label: "Orange", variant: "outline" },
  { value: "#0891B2", label: "Cyan", variant: "outline" }
];

export function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; role: Role | null }>({
    open: false,
    role: null
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#2563EB",
    permissions: [] as number[]
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Load roles and permissions from API
  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await rolesApi.getRoles();
      if (response.success) {
        setRoles(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load roles",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading roles:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      setPermissionsLoading(true);
      const response = await rolesApi.getPermissions();
      if (response.success) {
        setPermissions(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load permissions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading permissions:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load permissions",
        variant: "destructive",
      });
    } finally {
      setPermissionsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(id => id !== permissionId)
    }));
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", color: "#2563EB", permissions: [] });
    setEditingRole(null);
  };

  const handleCreateRole = async () => {
    if (!formData.name.trim()) return;
    
    try {
      setSubmitting(true);
      const roleData: CreateRoleRequest = {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        permission_ids: formData.permissions
      };
      
      const response = await rolesApi.createRole(roleData);
      if (response.success) {
        setRoles([...roles, response.data]);
        toast({
          title: "Role Created",
          description: `Role "${formData.name}" has been created successfully.`,
        });
        resetForm();
        setIsCreateOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to create role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating role:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create role",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      color: role.color,
      permissions: role.permissions?.map(p => p.id) || []
    });
    setIsCreateOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !formData.name.trim()) return;
    
    try {
      setSubmitting(true);
      const roleData: UpdateRoleRequest = {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        permission_ids: formData.permissions
      };
      
      const response = await rolesApi.updateRole(editingRole.id, roleData);
      if (response.success) {
        setRoles(roles.map(role => 
          role.id === editingRole.id ? response.data : role
        ));
        toast({
          title: "Role Updated",
          description: `Role "${formData.name}" has been updated successfully.`,
        });
        resetForm();
        setIsCreateOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to update role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = (role: Role) => {
    setDeleteDialog({ open: true, role });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.role) return;
    
    try {
      setSubmitting(true);
      const response = await rolesApi.deleteRole(deleteDialog.role.id);
      if (response.success) {
        setRoles(roles.filter(role => role.id !== deleteDialog.role!.id));
        toast({
          title: "Role Deleted",
          description: `Role "${deleteDialog.role.name}" has been deleted.`,
        });
        setDeleteDialog({ open: false, role: null });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete role",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
             <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
               <Plus className="h-4 w-4 mr-2" />
               Create Role
             </Button>
           </DialogTrigger>
          <DialogContent className="bg-background border-border max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editingRole ? "Edit Role" : "Create New Role"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName" className="text-sm font-medium">Role Name *</Label>
                  <Input
                    id="roleName"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter role name"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="roleColor" className="text-sm font-medium">Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleInputChange("color", color.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                          formData.color === color.value 
                            ? 'border-foreground ring-2 ring-offset-2 ring-primary' 
                            : 'border-muted-foreground hover:border-foreground'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roleDescription" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="roleDescription"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the role responsibilities"
                  rows={3}
                  className="w-full resize-none"
                />
              </div>
              
               {/* Permissions Section */}
               <div className="space-y-3">
                 <Label className="text-sm font-medium">Permissions</Label>
                 {permissionsLoading ? (
                   <div className="flex items-center justify-center py-8">
                     <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                     <span className="ml-2 text-muted-foreground">Loading permissions...</span>
                   </div>
                 ) : (
                   <div className="max-h-60 overflow-y-auto border border-border rounded-lg bg-muted/20">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                       {permissions.map((permission) => {
                         const Icon = getPermissionIcon(permission.name);
                         return (
                           <div key={permission.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                             <Checkbox
                               id={permission.id}
                               checked={formData.permissions.includes(permission.id)}
                               onCheckedChange={(checked) => 
                                 handlePermissionChange(permission.id, checked as boolean)
                               }
                               className="mt-1"
                             />
                             <div className="flex-1 space-y-1 min-w-0">
                               <div className="flex items-center gap-2">
                                 <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                                 <Label 
                                   htmlFor={permission.id} 
                                   className="text-sm font-medium cursor-pointer truncate"
                                 >
                                   {permission.name}
                                 </Label>
                               </div>
                               <p className="text-xs text-muted-foreground line-clamp-2">
                                 {permission.description}
                               </p>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 )}
               </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={handleCloseDialog}
                  className="w-full sm:w-auto"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                 <Button 
                   onClick={editingRole ? handleUpdateRole : handleCreateRole}
                   className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                   disabled={submitting}
                 >
                   {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                   {editingRole ? "Update Role" : "Create Role"}
                 </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading roles...</span>
        </div>
      ) : (
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
                  {role.permissions?.slice(0, 3).map((permission) => (
                    <Badge key={permission.id} variant="outline" className="text-xs px-2 py-1">
                      {permission.name}
                    </Badge>
                  ))}
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
                    {role.user_count} user{role.user_count !== 1 ? 's' : ''}
                  </span>
                </div>
                <Badge 
                  className="text-xs"
                  style={{ backgroundColor: role.color, color: 'white' }}
                >
                  {role.name}
                </Badge>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, role: null })}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{deleteDialog.role?.name}"? 
              {deleteDialog.role?.user_count && deleteDialog.role.user_count > 0 
                ? ` This will affect ${deleteDialog.role.user_count} user${deleteDialog.role.user_count > 1 ? 's' : ''}.`
                : " This action cannot be undone."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}