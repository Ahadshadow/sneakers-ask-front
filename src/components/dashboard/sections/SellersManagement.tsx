import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Store, Plus, MoreHorizontal, Building2, User } from "lucide-react";
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
  sellerType: "private" | "b2b";
  status: "active" | "pending" | "suspended";
  productsCount: number;
  totalSales: string;
  rating: number;
  joinDate: string;
  vatSettings: {
    vatNumber?: string;
    vatRate: number;
    vatRegistered: boolean;
  };
  bankDetails: {
    accountHolder: string;
    iban: string;
    bankName: string;
    paymentSchedule: "weekly" | "bi-weekly" | "monthly";
  };
}

const mockSellers: Seller[] = [
  {
    id: "1",
    storeName: "Premium Sneakers Co",
    ownerName: "Alex Rodriguez",
    email: "alex@premiumsneakers.com",
    sellerType: "b2b",
    status: "active",
    productsCount: 156,
    totalSales: "$89,420",
    rating: 4.8,
    joinDate: "2024-01-10",
    vatSettings: {
      vatNumber: "DE123456789",
      vatRate: 19,
      vatRegistered: true
    },
    bankDetails: {
      accountHolder: "Premium Sneakers Co Ltd",
      iban: "DE89 3704 0044 0532 0130 00",
      bankName: "Deutsche Bank",
      paymentSchedule: "bi-weekly"
    }
  },
  {
    id: "2",
    storeName: "Street Style Store",
    ownerName: "Maria Garcia",
    email: "maria@streetstyle.com",
    sellerType: "private",
    status: "active",
    productsCount: 89,
    totalSales: "$45,680",
    rating: 4.6,
    joinDate: "2024-02-15",
    vatSettings: {
      vatRate: 0,
      vatRegistered: false
    },
    bankDetails: {
      accountHolder: "Maria Garcia",
      iban: "ES91 2100 0418 4502 0005 1332",
      bankName: "Banco Santander",
      paymentSchedule: "monthly"
    }
  },
  {
    id: "3",
    storeName: "Rare Kicks Boutique",
    ownerName: "David Kim",
    email: "david@rarekicks.com",
    sellerType: "b2b",
    status: "pending",
    productsCount: 23,
    totalSales: "$12,300",
    rating: 4.9,
    joinDate: "2024-03-20",
    vatSettings: {
      vatNumber: "FR32123456789",
      vatRate: 20,
      vatRegistered: true
    },
    bankDetails: {
      accountHolder: "Rare Kicks Boutique SARL",
      iban: "FR14 2004 1010 0505 0001 3M02 606",
      bankName: "BNP Paribas",
      paymentSchedule: "weekly"
    }
  },
  {
    id: "4",
    storeName: "Urban Footwear",
    ownerName: "Lisa Chen",
    email: "lisa@urbanfootwear.com",
    sellerType: "private",
    status: "suspended",
    productsCount: 45,
    totalSales: "$28,750",
    rating: 3.2,
    joinDate: "2024-01-25",
    vatSettings: {
      vatRate: 0,
      vatRegistered: false
    },
    bankDetails: {
      accountHolder: "Lisa Chen",
      iban: "GB29 NWBK 6016 1331 9268 19",
      bankName: "NatWest Bank",
      paymentSchedule: "monthly"
    }
  },
  {
    id: "5",
    storeName: "Sole Traders Ltd",
    ownerName: "Michael Thompson",
    email: "mike@soletraders.com",
    sellerType: "b2b",
    status: "active",
    productsCount: 234,
    totalSales: "$156,890",
    rating: 4.7,
    joinDate: "2023-11-08",
    vatSettings: {
      vatNumber: "NL123456789B01",
      vatRate: 21,
      vatRegistered: true
    },
    bankDetails: {
      accountHolder: "Sole Traders B.V.",
      iban: "NL91 ABNA 0417 1643 00",
      bankName: "ABN AMRO Bank",
      paymentSchedule: "bi-weekly"
    }
  },
  {
    id: "6",
    storeName: "Personal Collection",
    ownerName: "Sarah Wilson",
    email: "sarah.wilson@gmail.com",
    sellerType: "private",
    status: "active",
    productsCount: 12,
    totalSales: "$8,450",
    rating: 4.9,
    joinDate: "2024-04-02",
    vatSettings: {
      vatRate: 0,
      vatRegistered: false
    },
    bankDetails: {
      accountHolder: "Sarah Wilson",
      iban: "IT60 X054 2811 1010 0000 0123 456",
      bankName: "UniCredit Bank",
      paymentSchedule: "monthly"
    }
  }
];

export function SellersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

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

  const getSellerTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "b2b": return "default";
      case "private": return "outline";
      default: return "secondary";
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
        <Button 
          className="bg-gradient-primary hover:opacity-90 transition-all duration-200 hover-scale"
          onClick={() => navigate("/add-seller")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Seller
        </Button>
      </div>

      {/* Sellers Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sellers</p>
                <p className="text-2xl font-bold text-card-foreground">{mockSellers.length}</p>
              </div>
              <Store className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">B2B Sellers</p>
                <p className="text-2xl font-bold text-card-foreground">{mockSellers.filter(s => s.sellerType === 'b2b').length}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Private Sellers</p>
                <p className="text-2xl font-bold text-card-foreground">{mockSellers.filter(s => s.sellerType === 'private').length}</p>
              </div>
              <User className="h-8 w-8 text-primary" />
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
                <TableHead>Type</TableHead>
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
                    <Badge variant={getSellerTypeBadgeVariant(seller.sellerType)}>
                      {seller.sellerType === 'b2b' ? 'B2B' : 'Private'}
                    </Badge>
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