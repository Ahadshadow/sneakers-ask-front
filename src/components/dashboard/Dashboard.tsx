import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { OptimizedDashboardHeader } from "./OptimizedDashboardHeader";
import { DashboardOverview } from "./sections/DashboardOverview";
import { UsersManagement } from "./sections/UsersManagement";
import { RolesManagement } from "./sections/RolesManagement";
import { SellersManagement } from "./sections/SellersManagement";
import { ProductsOverview } from "./sections/ProductsOverview";
import { PayoutManagement } from "./sections/PayoutManagement";
import { BulkSellerWTBView } from "./sections/BulkSellerWTB";
import { MyOffers } from "./sections/BulkSellerWTB/MyOffers";
import { MySales } from "./sections/BulkSellerWTB/MySales";
import { MyShipments } from "./sections/BulkSellerWTB/MyShipments";
import { History } from "./sections/BulkSellerWTB/History";
import { Payout } from "./sections/BulkSellerWTB/Payout";
import { useAuth } from "@/contexts/AuthContext";
import { isSeller } from "@/lib/utils/auth";

export function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userIsSeller = isSeller(user);

  // Determine current section from URL
  const getSectionFromPath = (pathname: string): string => {
    if (pathname.startsWith('/seller/')) {
      const section = pathname.replace('/seller/', '');
      if (section === '' || section === 'seller') return 'wtb-requests';
      return section;
    }
    // Admin routes
    if (pathname === '/' || pathname === '') return 'dashboard';
    if (pathname === '/products') return 'products';
    if (pathname === '/payouts') return 'payouts';
    if (pathname === '/users') return 'users';
    if (pathname === '/roles') return 'roles';
    if (pathname === '/sellers') return 'sellers';
    if (pathname === '/vendors') return 'vendors';
    return 'dashboard';
  };

  const [currentSection, setCurrentSection] = useState(() => {
    return getSectionFromPath(location.pathname);
  });

  // Update section when URL changes
  useEffect(() => {
    const section = getSectionFromPath(location.pathname);
    setCurrentSection(section);
  }, [location.pathname]);

  // Route restrictions are handled by AdminRoute and SellerRoute components
  // No need for additional redirects here

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const renderSection = () => {
    // Bulk sellers see their specific sections
    if (userIsSeller) {
      switch (currentSection) {
        case "wtb-requests":
        case "":
          return <BulkSellerWTBView />;
        case "my-offers":
          return <MyOffers />;
        case "my-sales":
          return <MySales />;
        case "my-shipments":
          return <MyShipments />;
        case "history":
          return <History />;
        case "payout":
          return <Payout />;
        default:
          return <BulkSellerWTBView />;
      }
    }

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
          <OptimizedDashboardHeader currentSection={currentSection || getSectionFromPath(location.pathname)} />
          
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