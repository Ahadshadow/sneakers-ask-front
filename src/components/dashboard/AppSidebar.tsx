import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Store, 
  BarChart3, 
  Package, 
  Plus, 
  Settings,
  HelpCircle,
  LogOut,
  Shield,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    path: "/",
  },
  {
    id: "products", 
    label: "Products",
    icon: Package,
    path: "/products",
  },
  {
    id: "payouts",
    label: "Payouts", 
    icon: CreditCard,
    path: "/payouts",
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    path: "/users",
  },
  {
    id: "roles",
    label: "Roles",
    icon: Shield,
    path: "/roles",
  },
  {
    id: "sellers",
    label: "Sellers",
    icon: Store,
    path: "/sellers",
  },
];

const quickActions = [
  {
    id: "add-employee",
    label: "Add Employee",
    icon: Users,
    path: "/add-employee"
  },
  {
    id: "add-seller", 
    label: "Add Seller",
    icon: Store,
    path: "/add-seller"
  }
];

export function AppSidebar({ currentSection, onSectionChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isLoggingOut } = useAuth();
  
  // Get user initials for avatar
  const getUserInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string') {
      return 'AD'; // Default initials
    }
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Sidebar className={cn("sticky top-0 h-screen border-r border-border bg-sidebar transition-all duration-300", isCollapsed ? "w-16" : "w-64")} collapsible="icon">
      <SidebarHeader className="h-16 border-b border-border bg-gradient-to-r from-background via-background to-background/95">
        <div className={cn("flex items-center h-16", isCollapsed ? "justify-center" : "gap-3 px-4")}>
          {!isCollapsed && (
            <>
              <img 
                src="/lovable-uploads/eda95fba-94be-49b8-91e4-327afcb9e3da.png" 
                alt="SneakerAsk Logo" 
                className="h-8 w-auto"
              />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Admin Dashboard</span>
              </div>
            </>
          )}
          {isCollapsed && (
            <img 
              src="/lovable-uploads/eda95fba-94be-49b8-91e4-327afcb9e3da.png" 
              alt="SneakerAsk Logo" 
              className="h-6 w-auto"
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={isCollapsed ? "py-4" : "py-2"}>
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-muted-foreground uppercase text-xs font-semibold tracking-wider px-4 py-2">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent className={isCollapsed ? "px-1" : "px-2"}>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id || (item.path && location.pathname === item.path);
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      tooltip={isCollapsed ? item.label : undefined}
                      className={cn(
                        "group transition-all duration-200 hover:bg-muted rounded-lg relative",
                        isCollapsed ? "h-10 w-10 mx-auto my-2 flex items-center justify-center" : "h-11 mx-1 my-0.5",
                        isActive && "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                      )}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (item.path) {
                            navigate(item.path);
                          } else {
                            onSectionChange(item.id);
                          }
                        }}
                        className={cn("flex items-center w-full h-full transition-all duration-200", isCollapsed ? "justify-center" : "gap-3 px-3")}
                      >
                        <Icon className={cn("flex-shrink-0", isCollapsed ? "h-4 w-4" : "h-5 w-5")} />
                        {!isCollapsed && (
                          <span className="font-medium text-sm">{item.label}</span>
                        )}
                        {isActive && !isCollapsed && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
                        )}
                        {isActive && isCollapsed && (
                          <div className="absolute -right-0.5 top-1/2 transform -translate-y-1/2 h-2 w-1 rounded-l-full bg-primary" />
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-muted-foreground uppercase text-xs font-semibold tracking-wider px-4 py-2">
              Quick Actions
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <SidebarMenu>
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  
                  return (
                    <SidebarMenuItem key={action.id}>
                      <SidebarMenuButton
                        asChild
                        className="hover:bg-muted transition-all duration-200 h-10 rounded-lg mx-1 my-0.5"
                      >
                        <button 
                          className="flex items-center gap-3 w-full px-3"
                          onClick={() => navigate(action.path)}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <span className="font-medium text-sm text-foreground">{action.label}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border bg-gradient-to-r from-background via-background to-background/95 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="hover:bg-muted transition-all duration-200 rounded-lg"
                >
                  <Avatar className={cn("shadow-sm", isCollapsed ? "h-8 w-8" : "h-9 w-9")}>
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {getUserInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-foreground">{user?.name || 'Admin User'}</span>
                      <span className="truncate text-xs text-muted-foreground">{user?.email || 'admin@sneakerask.com'}</span>
                    </div>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg bg-background border-border shadow-lg"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem 
                  className="hover:bg-muted cursor-pointer"
                  onClick={() => navigate('/profile')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-muted cursor-pointer">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="hover:bg-destructive/10 text-destructive cursor-pointer"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoggingOut ? "Signing out..." : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}