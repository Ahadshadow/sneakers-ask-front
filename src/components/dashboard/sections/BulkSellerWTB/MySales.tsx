import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Package, Truck } from "lucide-react";
import { mockSales } from "./offerMockData";
import { Sale } from "./OfferTypes";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function MySales() {
  const [sales] = useState<Sale[]>(mockSales);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSales, setSelectedSales] = useState<string[]>([]);
  const navigate = useNavigate();

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesSearch = searchTerm === "" ||
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [sales, searchTerm]);

  const packagedSales = useMemo(() => {
    return filteredSales.filter(sale => sale.status === "packaged");
  }, [filteredSales]);

  const getStatusBadge = (status: Sale["status"]) => {
    const variants = {
      confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      packaged: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      shipped: "bg-green-500/10 text-green-700 dark:text-green-400",
      delivered: "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const toggleSaleSelection = (saleId: string) => {
    setSelectedSales(prev => 
      prev.includes(saleId) 
        ? prev.filter(id => id !== saleId)
        : [...prev, saleId]
    );
  };

  const handleCreateShipment = () => {
    if (selectedSales.length === 0) {
      toast.error("Please select at least one sale to ship");
      return;
    }
    
    // Navigate to create shipment flow with selected sales
    navigate("/dashboard/bulk-seller-wtb", { 
      state: { 
        section: "my-shipments",
        createShipment: true,
        selectedSaleIds: selectedSales 
      } 
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Sales</h1>
          <p className="text-muted-foreground mt-2">
            Manage your completed sales and create shipments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {packagedSales.length} Ready to Ship
          </Badge>
        </div>
      </div>

      {/* Info Card */}
      {packagedSales.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <Package className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Ready to Ship</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select packaged sales below to create shipping labels
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleCreateShipment}
                disabled={selectedSales.length === 0}
                className="whitespace-nowrap"
              >
                <Truck className="h-4 w-4 mr-2" />
                Create Shipment ({selectedSales.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardContent className="p-4">
          <div className="flex-1">
            <Label htmlFor="search" className="text-sm font-medium mb-2 block">
              Search Sales
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by product name, SKU, or sale ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredSales.length} of {sales.length} sales
        </span>
      </div>

      {/* Sales Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSales.map((sale) => (
          <Card key={sale.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={sale.image}
                  alt={sale.productName}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(sale.status)}
                </div>
                {sale.status === "packaged" && (
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedSales.includes(sale.id)}
                      onCheckedChange={() => toggleSaleSelection(sale.id)}
                      className="bg-white border-2"
                    />
                  </div>
                )}
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground line-clamp-1">
                    {sale.productName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{sale.sku}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <p className="font-medium">{sale.size}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <p className="font-medium">{sale.quantity} pairs</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price/pair:</span>
                    <p className="font-medium text-primary">€{sale.salePrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <p className="font-medium text-primary">€{sale.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                {sale.trackingNumber && (
                  <div className="pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      Tracking: {sale.trackingNumber}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    Sale Date: {new Date(sale.saleDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSales.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No sales found</p>
          </div>
        </Card>
      )}
    </div>
  );
}
