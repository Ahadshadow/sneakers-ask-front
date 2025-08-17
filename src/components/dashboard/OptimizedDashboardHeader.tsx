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
};

export function OptimizedDashboardHeader({ currentSection }: DashboardHeaderProps) {
  const currentInfo = sectionInfo[currentSection as keyof typeof sectionInfo] || sectionInfo.dashboard;
  
  return (
    <header className="sticky top-0 z-40 h-14 sm:h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <SidebarTrigger className="hover-scale transition-all duration-200 flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
              {currentInfo.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">
              {currentInfo.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative hover-scale transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10 p-0">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 text-xs flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-72 sm:w-80 rounded-lg bg-background border-border shadow-elegant"
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
                    <p className="text-xs text-muted-foreground">Order #SP005 - $245.00</p>
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
              <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full hover-scale transition-all duration-200 p-0">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs sm:text-sm">
                    AD
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
                <p className="font-medium text-foreground">Admin User</p>
                <p className="text-sm text-muted-foreground">admin@sneakerask.com</p>
              </div>
              <DropdownMenuItem className="hover:bg-muted cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-destructive/10 text-destructive cursor-pointer">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}