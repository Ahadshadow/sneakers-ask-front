import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, ExternalLink, MoreHorizontal, Zap, ShoppingCart, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: number;
  status: "open" | "fliproom_sale" | "sneakerask";
  seller: string;
  shopifyId: string;
  orders: OrderReference[];
}

interface OrderReference {
  orderId: string;
  orderNumber: string;
  quantity: number;
  orderDate: string;
  customerName: string;
  orderTotal: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Air Jordan 1 Retro High OG",
    sku: "AJ1-RH-001",
    category: "Basketball",
    price: "$170.00",
    stock: 45,
    status: "open",
    seller: "Premium Sneakers Co",
    shopifyId: "gid://shopify/Product/6789123456",
    orders: [
      {
        orderId: "1",
        orderNumber: "#SP001",
        quantity: 2,
        orderDate: "2024-08-15",
        customerName: "John Smith",
        orderTotal: "$510.00"
      },
      {
        orderId: "3",
        orderNumber: "#SP003",
        quantity: 1,
        orderDate: "2024-08-14",
        customerName: "Emily Davis",
        orderTotal: "$390.00"
      }
    ]
  },
  {
    id: "2",
    name: "Nike Dunk Low Retro White",
    sku: "NDL-RW-002",
    category: "Lifestyle",
    price: "$100.00",
    stock: 0,
    status: "fliproom_sale",
    seller: "Street Style Store",
    shopifyId: "gid://shopify/Product/6789123457",
    orders: [
      {
        orderId: "2",
        orderNumber: "#SP002",
        quantity: 1,
        orderDate: "2024-08-15",
        customerName: "Sarah Johnson",
        orderTotal: "$330.00"
      }
    ]
  },
  {
    id: "3",
    name: "Adidas Yeezy Boost 350 V2",
    sku: "YB3-V2-003",
    category: "Running",
    price: "$220.00",
    stock: 12,
    status: "sneakerask",
    seller: "Rare Kicks Boutique",
    shopifyId: "gid://shopify/Product/6789123458",
    orders: [
      {
        orderId: "2",
        orderNumber: "#SP002",
        quantity: 1,
        orderDate: "2024-08-15",
        customerName: "Sarah Johnson",
        orderTotal: "$330.00"
      },
      {
        orderId: "3",
        orderNumber: "#SP003",
        quantity: 1,
        orderDate: "2024-08-14",
        customerName: "Emily Davis",
        orderTotal: "$390.00"
      },
      {
        orderId: "4",
        orderNumber: "#SP004",
        quantity: 2,
        orderDate: "2024-08-13",
        customerName: "Michael Brown",
        orderTotal: "$440.00"
      }
    ]
  },
  {
    id: "4",
    name: "New Balance 550 Vintage",
    sku: "NB5-VT-004",
    category: "Lifestyle",
    price: "$110.00",
    stock: 28,
    status: "open",
    seller: "Urban Footwear",
    shopifyId: "gid://shopify/Product/6789123459",
    orders: []
  },
  {
    id: "5",
    name: "Converse Chuck 70 High Top",
    sku: "C70-HT-005",
    category: "Lifestyle",
    price: "$85.00",
    stock: 67,
    status: "sneakerask",
    seller: "Street Style Store",
    shopifyId: "gid://shopify/Product/6789123460",
    orders: [
      {
        orderId: "4",
        orderNumber: "#SP004",
        quantity: 1,
        orderDate: "2024-08-13",
        customerName: "Michael Brown",
        orderTotal: "$440.00"
      }
    ]
  }
];

export function ProductsOverview() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.seller.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open": return "secondary";
      case "fliproom_sale": return "outline";
      case "sneakerask": return "default";
      default: return "outline";
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-destructive";
    if (stock < 10) return "text-warning";
    return "text-success";
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border">
            <ExternalLink className="h-4 w-4 mr-2" />
            View in Shopify
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
            <Package className="h-4 w-4 mr-2" />
            Sync Products
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Shopify Products Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-card-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      <p className="text-xs text-muted-foreground">Seller: {product.seller}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-card-foreground">
                    {product.price}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{product.orders.length} Shopify orders</span>
                      {product.orders.length > 0 && (
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(product.status)}>
                      {product.status === "fliproom_sale" ? "Fliproom Sale" : 
                       product.status === "sneakerask" ? "SneakerAsk" : 
                       product.status === "open" ? "Open" : product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}