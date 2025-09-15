import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User as UserIcon, Mail, Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { usersApi, rolesApi, User, Role } from "@/lib/api";

export default function EditEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    roleId: "",
    status: "active" as "active" | "inactive" | "pending"
  });
  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    roleId: "",
    status: "active" as "active" | "inactive" | "pending"
  });

  useEffect(() => {
    if (id) {
      loadUserAndRoles();
    }
  }, [id]);

  const loadUserAndRoles = async () => {
    try {
      setLoading(true);
      const [userResponse, rolesResponse] = await Promise.all([
        usersApi.getUser(parseInt(id!)),
        rolesApi.getRoles()
      ]);
      
      if (userResponse.success && userResponse.data) {
        // Handle the actual API response structure - user data is directly in data object
        const userData = userResponse.data;
        
        // Process user data to handle null values and create full_name
        const processedUser = {
          ...userData,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          full_name: userData.first_name && userData.last_name 
            ? `${userData.first_name} ${userData.last_name}` 
            : userData.email || 'Unknown User',
          role: userData.role || { id: 0, name: 'No Role', description: 'No role assigned', color: '#6B7280' },
          join_date: userData.join_date || new Date().toISOString()
        };
        
        setUser(processedUser);
        const initialFormData = {
          firstName: processedUser.first_name || '',
          lastName: processedUser.last_name || '',
          email: processedUser.email || '',
          roleId: processedUser.role_id ? processedUser.role_id.toString() : '',
          status: processedUser.status || 'active'
        };
        setFormData(initialFormData);
        setOriginalData(initialFormData);
      } else {
        throw new Error(userResponse.message || 'Failed to load user data');
      }
      
      if (rolesResponse.success) {
        // Handle the actual API response structure - roles are directly in data array
        const rolesData = Array.isArray(rolesResponse.data) ? rolesResponse.data : (rolesResponse.data as any).data || [];
        setRoles(rolesData);
      } else {
        throw new Error(rolesResponse.message || 'Failed to load roles');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load user data');
      toast({
        title: "Something went wrong",
        description: "Failed to load user data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check if form has any changes
  const hasChanges = () => {
    return (
      formData.firstName !== originalData.firstName ||
      formData.lastName !== originalData.lastName ||
      formData.email !== originalData.email ||
      formData.roleId !== originalData.roleId ||
      formData.status !== originalData.status
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Check if there are any changes
    if (!hasChanges()) {
      toast({
        title: "No Changes",
        description: "No changes have been made to save.",
        variant: "default",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await usersApi.updateUser(user.id, {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        role_id: parseInt(formData.roleId),
        status: formData.status
      });
      
      if (response.success) {
        console.log('User updated successfully:', response.data); // Debug log
        toast({
          title: "Employee Updated Successfully",
          description: `${formData.firstName} ${formData.lastName} details have been updated.`,
        });
        navigate("/users"); // Redirect to users page
      } else {
        throw new Error(response.message || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Something went wrong",
        description: "Failed to update employee. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Loading Employee Data</h2>
            <p className="text-muted-foreground">Please wait while we load the employee information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Employee</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate("/users")}>Back to Users</Button>
              <Button onClick={() => {
                setError(null);
                loadUserAndRoles();
              }}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!id || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Employee Not Found</h2>
            <p className="text-muted-foreground mb-4">The employee you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/users")}>Back to Users</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/users")}
              className="hover-scale transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Edit Employee Details</h1>
              <p className="text-sm text-muted-foreground">Update employee information and permissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Personal Information */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter email address"
                      className="pl-10 transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Job Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.roleId} onValueChange={(value) => handleInputChange("roleId", value)}>
                  <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-4">
              {hasChanges() && (
                <span className="text-sm text-muted-foreground">
                  You have unsaved changes
                </span>
              )}
            </div>
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/users")}
                className="hover-scale transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !hasChanges()}
                className="h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 text-base font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/25 min-w-32 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating Employee..." : "Update Employee"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}