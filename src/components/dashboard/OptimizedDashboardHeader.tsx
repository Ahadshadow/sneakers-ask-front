import { Bell, Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const sectionTitles = {
  dashboard: "Dashboard Overview",
  users: "User & Roles Management", 
  sellers: "Sellers Management",
  products: "Shopify Products Overview",
};

const sectionDescriptions = {
  dashboard: "Monitor your business performance and key metrics",
  users: "Manage user accounts, permissions and roles",
  sellers: "Oversee seller accounts and onboarding",
  products: "View and manage your Shopify product catalog",
};

export function OptimizedDashboardHeader({ currentSection }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover-scale transition-all duration-200" />
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-foreground">
              {sectionTitles[currentSection as keyof typeof sectionTitles] || "Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {sectionDescriptions[currentSection as keyof typeof sectionDescriptions]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Global Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search anything..."
              className="pl-10 w-80 bg-background/50 border-border focus:border-primary transition-all duration-200"
            />
          </div>

          {/* Mobile Search */}
          <Button variant="ghost" size="sm" className="md:hidden hover-scale transition-all duration-200">
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative hover-scale transition-all duration-200">
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
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
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-scale transition-all duration-200">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
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