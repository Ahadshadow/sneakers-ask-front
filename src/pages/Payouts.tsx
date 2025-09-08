import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { OptimizedDashboardHeader } from "@/components/dashboard/OptimizedDashboardHeader";
import { PayoutManagement } from "@/components/dashboard/sections/PayoutManagement";

const Payouts = () => {
  const [currentSection, setCurrentSection] = useState("payouts");
  const location = useLocation();

  // Handle navigation from other pages
  useEffect(() => {
    if (location.state?.section) {
      setCurrentSection(location.state.section);
    }
  }, [location.state]);

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
              <PayoutManagement />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Payouts;
