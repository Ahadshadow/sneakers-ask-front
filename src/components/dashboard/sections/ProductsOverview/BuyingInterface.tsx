import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  FileText, 
  Users,
  DollarSign,
  CheckCircle
} from "lucide-react";
import { Product } from "./types";

interface BuyingInterfaceProps {
  products: Product[];
}

interface PurchaseItem extends Product {
  quantity: number;
  notes: string;
}

export function BuyingInterface({ products }: BuyingInterfaceProps) {
  const [selectedProducts, setSelectedProducts] = useState<Record<string, PurchaseItem>>({});
  const [globalNotes, setGlobalNotes] = useState("");
  const { toast } = useToast();

  // Filter products with "open" status for buying
  const availableProducts = products.filter(product => product.status === "open");

  // Group selected products by seller
  const groupedBySeller = Object.values(selectedProducts).reduce((acc, product) => {
    if (!acc[product.seller]) {
      acc[product.seller] = [];
    }
    acc[product.seller].push(product);
    return acc;
  }, {} as Record<string, PurchaseItem[]>);

  const handleProductSelect = (product: Product, checked: boolean) => {
    setSelectedProducts(prev => {
      if (checked) {
        return {
          ...prev,
          [product.id]: {
            ...product,
            quantity: 1,
            notes: ""
          }
        };
      } else {
        const { [product.id]: removed, ...rest } = prev;
        return rest;
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: Math.max(1, quantity)
      }
    }));
  };

  const updateNotes = (productId: string, notes: string) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        notes
      }
    }));
  };

  const calculateTotal = () => {
    return Object.values(selectedProducts).reduce((total, product) => {
      const price = parseFloat(product.price.replace('$', ''));
      return total + (price * product.quantity);
    }, 0);
  };

  const generatePurchaseOrder = () => {
    const purchaseData = {
      id: `PO-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      sellers: Object.keys(groupedBySeller),
      products: Object.values(selectedProducts),
      total: calculateTotal(),
      globalNotes,
      status: 'pending'
    };

    // Simulate purchase order creation
    console.log('Purchase Order Generated:', purchaseData);
    
    toast({
      title: "Purchase Order Created",
      description: `Order #${purchaseData.id} created for ${purchaseData.sellers.length} seller(s)`,
    });

    // Generate shipment labels for each seller
    Object.entries(groupedBySeller).forEach(([seller, products]) => {
      generateShipmentLabel(seller, products, purchaseData.id);
    });

    // Reset form
    setSelectedProducts({});
    setGlobalNotes("");
  };

  const generateShipmentLabel = (seller: string, products: PurchaseItem[], orderId: string) => {
    const labelData = {
      orderId,
      seller,
      products: products.map(p => ({
        name: p.name,
        sku: p.sku,
        quantity: p.quantity,
        notes: p.notes
      })),
      shipDate: new Date().toISOString().split('T')[0],
      trackingNumber: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    // Simulate label and packing slip generation
    console.log(`Shipment Label for ${seller}:`, labelData);
    
    toast({
      title: "Shipment Label Generated",
      description: `Label sent to ${seller} - Tracking: ${labelData.trackingNumber}`,
    });
  };

  const selectedCount = Object.keys(selectedProducts).length;
  const totalValue = calculateTotal();

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Products</p>
              <p className="text-xl font-bold text-foreground">{availableProducts.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Selected Items</p>
              <p className="text-xl font-bold text-foreground">{selectedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sellers</p>
              <p className="text-xl font-bold text-foreground">{Object.keys(groupedBySeller).length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-xl font-bold text-foreground">${totalValue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card border-border shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Available Products (Open Status)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableProducts.map((product) => (
                <div key={product.id} className="p-4 border border-border rounded-lg bg-background/50">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={!!selectedProducts[product.id]}
                      onCheckedChange={(checked) => handleProductSelect(product, !!checked)}
                    />
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">{product.name}</h4>
                          <Badge variant="secondary">Open</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku} • Seller: {product.seller}</p>
                        <p className="text-lg font-semibold text-foreground">{product.price}</p>
                      </div>

                      {selectedProducts[product.id] && (
                        <div className="space-y-3 pt-2 border-t border-border">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Quantity:</label>
                            <input
                              type="number"
                              min="1"
                              value={selectedProducts[product.id].quantity}
                              onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                              className="w-20 px-2 py-1 border border-border rounded text-sm bg-background"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Notes:</label>
                            <Textarea
                              placeholder="Add notes for this product..."
                              value={selectedProducts[product.id].notes}
                              onChange={(e) => updateNotes(product.id, e.target.value)}
                              className="mt-1 min-h-[60px] bg-background"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Purchase Summary */}
        <div className="space-y-6">
          <Card className="bg-gradient-card border-border shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Purchase Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(groupedBySeller).length > 0 ? (
                Object.entries(groupedBySeller).map(([seller, products]) => (
                  <div key={seller} className="space-y-2">
                    <h4 className="font-medium text-foreground">{seller}</h4>
                    {products.map((product) => (
                      <div key={product.id} className="pl-3 text-sm text-muted-foreground">
                        {product.name} × {product.quantity}
                      </div>
                    ))}
                    <Separator className="my-2" />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No products selected
                </p>
              )}

              {selectedCount > 0 && (
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>${totalValue.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedCount > 0 && (
            <Card className="bg-gradient-card border-border shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Global Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add notes for the entire purchase order..."
                  value={globalNotes}
                  onChange={(e) => setGlobalNotes(e.target.value)}
                  className="min-h-[100px] bg-background"
                />
              </CardContent>
            </Card>
          )}

          {selectedCount > 0 && (
            <div className="space-y-3">
              <Button 
                onClick={generatePurchaseOrder}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Purchase Order
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                size="lg"
              >
                <Truck className="h-4 w-4 mr-2" />
                Generate Labels Only
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}