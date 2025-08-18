import { useState } from "react";
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Shield, 
  Bell, 
  Lock, 
  Eye,
  EyeOff,
  Camera,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { OptimizedDashboardHeader } from "@/components/dashboard/OptimizedDashboardHeader";

export default function Profile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentSection, setCurrentSection] = useState("profile");
  
  const [profileData, setProfileData] = useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@sneakerask.com",
    role: "Administrator",
    joinDate: "January 2024",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
    
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation password don't match.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });
    
    setProfileData(prev => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }));
    setIsSaving(false);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar 
          currentSection={currentSection} 
          onSectionChange={setCurrentSection} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <OptimizedDashboardHeader currentSection="profile" />
          
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6 space-y-6 animate-fade-in">
              
              {/* Profile Header */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-primary via-primary/80 to-primary/60"></div>
                <CardContent className="relative pt-0 pb-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-2xl font-bold">
                          {profileData.firstName[0]}{profileData.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute bottom-1 right-1 h-7 w-7 rounded-full p-0 shadow-lg"
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-2xl font-bold text-foreground mb-1">
                        {profileData.firstName} {profileData.lastName}
                      </h2>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          <Shield className="h-3 w-3 mr-1" />
                          {profileData.role}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined {profileData.joinDate}
                        </span>
                      </div>
                      <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                        <MapPin className="h-4 w-4" />
                        Amsterdam, Netherlands
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs Content */}
              <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="general" className="rounded-lg transition-all duration-300">
                  General
                </TabsTrigger>
                <TabsTrigger value="security" className="rounded-lg transition-all duration-300">
                  Security
                </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general">
                  <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          Personal Information
                        </CardTitle>
                        <Button
                          variant={isEditing ? "outline" : "default"}
                          onClick={() => setIsEditing(!isEditing)}
                          size="sm"
                          className="transition-all duration-300"
                        >
                          {isEditing ? "Cancel" : "Edit"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            disabled={!isEditing}
                            className="h-11 transition-all duration-300 disabled:opacity-60"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            disabled={!isEditing}
                            className="h-11 transition-all duration-300 disabled:opacity-60"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              value={profileData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              disabled={!isEditing}
                              className="pl-10 h-11 transition-all duration-300 disabled:opacity-60"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {isEditing && (
                        <div className="flex justify-end pt-4">
                          <Button 
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 min-w-32"
                          >
                            {isSaving ? (
                              <>
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                  <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <Lock className="h-4 w-4 text-red-600" />
                        </div>
                        Change Password
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 max-w-md">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="currentPassword"
                              type={showPassword ? "text" : "password"}
                              value={profileData.currentPassword}
                              onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                              className="pl-10 pr-10 h-11"
                              placeholder="Enter current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="newPassword"
                              type="password"
                              value={profileData.newPassword}
                              onChange={(e) => handleInputChange("newPassword", e.target.value)}
                              className="pl-10 h-11"
                              placeholder="Enter new password"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={profileData.confirmPassword}
                              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                              className="pl-10 h-11"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={handleChangePassword}
                          disabled={!profileData.currentPassword || !profileData.newPassword || !profileData.confirmPassword || isSaving}
                          className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 transition-all duration-300"
                        >
                          {isSaving ? "Updating Password..." : "Change Password"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}