import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Truck, Package, Calendar, X, AlertTriangle, ChevronDown, FileText, Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockSales, mockShipments } from "./offerMockData";
import { Sale, Shipment } from "./OfferTypes";
import { toast } from "sonner";

export function MyShipments() {
  const [sales, setSales] = useState<Sale[]>(
    mockSales.filter(sale => sale.status === "packaged" || sale.status === "shipped")
  );
  const [shipments, setShipments] = useState<Shipment[]>(mockShipments);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ready-to-ship");
  const [selectedSaleIds, setSelectedSaleIds] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  const isOverdue = (saleDate: string) => {
    const daysSinceSale = Math.floor(
      (new Date().getTime() - new Date(saleDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceSale > 2; // Overdue if more than 2 days since sale
  };

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesSearch = searchTerm === "" ||
        sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch && sale.status === "packaged";
    });
  }, [sales, searchTerm]);

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const matchesSearch = searchTerm === "" ||
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.sales.some(sale => 
          sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      return matchesSearch;
    });
  }, [shipments, searchTerm]);

  const packagedSales = filteredSales;
  
  const allPackagedCount = sales.filter(sale => sale.status === "packaged").length;

  const handleSelectSale = (saleId: string, checked: boolean) => {
    if (checked) {
      setSelectedSaleIds([...selectedSaleIds, saleId]);
    } else {
      setSelectedSaleIds(selectedSaleIds.filter(id => id !== saleId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSaleIds(packagedSales.map(sale => sale.id));
    } else {
      setSelectedSaleIds([]);
    }
  };

  const handleCreateShipment = () => {
    if (selectedSaleIds.length === 0) {
      toast.error("Please select at least one sale");
      return;
    }
    setIsCreateDialogOpen(true);
  };

  const handleConfirmShipment = () => {
    if (!selectedCarrier || !estimatedDelivery) {
      toast.error("Please fill in all fields");
      return;
    }

    const trackingNumber = `TN-${Date.now()}`;
    const selectedSales = sales.filter(sale => selectedSaleIds.includes(sale.id));
    
    const newShipment: Shipment = {
      id: `SHIP-${(shipments.length + 1).toString().padStart(3, '0')}`,
      sales: selectedSales,
      trackingNumber,
      carrier: selectedCarrier,
      createdDate: new Date().toISOString().split('T')[0],
      estimatedDelivery,
      status: "pending",
      totalItems: selectedSales.reduce((sum, sale) => sum + sale.quantity, 0)
    };

    setShipments([newShipment, ...shipments]);
    setSales(sales.map(sale => 
      selectedSaleIds.includes(sale.id)
        ? { ...sale, status: "shipped" as const, trackingNumber }
        : sale
    ));

    toast.success(`Shipment created! Tracking: ${trackingNumber}`);
    
    setIsCreateDialogOpen(false);
    setSelectedCarrier("");
    setEstimatedDelivery("");
    setSelectedSaleIds([]);
    setActiveTab("shipments");
  };

  const handleCancelSale = (sale: Sale) => {
    setSaleToCancel(sale);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (saleToCancel) {
      setSales(sales.filter(sale => sale.id !== saleToCancel.id));
      toast.success(`Sale ${saleToCancel.id} has been cancelled`);
      setSaleToCancel(null);
    }
    setIsCancelDialogOpen(false);
  };

  const getStatusBadge = (status: Sale["status"]) => {
    const variants = {
      packaged: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
      shipped: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
    };
    const labels = {
      packaged: "Packaged",
      shipped: "Shipped"
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  }

  const handleDownloadPackageSlip = (sale: Sale, shipmentId: string) => {
    // Generate package slip data
    const packageSlipData = {
      shipmentId,
      saleId: sale.id,
      productName: sale.productName,
      sku: sale.sku,
      size: sale.size,
      quantity: sale.quantity,
      trackingNumber: sale.trackingNumber || 'N/A',
      date: new Date().toLocaleDateString()
    };
    
    toast.success(`Package slip for ${sale.productName} downloaded`);
    console.log('Package Slip Data:', packageSlipData);
    // In a real implementation, this would generate a PDF or open a print dialog
  };

  function getShipmentStatusBadge(status: Shipment["status"]) {
    const variants = {
      pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
      in_transit: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      delivered: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
    } as const;
    const labels = {
      pending: "Pending Pickup",
      in_transit: "In Transit",
      delivered: "Delivered"
    } as const;
    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Ready to Ship Header */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Ready to Ship</h2>
                <p className="text-sm text-muted-foreground">
                  Select packaged sales below to create shipping labels
                </p>
              </div>
            </div>
            <Button 
              onClick={handleCreateShipment}
              disabled={selectedSaleIds.length === 0}
              size="lg"
            >
              <Truck className="h-4 w-4 mr-2" />
              Create Shipment ({selectedSaleIds.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Ready to Ship vs Shipments */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ready-to-ship" className="gap-2">
                <Package className="h-4 w-4" />
                Ready to Ship
              </TabsTrigger>
              <TabsTrigger value="shipments" className="gap-2">
                <Truck className="h-4 w-4" />
                Shipments
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-4">
            <Label htmlFor="search" className="text-sm font-medium mb-2 block">
              Search {activeTab === "ready-to-ship" ? "Sales" : "Shipments"}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder={activeTab === "ready-to-ship" 
                  ? "Search by product name, SKU, or sale ID..." 
                  : "Search by tracking number, carrier, or product..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Ready to Ship Tab Content */}
        <TabsContent value="ready-to-ship" className="space-y-6 mt-0">
          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredSales.length} of {allPackagedCount} packaged sales
            </span>
            {packagedSales.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedSaleIds.length === packagedSales.length && packagedSales.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="cursor-pointer">
                  Select all
                </Label>
              </div>
            )}
          </div>

          {/* Sales Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSales.map((sale) => {
              const overdue = isOverdue(sale.saleDate);
              const isSelected = selectedSaleIds.includes(sale.id);
              
              return (
                <Card 
                  key={sale.id} 
                  onClick={() => handleSelectSale(sale.id, !isSelected)}
                  className={`overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
                    overdue ? "border-red-500/50 shadow-red-500/10" : ""
                  } ${
                    isSelected ? "ring-2 ring-primary shadow-lg" : ""
                  }`}
                >
                  <CardContent className="p-0">
                    {/* Checkbox and Status Badge */}
                    <div className="p-4 pb-0 flex items-start justify-between">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectSale(sale.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                      <div className="flex items-center gap-2">
                        {overdue && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                        {getStatusBadge(sale.status)}
                      </div>
                    </div>

                    {/* Product Image */}
                    <div className="aspect-square bg-muted/30 flex items-center justify-center p-8">
                      <img 
                        src={sale.image} 
                        alt={sale.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-foreground text-lg leading-tight">
                          {sale.productName}
                        </h3>
                        <p className="text-sm text-muted-foreground font-mono mt-1">
                          {sale.sku}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Size:</p>
                          <p className="font-semibold">{sale.size}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantity:</p>
                          <p className="font-semibold">{sale.quantity} pairs</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Price/pair:</p>
                          <p className="font-semibold">€{sale.salePrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total:</p>
                          <p className="font-semibold text-primary">€{sale.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          Sale Date: {new Date(sale.saleDate).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Cancel Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelSale(sale);
                        }}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Sale
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredSales.length === 0 && (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No packaged sales found</p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Shipments Tab Content */}
        <TabsContent value="shipments" className="space-y-6 mt-0">
          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredShipments.length} of {shipments.length} shipments
            </span>
          </div>

          {/* Shipments List */}
          <div className="space-y-4">
            {filteredShipments.map((shipment) => (
              <Collapsible key={shipment.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CollapsibleTrigger className="w-full">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <Truck className="h-6 w-6 text-primary" />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold text-lg">{shipment.id}</h3>
                              {getShipmentStatusBadge(shipment.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {shipment.carrier} • {shipment.totalItems} pairs
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-medium">{shipment.trackingNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              Est. {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                            </p>
                          </div>
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="border-t bg-muted/30 p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Items in this shipment
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {shipment.sales.map((sale) => (
                          <Card key={sale.id} className="overflow-hidden">
                            <div className="aspect-square bg-background flex items-center justify-center p-4">
                              <img 
                                src={sale.image} 
                                alt={sale.productName}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <CardContent className="p-4 space-y-3">
                              <div>
                                <h5 className="font-semibold text-sm leading-tight">{sale.productName}</h5>
                                <p className="text-xs text-muted-foreground font-mono mt-1">{sale.sku}</p>
                              </div>
                              
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Size: {sale.size}</span>
                                <span className="font-semibold">{sale.quantity}x</span>
                              </div>
                              
                              <div className="text-sm font-semibold text-primary">
                                €{sale.totalAmount.toFixed(2)}
                              </div>

                              {/* Package Slip Info */}
                              <div className="pt-3 border-t space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <FileText className="h-3 w-3" />
                                  <span>Package Slip</span>
                                </div>
                                {sale.trackingNumber && (
                                  <p className="text-xs font-mono bg-muted/50 p-2 rounded">
                                    {sale.trackingNumber}
                                  </p>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadPackageSlip(sale, shipment.id)}
                                  className="w-full"
                                >
                                  <Download className="h-3 w-3 mr-2" />
                                  Download Slip
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>

          {filteredShipments.length === 0 && (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No shipments found</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Shipment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Shipment</DialogTitle>
            <DialogDescription>
              Generate shipping labels for selected sales
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Selected Sales ({selectedSaleIds.length})</Label>
              <div className="bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {sales.filter(sale => selectedSaleIds.includes(sale.id)).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{sale.productName}</span>
                    <span className="text-muted-foreground">
                      {sale.quantity} pairs - €{sale.totalAmount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Total: {sales.filter(sale => selectedSaleIds.includes(sale.id)).reduce((sum, s) => sum + s.quantity, 0)} pairs
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carrier">Shipping Carrier</Label>
              <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DHL Express">DHL Express</SelectItem>
                  <SelectItem value="UPS">UPS</SelectItem>
                  <SelectItem value="FedEx">FedEx</SelectItem>
                  <SelectItem value="PostNL">PostNL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery">Estimated Delivery Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="delivery"
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmShipment}>
              <Truck className="h-4 w-4 mr-2" />
              Create Shipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Sale Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Sale?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel {saleToCancel?.id}? This action cannot be undone.
              {saleToCancel && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="font-medium text-foreground">{saleToCancel.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {saleToCancel.quantity} pairs - €{saleToCancel.totalAmount.toFixed(2)}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Sale</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-red-600 hover:bg-red-700">
              Cancel Sale
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
