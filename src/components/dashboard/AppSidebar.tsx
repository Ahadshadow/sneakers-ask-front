import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { vendorsApi } from "@/lib/api/vendors";
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
  CreditCard,
  Mail,
  ChevronDown,
  Circle,
  Building2,
  ShoppingCart,
  History,
  Wallet,
  User,
  FileText
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteSellerModal } from "./InviteSellerModal";
import { isSeller } from "@/lib/utils/auth";

interface AppSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const adminNavigationItems = [
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
    hasSubmenu: true,
  },
  {
    id: "payouts",
    label: "Payouts", 
    icon: CreditCard,
    path: "/payouts",
  },
  {
    id: "exports",
    label: "Exports",
    icon: FileText,
    path: "/exports",
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
  {
    id: "vendors",
    label: "Vendors",
    icon: Building2,
    path: "/vendors",
  },
];

const bulkSellerNavigationItems = [
  // {
  //   id: "wtb-requests",
  //   label: "WTB Requests",
  //   icon: ShoppingCart,
  //   path: "/seller/wtb-requests",
  // },
  // {
  //   id: "my-offers",
  //   label: "My Offers",
  //   icon: Package,
  //   path: "/seller/my-offers",
  // },
  // {
  //   id: "my-sales",
  //   label: "My Sales",
  //   icon: CreditCard,
  //   path: "/seller/my-sales",
  // },
  // {
  //   id: "my-shipments",
  //   label: "My Shipments",
  //   icon: Store,
  //   path: "/seller/my-shipments",
  // },
  {
    id: "history",
    label: "History",
    icon: History,
    path: "/seller/history",
  },
  {
    id: "payout",
    label: "Payout",
    icon: Wallet,
    path: "/seller/payout",
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    path: "/seller/profile",
  },
];

const salesChannelFilters = [
  { id: "all", label: "All", color: "text-gray-600" },
  { id: "open", label: "Open", color: "text-green-600" },
  { id: "sourcing", label: "Sourcing", color: "text-yellow-600" },
  { id: "wtb", label: "WTB", color: "text-red-600" },
  { id: "stock", label: "Stock", color: "text-blue-600" },
  { id: "consignment", label: "Consignment", color: "text-indigo-600" },
];

// Vendor filters are now fetched dynamically from the API


interface QuickAction {
  id: string;
  label: string;
  icon: any;
  path?: string;
  action?: "modal";
}

const quickActions: QuickAction[] = [
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
  },
  {
    id: "invite-seller",
    label: "Invite Seller",
    icon: Mail,
    action: "modal" // Special action to open modal
  }
];

export function AppSidebar({ currentSection, onSectionChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, logout, isLoggingOut } = useAuth();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(true);
  
  // Determine which navigation items to show based on user role
  const navigationItems = isSeller(user) 
    ? bulkSellerNavigationItems 
    : adminNavigationItems;
  
  const isOnProfilePage = location.pathname === "/profile" || location.pathname === "/seller/profile";

  // Get current filters from URL
  const currentStatus = searchParams.get("status");
  const currentVendor = searchParams.get("vendor");

  // Fetch all vendors for dynamic sidebar filters
  const { data: vendorsResponse } = useQuery({
    queryKey: ['vendors', 'sidebar'],
    queryFn: () => vendorsApi.getVendors({ per_page: 'all' }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const vendors = vendorsResponse?.data?.data || [];
  
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
      // Redirect to login page after logout
      navigate('/signin', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login
      navigate('/signin', { replace: true });
    }
  };

  return (
    <>
      <InviteSellerModal open={inviteModalOpen} onOpenChange={setInviteModalOpen} />
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
                <span className="text-xs text-muted-foreground">
                  {isSeller(user) ? "Seller Dashboard" : "Admin Dashboard"}
                </span>
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
                const isActive = currentSection === item.id || ('path' in item && item.path && location.pathname === item.path);
                
                // Seller navigation items (simpler, no submenu)
                if (isSeller(user)) {
                  const sellerItem = item as typeof bulkSellerNavigationItems[0];
                  const isSellerActive = location.pathname === sellerItem.path || 
                    (sellerItem.path === "/seller/wtb-requests" && location.pathname === "/seller");
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        tooltip={isCollapsed ? item.label : undefined}
                        className={cn(
                          "group transition-all duration-200 rounded-lg relative",
                          isCollapsed ? "h-10 w-10 mx-auto my-2 flex items-center justify-center" : "h-11 mx-1 my-0.5",
                          isSellerActive
                            ? "!bg-black !text-white shadow-lg hover:!bg-black hover:!text-white [&:hover]:!text-white [&:hover_*]:!text-white [&_*]:!text-white [&:hover_svg]:!text-white [&:hover_span]:!text-white" 
                            : "hover:bg-muted"
                        )}
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (sellerItem.path) {
                              navigate(sellerItem.path);
                            }
                          }}
                          className={cn("flex items-center w-full h-full transition-all duration-200", isCollapsed ? "justify-center" : "gap-3 px-3")}
                        >
                          <Icon className={cn("flex-shrink-0", isCollapsed ? "h-4 w-4" : "h-5 w-5", isSellerActive && "!text-white")} />
                          {!isCollapsed && (
                            <span className={cn("font-medium text-sm", isSellerActive && "!text-white")}>{item.label}</span>
                          )}
                          {isSellerActive && !isCollapsed && (
                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
                          )}
                          {isSellerActive && isCollapsed && (
                            <div className="absolute -right-0.5 top-1/2 transform -translate-y-1/2 h-2 w-1 rounded-l-full bg-primary" />
                          )}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
                
                // Products menu with submenu (admin only)
                if ('hasSubmenu' in item && item.hasSubmenu && item.id === "products") {
                  // Check if any child category is selected
                  const hasActiveChild = currentStatus || currentVendor;
                  
                  return (
                    <Collapsible
                      key={item.id}
                      open={productsMenuOpen}
                      onOpenChange={setProductsMenuOpen}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <div className="relative">
                          <SidebarMenuButton
                            tooltip={isCollapsed ? item.label : undefined}
                            className={cn(
                              "group transition-all duration-200 rounded-lg relative",
                              isCollapsed ? "h-10 w-10 mx-auto my-2 flex items-center justify-center" : "h-11 mx-1 my-0.5",
                              (hasActiveChild || isActive)
                                ? "!bg-black !text-white shadow-lg hover:!bg-black hover:!text-white [&:hover]:!text-white [&:hover_*]:!text-white [&_*]:!text-white [&:hover_svg]:!text-white [&:hover_span]:!text-white" 
                                : "hover:bg-muted"
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if ('path' in item && item.path) {
                                navigate(item.path);
                              }
                            }}
                          >
                            <Icon className={cn("flex-shrink-0", isCollapsed ? "h-4 w-4" : "h-5 w-5", (hasActiveChild || isActive) && "!text-white")} />
                            {!isCollapsed && (
                              <span className={cn("font-medium text-sm", (hasActiveChild || isActive) && "!text-white")}>{item.label}</span>
                            )}
                            {isActive && isCollapsed && (
                              <div className="absolute -right-0.5 top-1/2 transform -translate-y-1/2 h-2 w-1 rounded-l-full bg-primary" />
                            )}
                          </SidebarMenuButton>
                          {!isCollapsed && (
                            <CollapsibleTrigger asChild>
                              <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted/50 rounded transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", productsMenuOpen && "rotate-180")} />
                              </button>
                            </CollapsibleTrigger>
                          )}
                        </div>
                        {!isCollapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {salesChannelFilters.map((filter) => {
                                // Check if this status filter is active
                                const isStatusActive = filter.id === "all" 
                                  ? !currentStatus && !currentVendor
                                  : currentStatus === filter.id && !currentVendor;
                                
                                return (
                                  <SidebarMenuSubItem key={filter.id}>
                                    <SidebarMenuSubButton
                                      onClick={() => {
                                        if (filter.id === "all") {
                                          navigate("/products");
                                        } else {
                                          navigate(`/products?status=${filter.id}`);
                                        }
                                      }}
                                      isActive={isStatusActive}
                                      className={cn(
                                        "cursor-pointer transition-all duration-200",
                                        isStatusActive && "!bg-black dark:!bg-black !text-white !font-semibold shadow-lg hover:!bg-black dark:hover:!bg-black hover:!text-white [&:hover]:!text-white [&:hover_*]:!text-white data-[active=true]:!bg-black data-[active=true]:dark:!bg-black data-[active=true]:!text-white"
                                      )}
                                    >
                                      <Circle className={cn("h-2 w-2 fill-current mr-2", filter.color)} />
                                      <span>{filter.label}</span>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                              {/* Vendor quick filters - dynamically loaded from API */}
                              {vendors.map((vendor) => {
                                // Check if this vendor filter is active
                                const isVendorActive = currentVendor === vendor.name;
                                
                                return (
                                  <SidebarMenuSubItem key={`vendor-${vendor.id}`}>
                                    <SidebarMenuSubButton
                                      onClick={() => {
                                        navigate(`/products?vendor=${encodeURIComponent(vendor.name)}`);
                                      }}
                                      isActive={isVendorActive}
                                      className={cn(
                                        "cursor-pointer transition-all duration-200",
                                        isVendorActive && "!bg-black dark:!bg-black !text-white !font-semibold shadow-lg hover:!bg-black dark:hover:!bg-black hover:!text-white [&:hover]:!text-white [&:hover_*]:!text-white data-[active=true]:!bg-black data-[active=true]:dark:!bg-black data-[active=true]:!text-white"
                                      )}
                                    >
                                      <Circle className="h-2 w-2 fill-current mr-2 text-gray-500" />
                                      <span>{vendor.name}</span>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }
                
                // Regular menu items
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      tooltip={isCollapsed ? item.label : undefined}
                      className={cn(
                        "group transition-all duration-200 rounded-lg relative",
                        isCollapsed ? "h-10 w-10 mx-auto my-2 flex items-center justify-center" : "h-11 mx-1 my-0.5",
                        isActive 
                          ? "!bg-black !text-white shadow-lg hover:!bg-black hover:!text-white [&:hover]:!text-white [&:hover_*]:!text-white [&_*]:!text-white [&:hover_svg]:!text-white [&:hover_span]:!text-white"
                          : "hover:bg-muted"
                      )}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if ('path' in item && item.path) {
                            navigate(item.path);
                          } else {
                            onSectionChange(item.id);
                          }
                        }}
                        className={cn("flex items-center w-full h-full transition-all duration-200", isCollapsed ? "justify-center" : "gap-3 px-3")}
                      >
                        <Icon className={cn("flex-shrink-0", isCollapsed ? "h-4 w-4" : "h-5 w-5", isActive && "!text-white")} />
                        {!isCollapsed && (
                          <span className={cn("font-medium text-sm", isActive && "!text-white")}>{item.label}</span>
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

        {!isCollapsed && !isSeller(user) && (
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
                          onClick={() => {
                            if (action.action === "modal" && action.id === "invite-seller") {
                              setInviteModalOpen(true);
                            } else if (action.path) {
                              navigate(action.path);
                            }
                          }}
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
                  onClick={() => navigate(isSeller(user) ? '/seller/profile' : '/profile')}
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
    </>
  );
}