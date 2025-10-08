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
import { PayoutManagement } from "./sections/PayoutManagement";

export function Dashboard() {
  const [currentSection, setCurrentSection] = useState("dashboard");
  const location = useLocation();

  // Handle navigation from other pages
  useEffect(() => {
    if (location.state?.section) {
      setCurrentSection(location.state.section);
    }
  }, [location.state]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      case "payouts":
        return <PayoutManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar 
          currentSection={currentSection} 
          onSectionChange={setCurrentSection} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <OptimizedDashboardHeader currentSection={currentSection} />
          
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6 space-y-8 animate-fade-in">
              {renderSection()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}