import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { OptimizedDashboardHeader } from "./OptimizedDashboardHeader";
import { DashboardOverview } from "./sections/DashboardOverview";
import { UsersManagement } from "./sections/UsersManagement";
import { RolesManagement } from "./sections/RolesManagement";
import { SellersManagement } from "./sections/SellersManagement";
import { ProductsOverview } from "./sections/ProductsOverview";

export function Dashboard() {
  const [currentSection, setCurrentSection] = useState("dashboard");
  const location = useLocation();

  // Handle navigation from other pages
  useEffect(() => {
    if (location.state?.section) {
      setCurrentSection(location.state.section);
    }
  }, [location.state]);

  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return <DashboardOverview />;
      case "users":
        return <UsersManagement />;
      case "roles":
        return <RolesManagement />;
      case "sellers":
        return <SellersManagement />;
      case "products":
        return <ProductsOverview />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar 
          currentSection={currentSection} 
          onSectionChange={setCurrentSection} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <OptimizedDashboardHeader currentSection={currentSection} />
          
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8 animate-fade-in">
              {renderSection()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}