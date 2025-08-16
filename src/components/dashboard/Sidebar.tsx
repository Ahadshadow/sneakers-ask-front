import { useState } from "react";
import { cn } from "@/lib/utils";
import { Users, Store, BarChart3, Package, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    id: "users",
    label: "User / roles management",
    icon: Users,
  },
  {
    id: "sellers",
    label: "Create sellers management",
    icon: Store,
  },
  {
    id: "products",
    label: "Overview products Shopify",
    icon: Package,
  },
];

export function Sidebar({ currentSection, onSectionChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-smooth",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground">SneakerAsk</h1>
                <p className="text-sm text-sidebar-foreground/60">Admin Dashboard</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                  "hover:bg-sidebar-accent group",
                  isActive
                    ? "bg-gradient-primary text-sidebar-primary-foreground shadow-soft"
                    : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Add Card Button */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            className={cn(
              "w-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground",
              "border border-sidebar-border transition-all duration-200",
              isCollapsed ? "px-3" : "justify-start gap-3"
            )}
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && "Add a card"}
          </Button>
        </div>
      </div>
    </div>
  );
}