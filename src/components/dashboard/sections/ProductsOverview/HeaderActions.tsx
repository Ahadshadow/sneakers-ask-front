import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export function HeaderActions() {
  return (
    <Button className="bg-gradient-primary hover:opacity-90 transition-all duration-200 hover-scale shadow-md text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-4">
      <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
      <span className="hidden sm:inline">Sync Products</span>
      <span className="sm:hidden">Sync</span>
    </Button>
  );
}