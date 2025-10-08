import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { OptimizedDashboardHeader } from "@/components/dashboard/OptimizedDashboardHeader";
import { UsersManagement } from "@/components/dashboard/sections/UsersManagement";

const Users = () => {
  const [currentSection, setCurrentSection] = useState("users");
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
              <UsersManagement />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Users;
