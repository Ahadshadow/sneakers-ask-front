import { useState, useEffect } from "react";
import { 
  Store, 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  Save,
  Globe,
  Phone,
  Truck,
  CreditCard,
  Building,
  Loader2,
  Check,
  ChevronsUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { OptimizedDashboardHeader } from "@/components/dashboard/OptimizedDashboardHeader";
import { sellersApi } from "@/lib/api/sellers";
import { sendcloudApi } from "@/lib/api/sendcloud";
import { useQuery } from "@tanstack/react-query";
import { COUNTRIES } from "@/data/countries";
import { COUNTRY_CODES, extractCountryCodeFromNumber, getCountryCodeByName } from "@/data/countryCodes";
import { cn } from "@/lib/utils";

const businessTypes = ["Private", "B2B"];

export default function SellerProfile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState("profile");
  const [whatsappCountryOpen, setWhatsappCountryOpen] = useState(false);
  
  // Fetch shipping options
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
  
  // Password fields
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Seller profile data
  const [sellerData, setSellerData] = useState({
    storeName: "",
    ownerName: "",
    contactPerson: "",
    email: "",
    website: "",
    whatsappCountryCode: "+31",
    whatsappNumber: "",
    discordName: "",
    preferredShipmentCode: "",
    businessType: "Private",
    tinNumber: "",
    vatNumber: "",
    vatRate: "",
    vatRegistered: false,
    country: "",
    description: "",
    // Bank details
    accountHolder: "",
    iban: "",
    bankName: ""
  });

  // Load seller profile on every render/mount
  useEffect(() => {
    const loadSellerProfile = async () => {
      setIsLoading(true);
      try {
        const response = await sellersApi.getSellerProfile();
        const profile = response.data;
        
        // Extract WhatsApp country code and number using helper function
        const whatsapp = profile.whatsapp_number || "";
        const { countryCode, number } = extractCountryCodeFromNumber(whatsapp);
        
        setSellerData({
          storeName: profile.store_name || "",
          ownerName: profile.owner_name || "",
          contactPerson: profile.contact_person || "",
          email: profile.email || "",
          website: profile.website || "",
          whatsappCountryCode: countryCode,
          whatsappNumber: number,
          discordName: profile.discord_name || "",
          preferredShipmentCode: profile.shipment_method_code || "",
          businessType: profile.seller_type === "b2b" ? "B2B" : "Private",
          tinNumber: profile.tin_number || "",
          vatNumber: profile.vat_number || "",
          vatRate: profile.vat_rate ? profile.vat_rate.toString() : "",
          vatRegistered: profile.vat_registered || false,
          country: profile.country || "",
          description: profile.business_description || "",
          accountHolder: profile.account_holder || "",
          iban: profile.iban || "",
          bankName: profile.bank_name || ""
        });
      } catch (error: any) {
        console.error("Failed to load seller profile:", error);
        toast({
          title: "Error",
          description: error?.message || "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSellerProfile();
  }, []); // Empty dependency array - fetch on every mount

  const handleSellerInputChange = (field: string, value: string | number | boolean) => {
    setSellerData(prev => ({ ...prev, [field]: value }));
    
    // Auto-select country code when country is selected
    if (field === 'country' && typeof value === 'string') {
      const countryCode = getCountryCodeByName(value);
      if (countryCode) {
        setSellerData(prev => ({ ...prev, whatsappCountryCode: countryCode }));
      }
    }
  };

  const handleWhatsAppNumberChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    handleSellerInputChange("whatsappNumber", numericValue);
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    // Validate required fields
    if (!sellerData.whatsappNumber || sellerData.whatsappNumber.trim() === "") {
      toast({
        title: "Validation Error",
        description: "WhatsApp number is required.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Combine WhatsApp country code and number
      const whatsappNumber = sellerData.whatsappCountryCode && sellerData.whatsappNumber
        ? `${sellerData.whatsappCountryCode}${sellerData.whatsappNumber}`
        : sellerData.whatsappNumber;

      const updateData = {
        owner_name: sellerData.ownerName,
        email: sellerData.email,
        whatsapp_number: whatsappNumber || undefined,
        discord_name: sellerData.discordName || undefined,
        contact_person: sellerData.contactPerson || undefined,
        website: sellerData.website || undefined,
        tin_number: sellerData.tinNumber || undefined,
        country: sellerData.country || undefined,
        business_description: sellerData.description || undefined,
        vat_number: sellerData.vatNumber || undefined,
        vat_rate: sellerData.vatRate ? parseFloat(sellerData.vatRate) : undefined,
        vat_registered: sellerData.vatRegistered,
        account_holder: sellerData.accountHolder || undefined,
        iban: sellerData.iban || undefined,
        bank_name: sellerData.bankName || undefined,
        shipment_method_code: sellerData.preferredShipmentCode || undefined
      };

      // Remove undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      await sellersApi.updateSellerProfile(cleanedData);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
      
      setIsEditing(false);
      
      // Reload profile data to get latest from server
      const response = await sellersApi.getSellerProfile();
      const profile = response.data;
      
      // Update local state with fresh data
      const whatsappReload = profile.whatsapp_number || "";
      const { countryCode: countryCodeReload, number: whatsappNumberReload } = extractCountryCodeFromNumber(whatsappReload);
      
      setSellerData({
        storeName: profile.store_name || "",
        ownerName: profile.owner_name || "",
        contactPerson: profile.contact_person || "",
        email: profile.email || "",
        website: profile.website || "",
        whatsappCountryCode: countryCodeReload,
        whatsappNumber: whatsappNumberReload,
        discordName: profile.discord_name || "",
        preferredShipmentCode: profile.shipment_method_code || "",
        businessType: profile.seller_type === "b2b" ? "B2B" : "Private",
        tinNumber: profile.tin_number || "",
        vatNumber: profile.vat_number || "",
        vatRate: profile.vat_rate ? profile.vat_rate.toString() : "",
        vatRegistered: profile.vat_registered || false,
        country: profile.country || "",
        description: profile.business_description || "",
        accountHolder: profile.account_holder || "",
        iban: profile.iban || "",
        bankName: profile.bank_name || ""
      });
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      
      // Handle validation errors
      if (error.errors) {
        const errorMessages = Object.values(error.errors).flat().join(", ");
        toast({
          title: "Validation Error",
          description: errorMessages || "Please check your input and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error?.message || "Failed to update profile. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation password don't match.",
        variant: "destructive"
      });
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all password fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      await sellersApi.updateSellerPassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      console.error("Failed to update password:", error);
      
      // Handle validation errors
      if (error.errors) {
        const errorMessages = Object.values(error.errors).flat().join(", ");
        toast({
          title: "Validation Error",
          description: errorMessages || "Please check your input and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error?.message || "Failed to update password. Please check your current password and try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar 
          currentSection={currentSection} 
          onSectionChange={setCurrentSection} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <OptimizedDashboardHeader currentSection="profile" />
          
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6 space-y-6 animate-fade-in">
              
              {/* Loading State */}
              {isLoading && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-muted-foreground">Loading profile...</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Profile Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                        {sellerData.ownerName?.[0] || "S"}
                        {sellerData.ownerName?.split(" ")[1]?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {sellerData.ownerName || "Seller"}
                      </h2>
                      <Badge variant="secondary">
                        <Store className="h-3 w-3 mr-1" />
                        Seller
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs Content */}
              <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="general" className="rounded-lg transition-all duration-300">
                    Business Info
                  </TabsTrigger>
                  <TabsTrigger value="security" className="rounded-lg transition-all duration-300">
                    Security
                  </TabsTrigger>
                </TabsList>

                {/* General/Business Settings */}
                <TabsContent value="general" className="space-y-6">
                  {/* Business Information Card */}
                  <Card className="border rounded-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Store className="h-5 w-5" />
                        Business Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="ownerName">Owner Name *</Label>
                          <Input
                            id="ownerName"
                            value={sellerData.ownerName}
                            onChange={(e) => handleSellerInputChange("ownerName", e.target.value)}
                            disabled={!isEditing || isLoading}
                            placeholder="Enter owner name"
                            className="h-11 transition-all duration-300 disabled:opacity-60"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contactPerson">Contact Person</Label>
                          <Input
                            id="contactPerson"
                            value={sellerData.contactPerson}
                            onChange={(e) => handleSellerInputChange("contactPerson", e.target.value)}
                            disabled={!isEditing || isLoading}
                            placeholder="Enter contact person"
                            className="h-11 transition-all duration-300 disabled:opacity-60"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sellerEmail">Email Address *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="sellerEmail"
                              type="email"
                              value={sellerData.email}
                              onChange={(e) => handleSellerInputChange("email", e.target.value)}
                              disabled={!isEditing || isLoading}
                              placeholder="Enter email address"
                              className="pl-10 h-11 transition-all duration-300 disabled:opacity-60"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="website"
                              value={sellerData.website}
                              onChange={(e) => handleSellerInputChange("website", e.target.value)}
                              disabled={!isEditing || isLoading}
                              placeholder="https://example.com"
                              className="pl-10 h-11 transition-all duration-300 disabled:opacity-60"
                            />
                          </div>
                        </div>

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
                                    disabled={!isEditing || isLoading}
                                    className="w-full justify-between transition-all duration-200"
                                  >
                                    {sellerData.whatsappCountryCode
                                      ? `${COUNTRY_CODES.find((country) => country.code === sellerData.whatsappCountryCode)?.code} ${COUNTRY_CODES.find((country) => country.code === sellerData.whatsappCountryCode)?.country || ''}`
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
                                        {COUNTRY_CODES.map((country) => (
                                          <CommandItem
                                            key={country.code}
                                            value={`${country.code} ${country.country}`}
                                            onSelect={() => {
                                              handleSellerInputChange("whatsappCountryCode", country.code);
                                              setWhatsappCountryOpen(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                sellerData.whatsappCountryCode === country.code ? "opacity-100" : "opacity-0"
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
                                  value={sellerData.whatsappNumber}
                                  onChange={(e) => handleWhatsAppNumberChange(e.target.value)}
                                  disabled={!isEditing || isLoading}
                                  placeholder="1234567890"
                                  required
                                  className="pl-10 h-11 transition-all duration-200 disabled:opacity-60"
                                />
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">WhatsApp number only</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="discordName">Discord Name *</Label>
                          <Input
                            id="discordName"
                            value={sellerData.discordName}
                            onChange={(e) => handleSellerInputChange("discordName", e.target.value)}
                            disabled={!isEditing || isLoading}
                            placeholder="Enter Discord username"
                            className="h-11 transition-all duration-300 disabled:opacity-60"
                          />
                          <p className="text-xs text-muted-foreground">Discord username or number for communication</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="preferredShipmentCode">Preferred Shipment Option</Label>
                          {isLoadingShipping ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading shipping options...
                            </div>
                          ) : shippingOptions && shippingOptions.length > 0 ? (
                            <Select
                              value={sellerData.preferredShipmentCode}
                              onValueChange={(value) => handleSellerInputChange("preferredShipmentCode", value)}
                              disabled={!isEditing || isLoading}
                            >
                              <SelectTrigger className="h-11 transition-all duration-200 disabled:opacity-60">
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
                          <Label htmlFor="businessType">Business Type *</Label>
                          <Select 
                            value={sellerData.businessType} 
                            onValueChange={(value) => {
                              handleSellerInputChange("businessType", value);
                              // Clear VAT fields if switching to Private
                              if (value === "Private") {
                                handleSellerInputChange("vatNumber", "");
                                handleSellerInputChange("vatRate", "");
                                handleSellerInputChange("vatRegistered", false);
                              }
                              // Clear TIN if switching to B2B
                              if (value === "B2B") {
                                handleSellerInputChange("tinNumber", "");
                              }
                            }}
                            disabled={!isEditing || isLoading}
                          >
                            <SelectTrigger className="h-11 transition-all duration-200 disabled:opacity-60">
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
                        {sellerData.businessType === "B2B" && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="vatNumber">VAT Number</Label>
                              <Input
                                id="vatNumber"
                                value={sellerData.vatNumber}
                                onChange={(e) => handleSellerInputChange("vatNumber", e.target.value)}
                                disabled={!isEditing || isLoading}
                                placeholder="Enter VAT number"
                                className="h-11 transition-all duration-200 disabled:opacity-60"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="vatRate">VAT Rate (%)</Label>
                              <Input
                                id="vatRate"
                                type="number"
                                step="0.01"
                                value={sellerData.vatRate}
                                onChange={(e) => handleSellerInputChange("vatRate", e.target.value)}
                                disabled={!isEditing || isLoading}
                                placeholder="Enter VAT rate"
                                className="h-11 transition-all duration-200 disabled:opacity-60"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="vatRegistered"
                                checked={sellerData.vatRegistered}
                                onCheckedChange={(checked) => handleSellerInputChange("vatRegistered", checked)}
                                disabled={!isEditing || isLoading}
                              />
                              <Label htmlFor="vatRegistered">VAT Registered</Label>
                            </div>
                          </>
                        )}
                        
                        {sellerData.businessType === "Private" && (
                          <div className="space-y-2">
                            <Label htmlFor="tinNumber">TIN Number</Label>
                            <Input
                              id="tinNumber"
                              value={sellerData.tinNumber}
                              onChange={(e) => handleSellerInputChange("tinNumber", e.target.value)}
                              disabled={!isEditing || isLoading}
                              placeholder="Enter TIN number"
                              className="h-11 transition-all duration-200 disabled:opacity-60"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="country">Country *</Label>
                          <Select 
                            value={sellerData.country} 
                            onValueChange={(value) => handleSellerInputChange("country", value)}
                            disabled={!isEditing || isLoading}
                          >
                            <SelectTrigger className="h-11 transition-all duration-200 disabled:opacity-60">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRIES.map(country => (
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
                          value={sellerData.description}
                          onChange={(e) => handleSellerInputChange("description", e.target.value)}
                          disabled={!isEditing || isLoading}
                          placeholder="Describe the business, products, and specialties..."
                          className="transition-all duration-200 disabled:opacity-60"
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bank Details Card */}
                  <Card className="border rounded-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
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
                            value={sellerData.accountHolder}
                            onChange={(e) => handleSellerInputChange("accountHolder", e.target.value)}
                            disabled={!isEditing || isLoading}
                            placeholder="Enter account holder name"
                            className="h-11 transition-all duration-300 disabled:opacity-60"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="iban">IBAN</Label>
                          <Input
                            id="iban"
                            value={sellerData.iban}
                            onChange={(e) => handleSellerInputChange("iban", e.target.value)}
                            disabled={!isEditing || isLoading}
                            placeholder="Enter IBAN"
                            className="h-11 transition-all duration-300 disabled:opacity-60"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            value={sellerData.bankName}
                            onChange={(e) => handleSellerInputChange("bankName", e.target.value)}
                            disabled={!isEditing || isLoading}
                            placeholder="Enter bank name"
                            className="h-11 transition-all duration-300 disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      disabled={!isEditing || isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={!isEditing || isSaving || isLoading}
                      className="min-w-[140px]"
                    >
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Profile
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                  <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <Lock className="h-4 w-4 text-red-600" />
                        </div>
                        Change Password
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 max-w-md">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="currentPassword"
                              type={showPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                              className="pl-10 pr-10 h-11"
                              placeholder="Enter current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="newPassword"
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                              className="pl-10 h-11"
                              placeholder="Enter new password"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                              className="pl-10 h-11"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={handleChangePassword}
                          disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || isSaving}
                          className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 transition-all duration-300"
                        >
                          {isSaving ? "Updating Password..." : "Change Password"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Edit Mode Toggle */}
              <div className="fixed bottom-6 right-6">
                <Button
                  size="lg"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isLoading}
                  className="shadow-lg"
                >
                  {isLoading ? "Loading..." : isEditing ? "Cancel Editing" : "Edit Profile"}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

