import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Bell, 
  Lock, 
  Eye,
  EyeOff,
  Camera,
  Save,
  Settings,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@sneakerask.com",
    phone: "+1 (555) 123-4567",
    location: "Amsterdam, Netherlands",
    role: "Administrator",
    joinDate: "January 2024",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    orderUpdates: true,
    marketingEmails: false,
    securityAlerts: true
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-background/95 via-background to-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="hover:bg-muted/50 transition-all duration-300 group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Profile Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Profile Header */}
          <Card className="mb-8 shadow-xl border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary via-primary/80 to-primary/60"></div>
            <CardContent className="relative pt-0 pb-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-3xl font-bold">
                      {profileData.firstName[0]}{profileData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute bottom-2 right-2 h-8 w-8 rounded-full p-0 shadow-lg"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-3">
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
                    {profileData.location}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                    className="transition-all duration-300"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Content */}
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="general" className="rounded-lg transition-all duration-300">
                General
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-lg transition-all duration-300">
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-lg transition-all duration-300">
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    Personal Information
                  </CardTitle>
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
                    <div className="space-y-2">
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
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          disabled={!isEditing}
                          className="pl-10 h-11 transition-all duration-300 disabled:opacity-60"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
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
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Change Password</h3>
                    <div className="grid gap-4">
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
                        className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 transition-all duration-300"
                      >
                        {isSaving ? "Updating..." : "Change Password"}
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/20 dark:border-red-800">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-red-800 dark:text-red-400">Sign Out All Devices</h4>
                          <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                            This will sign you out from all devices and require you to log in again.
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/50"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out All
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Bell className="h-4 w-4 text-blue-600" />
                    </div>
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      {
                        key: "emailNotifications",
                        title: "Email Notifications",
                        description: "Receive notifications via email"
                      },
                      {
                        key: "pushNotifications",
                        title: "Push Notifications",
                        description: "Receive push notifications in your browser"
                      },
                      {
                        key: "orderUpdates",
                        title: "Order Updates",
                        description: "Get notified about order status changes"
                      },
                      {
                        key: "marketingEmails",
                        title: "Marketing Emails",
                        description: "Receive promotional emails and newsletters"
                      },
                      {
                        key: "securityAlerts",
                        title: "Security Alerts",
                        description: "Important security notifications (recommended)"
                      }
                    ].map(({ key, title, description }) => (
                      <div key={key} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors duration-200">
                        <div className="space-y-1">
                          <h4 className="font-medium text-foreground">{title}</h4>
                          <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                        <Switch
                          checked={notifications[key as keyof typeof notifications]}
                          onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}