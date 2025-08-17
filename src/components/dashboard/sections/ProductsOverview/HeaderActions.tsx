import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart } from "lucide-react";

interface HeaderActionsProps {
  cartCount?: number;
  onCartClick?: () => void;
}

export function HeaderActions({ cartCount = 0, onCartClick }: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Cart Button */}
      <Button 
        variant="outline" 
        className="flex items-center gap-1 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4 relative"
        onClick={onCartClick}
      >
        <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline text-sm">Cart</span>
        {cartCount > 0 && (
          <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {cartCount}
          </Badge>
        )}
      </Button>
      
      {/* Sync Button */}
      <Button className="bg-gradient-primary hover:opacity-90 transition-all duration-200 hover-scale shadow-md text-sm sm:text-base h-9 sm:h-10 px-3 sm:px-4">
        <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
        <span className="hidden sm:inline">Sync Products</span>
        <span className="sm:hidden">Sync</span>
      </Button>
    </div>
  );
}