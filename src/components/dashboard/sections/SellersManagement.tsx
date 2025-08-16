import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Store, Plus, MoreHorizontal, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Seller {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  status: "active" | "pending" | "suspended";
  productsCount: number;
  totalSales: string;
  rating: number;
  joinDate: string;
}

const mockSellers: Seller[] = [
  {
    id: "1",
    storeName: "Premium Sneakers Co",
    ownerName: "Alex Rodriguez",
    email: "alex@premiumsneakers.com",
    status: "active",
    productsCount: 156,
    totalSales: "$89,420",
    rating: 4.8,
    joinDate: "2024-01-10"
  },
  {
    id: "2",
    storeName: "Street Style Store",
    ownerName: "Maria Garcia",
    email: "maria@streetstyle.com",
    status: "active",
    productsCount: 89,
    totalSales: "$45,680",
    rating: 4.6,
    joinDate: "2024-02-15"
  },
  {
    id: "3",
    storeName: "Rare Kicks Boutique",
    ownerName: "David Kim",
    email: "david@rarekicks.com",
    status: "pending",
    productsCount: 23,
    totalSales: "$12,300",
    rating: 4.9,
    joinDate: "2024-03-20"
  },
  {
    id: "4",
    storeName: "Urban Footwear",
    ownerName: "Lisa Chen",
    email: "lisa@urbanfootwear.com",
    status: "suspended",
    productsCount: 45,
    totalSales: "$28,750",
    rating: 3.2,
    joinDate: "2024-01-25"
  },
];

export function SellersManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSellers = mockSellers.filter(seller =>
    seller.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "pending": return "secondary";
      case "suspended": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sellers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-2" />
          Create Seller
        </Button>
      </div>

      {/* Sellers Stats */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sellers</p>
                <p className="text-2xl font-bold text-card-foreground">1,243</p>
              </div>
              <Store className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sellers Table */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Sellers Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-card-foreground">{seller.storeName}</p>
                      <p className="text-sm text-muted-foreground">Since {new Date(seller.joinDate).toLocaleDateString()}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-card-foreground">{seller.ownerName}</p>
                      <p className="text-sm text-muted-foreground">{seller.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(seller.status)}>
                      {seller.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {seller.productsCount}
                  </TableCell>
                  <TableCell className="font-medium text-success">
                    {seller.totalSales}
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