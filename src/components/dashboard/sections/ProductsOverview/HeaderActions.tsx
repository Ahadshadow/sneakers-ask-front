import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export function HeaderActions() {
  return (
    <Button className="bg-gradient-primary hover:opacity-90 transition-all duration-200 hover-scale shadow-md">
      <Package className="h-4 w-4 mr-2" />
      Sync Products
    </Button>
  );
}