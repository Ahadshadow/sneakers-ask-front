import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  currentSection: string;
}

const sectionInfo = {
  dashboard: {
    title: "Overview",
    description: "Monitor your business performance and key metrics"
  },
  users: {
    title: "User Management", 
    description: "Manage team members and their permissions"
  },
  roles: {
    title: "Roles Management",
    description: "Define and manage user roles and permissions"
  },
  sellers: {
    title: "Sellers",
    description: "Manage your marketplace sellers and their stores"
  },
  products: {
    title: "Products",
    description: "View and manage your Shopify product catalog"
  },
  profile: {
    title: "Profile Settings",
    description: "Manage your account settings and preferences"
  },
};

export function OptimizedDashboardHeader({ currentSection }: DashboardHeaderProps) {
  const currentInfo = sectionInfo[currentSection as keyof typeof sectionInfo] || sectionInfo.dashboard;
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };
  
  return (
    <header className="sticky top-0 z-50 h-16 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-8 w-8" />
          <h1 className="text-lg font-medium text-foreground">
            {currentInfo.title}
          </h1>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">

          {/* Notifications */}
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="sm" className="relative hover:bg-muted transition-all duration-200 h-9 w-9 p-0 rounded-lg shadow-sm">
                 <Bell className="h-5 w-5" />
                 <Badge 
                   variant="destructive" 
                   className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center shadow-sm"
                 >
                   3
                 </Badge>
               </Button>
            </DropdownMenuTrigger>
             <DropdownMenuContent
               className="w-80 rounded-lg bg-background border-border shadow-elegant"
               align="end"
               sideOffset={8}
             >
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <p className="text-sm text-muted-foreground">You have 3 new notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="p-4 hover:bg-muted cursor-pointer">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm">New order received</p>
                    <p className="text-xs text-muted-foreground">Order #SP005 - €245.00</p>
                    <span className="text-xs text-muted-foreground">2 minutes ago</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4 hover:bg-muted cursor-pointer">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm">Low stock alert</p>
                    <p className="text-xs text-muted-foreground">Nike Dunk Low - Only 3 left</p>
                    <span className="text-xs text-muted-foreground">1 hour ago</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4 hover:bg-muted cursor-pointer">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm">New seller registered</p>
                    <p className="text-xs text-muted-foreground">Street Kicks Store joined</p>
                    <span className="text-xs text-muted-foreground">3 hours ago</span>
                  </div>
                </DropdownMenuItem>
              </div>
              <div className="p-2 border-t border-border">
                <Button variant="ghost" className="w-full text-sm">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-lg hover:bg-muted transition-all duration-200 p-0 shadow-sm">
                 <Avatar className="h-8 w-8">
                   <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                     {getUserInitials()}
                   </AvatarFallback>
                 </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 rounded-lg bg-background border-border shadow-elegant"
              align="end"
              sideOffset={8}
            >
               <div className="p-3 border-b border-border">
                 <p className="font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
                 <p className="text-sm text-muted-foreground">{user?.email}</p>
                 <Badge variant="secondary" className="mt-1 text-xs">
                   {user?.role.replace('_', ' ').toUpperCase()}
                 </Badge>
               </div>
              <DropdownMenuItem 
                className="hover:bg-muted cursor-pointer"
                onClick={() => window.location.href = '/profile'}
              >
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
               <DropdownMenuItem 
                 className="hover:bg-destructive/10 text-destructive cursor-pointer"
                 onClick={handleLogout}
               >
                 Sign Out
               </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}