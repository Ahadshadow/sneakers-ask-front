import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    ownerName: "",
    email: "",
    sellerType: "private",
    vatRegistered: false,
    vatNumber: "",
    tinNumber: "",
    vatRate: 0,
    accountHolder: "",
    iban: "",
    swift: "",
    bankName: ""
  });

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

  const handleCreateSeller = () => {
    // Here you would typically send the data to your backend
    console.log("Creating seller with data:", formData);
    setIsCreateDialogOpen(false);
    // Reset form
    setFormData({
      storeName: "",
      ownerName: "",
      email: "",
      sellerType: "private",
      vatRegistered: false,
      vatNumber: "",
      tinNumber: "",
      vatRate: 0,
      accountHolder: "",
      iban: "",
      swift: "",
      bankName: ""
    });
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4 mr-2" />
              Create Seller
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Seller</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div>
                  <Label htmlFor="sellerType">Seller Type</Label>
                  <Select value={formData.sellerType} onValueChange={(value) => setFormData({...formData, sellerType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select seller type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private Seller</SelectItem>
                      <SelectItem value="b2b">B2B Seller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {formData.sellerType === "b2b" && (
                    <div>
                      <Label htmlFor="storeName">Store Name</Label>
                      <Input
                        id="storeName"
                        value={formData.storeName}
                        onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                        placeholder="Enter store name"
                      />
                    </div>
                  )}
                  <div className={formData.sellerType === "private" ? "col-span-2" : ""}>
                    <Label htmlFor="ownerName">{formData.sellerType === "b2b" ? "Owner Name" : "Full Name"}</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                      placeholder={formData.sellerType === "b2b" ? "Enter owner name" : "Enter your full name"}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address"
                  />
              </div>

              {/* Tax Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tax Information</h3>
                
                {formData.sellerType === "private" ? (
                  <div>
                    <Label htmlFor="tinNumber">TIN Number</Label>
                    <Input
                      id="tinNumber"
                      value={formData.tinNumber}
                      onChange={(e) => setFormData({...formData, tinNumber: e.target.value})}
                      placeholder="Enter Tax Identification Number"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="vatRegistered"
                        checked={formData.vatRegistered}
                        onCheckedChange={(checked) => setFormData({...formData, vatRegistered: checked})}
                      />
                      <Label htmlFor="vatRegistered">VAT Registered</Label>
                    </div>
                    {formData.vatRegistered && (
                      <div>
                        <Label htmlFor="vatNumber">VAT Number</Label>
                        <Input
                          id="vatNumber"
                          value={formData.vatNumber}
                          onChange={(e) => setFormData({...formData, vatNumber: e.target.value})}
                          placeholder="Enter VAT number"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
              </div>


              {/* Bank Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bank Details</h3>
                <div>
                  <Label htmlFor="accountHolder">Account Holder</Label>
                  <Input
                    id="accountHolder"
                    value={formData.accountHolder}
                    onChange={(e) => setFormData({...formData, accountHolder: e.target.value})}
                    placeholder="Enter account holder name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={formData.iban}
                      onChange={(e) => setFormData({...formData, iban: e.target.value})}
                      placeholder="Enter IBAN"
                    />
                  </div>
                  <div>
                    <Label htmlFor="swift">SWIFT Code</Label>
                    <Input
                      id="swift"
                      value={formData.swift || ""}
                      onChange={(e) => setFormData({...formData, swift: e.target.value})}
                      placeholder="Enter SWIFT code"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    placeholder="Enter bank name"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSeller} className="bg-gradient-primary hover:opacity-90">
                  Create Seller
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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