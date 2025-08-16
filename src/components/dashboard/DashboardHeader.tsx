import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  sellers: {
    title: "Sellers",
    description: "Manage your marketplace sellers and their stores"
  },
  products: {
    title: "Products",
    description: "View and manage your Shopify product catalog"
  },
};

export function DashboardHeader({ currentSection }: DashboardHeaderProps) {
  const currentInfo = sectionInfo[currentSection as keyof typeof sectionInfo] || sectionInfo.dashboard;
  
  return (
    <header className="bg-gradient-to-r from-background via-background to-background/95 border-b border-border/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Left Section - Title and Description */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {currentInfo.title}
            </h1>
            <p className="text-muted-foreground text-sm max-w-md">
              {currentInfo.description}
            </p>
          </div>

          {/* Right Section - Search, Notifications, Profile */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search anything..."
                className="pl-10 w-80 bg-background/60 border-border/60 backdrop-blur-sm focus:bg-background focus:border-primary/50 transition-all duration-200"
              />
            </div>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative hover:bg-muted/50 transition-colors"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-semibold"
              >
                3
              </Badge>
            </Button>

            {/* User Avatar */}
            <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
              <AvatarFallback className="bg-gradient-primary text-white font-semibold text-sm">
                AD
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}