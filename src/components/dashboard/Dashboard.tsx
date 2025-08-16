import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardOverview } from "./sections/DashboardOverview";
import { UsersManagement } from "./sections/UsersManagement";
import { SellersManagement } from "./sections/SellersManagement";
import { ProductsOverview } from "./sections/ProductsOverview";

export function Dashboard() {
  const [currentSection, setCurrentSection] = useState("dashboard");

  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return <DashboardOverview />;
      case "users":
        return <UsersManagement />;
      case "sellers":
        return <SellersManagement />;
      case "products":
        return <ProductsOverview />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentSection={currentSection} onSectionChange={setCurrentSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader currentSection={currentSection} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}