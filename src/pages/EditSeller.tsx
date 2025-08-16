import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Store, Mail, Globe, Upload, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const businessTypes = [
  "Private",
  "B2B"
];

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Australia",
  "Other"
];

// Mock seller data - in a real app this would come from an API
const mockSellers = {
  "1": {
    id: "1",
    businessName: "Premium Sneakers Co",
    contactName: "Alex Rodriguez",
    email: "alex@premiumsneakers.com",
    website: "https://premiumsneakers.com",
    businessType: "B2B",
    country: "United States",
    description: "Premium sneaker retailer specializing in limited edition and exclusive releases.",
    vatNumber: "DE123456789",
    tinNumber: ""
  },
  "2": {
    id: "2",
    businessName: "",
    contactName: "Maria Garcia",
    email: "maria@streetstyle.com",
    website: "https://streetstyle.com",
    businessType: "Private",
    country: "United States",
    description: "Urban fashion and streetwear boutique.",
    vatNumber: "",
    tinNumber: "123-45-6789"
  }
};

export default function EditSeller() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    website: "",
    businessType: "",
    country: "",
    description: "",
    vatNumber: "",
    tinNumber: ""
  });

  useEffect(() => {
    // Load seller data - in a real app this would be an API call
    if (id && mockSellers[id as keyof typeof mockSellers]) {
      const seller = mockSellers[id as keyof typeof mockSellers];
      setFormData({
        businessName: seller.businessName,
        contactName: seller.contactName,
        email: seller.email,
        website: seller.website,
        businessType: seller.businessType,
        country: seller.country,
        description: seller.description,
        vatNumber: seller.vatNumber || "",
        tinNumber: seller.tinNumber || ""
      });
    }
  }, [id]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Seller Updated Successfully",
      description: `${formData.businessName} details have been updated.`,
    });
    
    setIsSubmitting(false);
    navigate("/", { state: { section: "sellers" } });
  };

  if (!id || !mockSellers[id as keyof typeof mockSellers]) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Seller Not Found</h2>
            <p className="text-muted-foreground mb-4">The seller you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="hover-scale transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Edit Seller Details</h1>
              <p className="text-sm text-muted-foreground">Update seller information and settings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Business Information */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Business Logo */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {formData.businessName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.businessType === "B2B" && (
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      placeholder="Enter business name"
                      required
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Person *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange("contactName", e.target.value)}
                    placeholder="Enter contact person name"
                    required
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter business email"
                      className="pl-10 transition-all duration-200 focus:scale-[1.02]"
                      required
                    />
                </div>
                
                {/* Conditional Tax Fields */}
                {formData.businessType === "B2B" && (
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">VAT Number</Label>
                    <Input
                      id="vatNumber"
                      value={formData.vatNumber}
                      onChange={(e) => handleInputChange("vatNumber", e.target.value)}
                      placeholder="Enter VAT number"
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                )}
                
                {formData.businessType === "Private" && (
                  <div className="space-y-2">
                    <Label htmlFor="tinNumber">TIN Number</Label>
                    <Input
                      id="tinNumber"
                      value={formData.tinNumber}
                      onChange={(e) => handleInputChange("tinNumber", e.target.value)}
                      placeholder="Enter TIN number"
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                )}
              </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://example.com"
                      className="pl-10 transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select 
                    value={formData.businessType} 
                    onValueChange={(value) => {
                      handleInputChange("businessType", value);
                      // Clear business name and VAT if switching to Private
                      if (value === "Private") {
                        handleInputChange("businessName", "");
                        handleInputChange("vatNumber", "");
                      }
                      // Clear TIN if switching to B2B
                      if (value === "B2B") {
                        handleInputChange("tinNumber", "");
                      }
                    }}
                    required
                  >
                    <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)} required>
                    <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the business, products, and specialties..."
                  className="transition-all duration-200 focus:scale-[1.02]"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/")}
              className="hover-scale transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-primary hover:opacity-90 transition-all duration-200 hover-scale min-w-32"
            >
              {isSubmitting ? "Updating Seller..." : "Update Seller"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}