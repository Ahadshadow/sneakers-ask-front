import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Store, Mail, Phone, MapPin, Globe, Building, Loader2, Truck, Lock, Eye, EyeOff } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/data/countries";
import { COUNTRY_CODES, getCountryCodeByName } from "@/data/countryCodes";

const businessTypes = [
  "Private",
  "B2B"
];

const countryCodes = COUNTRY_CODES;

export default function SellerOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ibanError, setIbanError] = useState(false);
  const [whatsappCountryOpen, setWhatsappCountryOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  
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
    ownerName: "",
    password: "",
    contactPerson: "",
    website: "",
    businessType: "",
    country: "",
    businessDescription: "",
    
    // WhatsApp Info
    whatsappCountryCode: "+31",
    whatsappNumber: "",
    
    // Discord Info
    discordName: "",
    
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
  });

  useEffect(() => {
    const verifyInvitation = async () => {
      if (!token) {
        toast({
          title: "Invalid Link",
          description: "No invitation token found. Please check your email link.",
          variant: "destructive"
        });
        setIsVerifying(false);
        return;
      }

      try {
        const response = await sellersApi.verifyToken(token);
        setEmail(response.data.email);
        setIsVerifying(false);
      } catch (error: any) {
        console.error('Error verifying token:', error);
        toast({
          title: "Invalid or Expired Link",
          description: error?.message || "This invitation link is invalid or has expired.",
          variant: "destructive"
        });
        setIsVerifying(false);
      }
    };

    verifyInvitation();
  }, [token, toast]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-select country code when country is selected
    if (field === 'country' && typeof value === 'string') {
      const countryCode = getCountryCodeByName(value);
      if (countryCode) {
        setFormData(prev => ({ ...prev, whatsappCountryCode: countryCode }));
      }
    }
    
    if (field === 'iban') {
      setIbanError(false);
    }
  };

  const handleWhatsAppNumberChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    handleInputChange("whatsappNumber", numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: "Error",
        description: "Missing invitation token.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate required fields
    if (!formData.whatsappNumber || formData.whatsappNumber.trim() === "") {
      toast({
        title: "Validation Error",
        description: "WhatsApp number is required.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const registrationData: any = {
        token,
        owner_name: formData.ownerName,
        password: formData.password,
        contact_person: formData.contactPerson,
        website: formData.website,
        tin_number: formData.tinNumber,
        country: formData.country,
        business_description: formData.businessDescription,
        seller_type: formData.businessType.toLowerCase() as "private" | "b2b",
        vat_number: formData.vatNumber,
        vat_rate: parseFloat(formData.vatRate) || 0,
        vat_registered: formData.vatRegistered,
        whatsapp_number: formData.whatsappCountryCode && formData.whatsappNumber 
          ? `${formData.whatsappCountryCode}${formData.whatsappNumber}` 
          : ""
      };

      // Add required discord name
      registrationData.discord_name = formData.discordName;

      // Add bank details if provided
      if (formData.accountHolder.trim()) {
        registrationData.account_holder = formData.accountHolder;
      }
      if (formData.iban.trim()) {
        registrationData.iban = formData.iban;
      }
      if (formData.bankName.trim()) {
        registrationData.bank_name = formData.bankName;
      }
      if (formData.preferredShipmentCode) {
        registrationData.shipment_method_code = formData.preferredShipmentCode;
      }

      await sellersApi.completeRegistration(registrationData);
      
      toast({
        title: "Registration Completed",
        description: "Your seller registration has been submitted successfully. You'll be contacted once it's reviewed.",
      });
      
      // Redirect to a success page or homepage
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error: any) {
      console.error('Error completing registration:', error);
      
      if (error?.errors) {
        const errorMessages = Object.values(error.errors).flat();
        const errorMessage = errorMessages.join(', ');
        
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
          description: error?.message || "Failed to complete registration. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This invitation link is invalid or has expired. Please contact support for assistance.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Return to Homepage
            </Button>
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
            <div>
              <h1 className="text-2xl font-bold text-foreground">Complete Your Seller Registration</h1>
              <p className="text-sm text-muted-foreground">Registered email: {email}</p>
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
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Enter password"
                      className="pl-10 pr-10 transition-all duration-200 focus:scale-[1.02]"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
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
                      if (value === "Private") {
                        handleInputChange("vatNumber", "");
                        handleInputChange("vatRate", "");
                        handleInputChange("vatRegistered", false);
                      }
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
                <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
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
                            ? `${countryCodes.find((country) => country.code === formData.whatsappCountryCode)?.code} ${countryCodes.find((country) => country.code === formData.whatsappCountryCode)?.country}`
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
                        required
                        className="pl-10 transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">WhatsApp number only</p>
              </div>

              {/* Discord Name Field */}
              <div className="space-y-2">
                <Label htmlFor="discordName">Discord Name *</Label>
                <Input
                  id="discordName"
                  value={formData.discordName}
                  onChange={(e) => handleInputChange("discordName", e.target.value)}
                  placeholder="Enter Discord username or number"
                  required
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
                <p className="text-xs text-muted-foreground">Discord username or number for communication</p>
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
          <div className="flex items-center justify-end pt-6">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-32"
            >
              {isSubmitting ? "Submitting..." : "Complete Registration"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

