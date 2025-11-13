import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Store, Mail, Phone, Globe, Building, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { sellersApi } from "@/lib/api/sellers";
import { sendcloudApi } from "@/lib/api/sendcloud";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/data/countries";
import { COUNTRY_CODES, getCountryCodeByName } from "@/data/countryCodes";

const businessTypes = [
  "Private",
  "B2B"
];

const countryCodes = COUNTRY_CODES;

export default function AddSeller() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ibanError, setIbanError] = useState(false);
  const [whatsappCountryOpen, setWhatsappCountryOpen] = useState(false);
  
  // Fetch shipping options for NL to NL (default)
  const { data: shippingOptions, isLoading: isLoadingShipping } = useQuery({
    queryKey: ['seller-shipping-options'],
    queryFn: async () => {
      const request = {
        from_country_code: 'NL',
        to_country_code: 'NL',
        parcels: [sendcloudApi.getDefaultParcel()],
      };
      return await sendcloudApi.getShippingOptions(request);
    },
  });
  
  const [formData, setFormData] = useState({
    // Basic Info
    storeName: "",
    ownerName: "",
    email: "",
    contactPerson: "",
    website: "",
    businessType: "",
    country: "",
    businessDescription: "",
    
    // WhatsApp Info
    whatsappCountryCode: "+31",
    whatsappNumber: "",
    
    // Tax Info
    tinNumber: "",
    vatNumber: "",
    vatRate: "",
    vatRegistered: false,
    
    // Bank Details
    accountHolder: "",
    iban: "",
    bankName: "",
    
    // Shipment
    preferredShipmentCode: "",
    
    // Additional
    status: "pending"
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-select country code when country is selected
    if (field === 'country' && typeof value === 'string') {
      const countryCode = getCountryCodeByName(value);
      if (countryCode) {
        setFormData(prev => ({ ...prev, whatsappCountryCode: countryCode }));
      }
    }
    
    // Clear IBAN error when user starts typing
    if (field === 'iban') {
      setIbanError(false);
    }
  };

  const handleWhatsAppNumberChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    handleInputChange("whatsappNumber", numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a seller.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Debug: Check auth token
      const token = localStorage.getItem('auth_token');
      console.log('Auth token:', token ? 'Present' : 'Missing');
      console.log('User authenticated:', isAuthenticated);
      console.log('User:', user);
      
      // Prepare API data
      const apiData: any = {
        store_name: formData.storeName,
        owner_name: formData.ownerName,
        email: formData.email,
        contact_person: formData.contactPerson,
        website: formData.website,
        tin_number: formData.tinNumber,
        country: formData.country,
        business_description: formData.businessDescription,
        seller_type: formData.businessType.toLowerCase() as "private" | "b2b",
        status: formData.status as "active" | "pending" | "suspended",
        vat_number: formData.vatNumber,
        vat_rate: parseFloat(formData.vatRate) || 0,
        vat_registered: formData.vatRegistered,
        join_date: new Date().toISOString().split('T')[0], // Today's date
        whatsapp_number: formData.whatsappCountryCode && formData.whatsappNumber 
          ? `${formData.whatsappCountryCode}${formData.whatsappNumber}` 
          : ""
      };

      // Only add bank details if they are provided
      if (formData.accountHolder.trim()) {
        apiData.account_holder = formData.accountHolder;
      }
      if (formData.iban.trim()) {
        apiData.iban = formData.iban;
      }
      if (formData.bankName.trim()) {
        apiData.bank_name = formData.bankName;
      }
      if (formData.preferredShipmentCode) {
        apiData.shipment_method_code = formData.preferredShipmentCode;
      }

      // Call API using sellersApi
      const result = await sellersApi.createSeller(apiData);
      
      // Invalidate sellers cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      
      toast({
        title: "Seller Added Successfully",
        description: `${formData.storeName || formData.ownerName} has been added to your seller network.`,
      });
      
      navigate("/sellers");
    } catch (error: any) {
      console.error('Error creating seller:', error);
      
      // Handle validation errors from backend
      if (error?.errors) {
        const errorMessages = Object.values(error.errors).flat();
        const errorMessage = errorMessages.join(', ');
        
        // Check if IBAN validation error exists
        if (error.errors.iban || errorMessage.toLowerCase().includes('iban')) {
          setIbanError(true);
        }
        
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error?.message || "Failed to create seller. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/sellers")}
              className="hover-scale transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sellers
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add New Seller</h1>
              <p className="text-sm text-muted-foreground">Onboard a new seller to your marketplace</p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name *</Label>
                  <Input
                    id="storeName"
                    value={formData.storeName}
                    onChange={(e) => handleInputChange("storeName", e.target.value)}
                    placeholder="Enter store name"
                    required
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange("ownerName", e.target.value)}
                    placeholder="Enter owner name"
                    required
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                    placeholder="Enter contact person name"
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
                      // Clear VAT fields if switching to Private
                      if (value === "Private") {
                        handleInputChange("vatNumber", "");
                        handleInputChange("vatRate", "");
                        handleInputChange("vatRegistered", false);
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

                
                
                {/* Conditional Tax Fields */}
                {formData.businessType === "B2B" && (
                  <>
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
                    <div className="space-y-2">
                      <Label htmlFor="vatRate">VAT Rate (%)</Label>
                      <Input
                        id="vatRate"
                        type="number"
                        step="0.01"
                        value={formData.vatRate}
                        onChange={(e) => handleInputChange("vatRate", e.target.value)}
                        placeholder="Enter VAT rate"
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="vatRegistered"
                        checked={formData.vatRegistered}
                        onCheckedChange={(checked) => handleInputChange("vatRegistered", checked)}
                      />
                      <Label htmlFor="vatRegistered">VAT Registered</Label>
                    </div>
                  </>
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

              <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)} required>
                    <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div></div>
              </div>
                {/* WhatsApp Number Field */}
                <div className="space-y-2">
                   <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                   <div className="flex gap-2">
                     <div className="w-40">
                       <Popover open={whatsappCountryOpen} onOpenChange={setWhatsappCountryOpen}>
                         <PopoverTrigger asChild>
                           <Button
                             variant="outline"
                             role="combobox"
                             aria-expanded={whatsappCountryOpen}
                             className="w-full justify-between transition-all duration-200 focus:scale-[1.02]"
                           >
                             {formData.whatsappCountryCode
                               ? `${countryCodes.find((country) => country.code === formData.whatsappCountryCode)?.code} ${countryCodes.find((country) => country.code === formData.whatsappCountryCode)?.country || ''}`
                               : "Select country code"}
                             <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                           </Button>
                         </PopoverTrigger>
                         <PopoverContent className="w-80 p-0">
                           <Command>
                             <CommandInput placeholder="Search country code..." />
                             <CommandList>
                               <CommandEmpty>No country code found.</CommandEmpty>
                               <CommandGroup>
                                 {countryCodes.map((country) => (
                                   <CommandItem
                                     key={country.code}
                                     value={`${country.code} ${country.country}`}
                                     onSelect={() => {
                                       handleInputChange("whatsappCountryCode", country.code);
                                       setWhatsappCountryOpen(false);
                                     }}
                                   >
                                     <Check
                                       className={cn(
                                         "mr-2 h-4 w-4",
                                         formData.whatsappCountryCode === country.code ? "opacity-100" : "opacity-0"
                                       )}
                                     />
                                     <div className="flex items-center gap-2">
                                       <span className="font-mono text-sm">{country.code}</span>
                                       <span className="text-muted-foreground">{country.country}</span>
                                     </div>
                                   </CommandItem>
                                 ))}
                               </CommandGroup>
                             </CommandList>
                           </Command>
                         </PopoverContent>
                       </Popover>
                     </div>
                     <div className="flex-1">
                       <div className="relative">
                         <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input
                           id="whatsappNumber"
                           value={formData.whatsappNumber}
                           onChange={(e) => handleWhatsAppNumberChange(e.target.value)}
                           placeholder="1234567890"
                           className="pl-10 transition-all duration-200 focus:scale-[1.02]"
                         />
                       </div>
                     </div>
                   </div>
                   <p className="text-xs text-muted-foreground">WhatsApp number only</p>
                 </div>

              {/* Preferred Shipment Option */}
              <div className="space-y-2">
                <Label htmlFor="preferredShipmentCode">Preferred Shipment Option</Label>
                {isLoadingShipping ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading shipping options...
                  </div>
                ) : shippingOptions && shippingOptions.length > 0 ? (
                  <Select
                    value={formData.preferredShipmentCode}
                    onValueChange={(value) => handleInputChange("preferredShipmentCode", value)}
                  >
                    <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                      <SelectValue placeholder="Select preferred shipment option" />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingOptions.map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            <span>{option.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({option.carrier?.name})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground p-2 border rounded-md">
                    No shipping options available
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Default shipping method for this seller</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessDescription">Business Description</Label>
                <Textarea
                  id="businessDescription"
                  value={formData.businessDescription}
                  onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                  placeholder="Describe the business, products, and specialties..."
                  className="transition-all duration-200 focus:scale-[1.02]"
                  rows={4}
                />
              </div>
              
              {/* Additional Information Note */}
              <div className="bg-muted/20 border border-border rounded-lg p-4 mt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Extra informatie:</strong> Als je seller toevoegt, graag ook discord naam of nummer als optie kunnen geven - goed eventueel om SMS of E-mail marketing uiteindelijk te doen hiermee.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Account Holder</Label>
                  <Input
                    id="accountHolder"
                    value={formData.accountHolder}
                    onChange={(e) => handleInputChange("accountHolder", e.target.value)}
                    placeholder="Enter account holder name"
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={formData.iban}
                    onChange={(e) => handleInputChange("iban", e.target.value)}
                    placeholder="Enter IBAN"
                    className={cn(
                      "transition-all duration-200 focus:scale-[1.02]",
                      ibanError && "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50"
                    )}
                  />
                  {ibanError && (
                    <p className="text-sm text-red-500">Please enter a valid IBAN number</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                    placeholder="Enter bank name"
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Actions */}
          <div className="flex items-center justify-between pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/sellers")}
              className="hover-scale transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-32"
            >
              {isSubmitting ? "Adding Seller..." : "Add Seller"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}