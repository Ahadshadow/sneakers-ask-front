import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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

const businessTypes = [
  "Private",
  "B2B"
];

const countryCodes = [
  { code: "+1", country: "US/Canada" },
  { code: "+44", country: "UK" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+31", country: "Netherlands" },
  { code: "+32", country: "Belgium" },
  { code: "+41", country: "Switzerland" },
  { code: "+43", country: "Austria" },
  { code: "+45", country: "Denmark" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+358", country: "Finland" },
  { code: "+420", country: "Czech Republic" }, { code: "+36", country: "Hungary" }, { code: "+40", country: "Romania" }, { code: "+30", country: "Greece" }, { code: "+48", country: "Poland" }, { code: "+351", country: "Portugal" },
  { code: "+61", country: "Australia" },
  { code: "+64", country: "New Zealand" },
  { code: "+81", country: "Japan" },
  { code: "+82", country: "South Korea" },
  { code: "+86", country: "China" },
  { code: "+91", country: "India" },
  { code: "+92", country: "Pakistan" },
  { code: "+93", country: "Afghanistan" },
  { code: "+94", country: "Sri Lanka" },
  { code: "+95", country: "Myanmar" },
  { code: "+98", country: "Iran" },
  { code: "+212", country: "Morocco" },
  { code: "+213", country: "Algeria" },
  { code: "+216", country: "Tunisia" },
  { code: "+218", country: "Libya" },
  { code: "+220", country: "Gambia" },
  { code: "+221", country: "Senegal" },
  { code: "+222", country: "Mauritania" },
  { code: "+223", country: "Mali" },
  { code: "+224", country: "Guinea" },
  { code: "+225", country: "Ivory Coast" },
  { code: "+226", country: "Burkina Faso" },
  { code: "+227", country: "Niger" },
  { code: "+228", country: "Togo" },
  { code: "+229", country: "Benin" },
  { code: "+230", country: "Mauritius" },
  { code: "+231", country: "Liberia" },
  { code: "+232", country: "Sierra Leone" },
  { code: "+233", country: "Ghana" },
  { code: "+234", country: "Nigeria" },
  { code: "+235", country: "Chad" },
  { code: "+236", country: "Central African Republic" },
  { code: "+237", country: "Cameroon" },
  { code: "+238", country: "Cape Verde" },
  { code: "+239", country: "São Tomé and Príncipe" },
  { code: "+240", country: "Equatorial Guinea" },
  { code: "+241", country: "Gabon" },
  { code: "+242", country: "Republic of the Congo" },
  { code: "+243", country: "Democratic Republic of the Congo" },
  { code: "+244", country: "Angola" },
  { code: "+245", country: "Guinea-Bissau" },
  { code: "+246", country: "British Indian Ocean Territory" },
  { code: "+248", country: "Seychelles" },
  { code: "+249", country: "Sudan" },
  { code: "+250", country: "Rwanda" },
  { code: "+251", country: "Ethiopia" },
  { code: "+252", country: "Somalia" },
  { code: "+253", country: "Djibouti" },
  { code: "+254", country: "Kenya" },
  { code: "+255", country: "Tanzania" },
  { code: "+256", country: "Uganda" },
  { code: "+257", country: "Burundi" },
  { code: "+258", country: "Mozambique" },
  { code: "+260", country: "Zambia" },
  { code: "+261", country: "Madagascar" },
  { code: "+262", country: "Réunion" },
  { code: "+263", country: "Zimbabwe" },
  { code: "+264", country: "Namibia" },
  { code: "+265", country: "Malawi" },
  { code: "+266", country: "Lesotho" },
  { code: "+267", country: "Botswana" },
  { code: "+268", country: "Swaziland" },
  { code: "+269", country: "Comoros" },
  { code: "+290", country: "Saint Helena" },
  { code: "+291", country: "Eritrea" },
  { code: "+297", country: "Aruba" },
  { code: "+298", country: "Faroe Islands" },
  { code: "+299", country: "Greenland" },
  { code: "+350", country: "Gibraltar" },
  { code: "+351", country: "Portugal" },
  { code: "+352", country: "Luxembourg" },
  { code: "+353", country: "Ireland" },
  { code: "+354", country: "Iceland" },
  { code: "+355", country: "Albania" },
  { code: "+356", country: "Malta" },
  { code: "+357", country: "Cyprus" },
  { code: "+358", country: "Finland" },
  { code: "+359", country: "Bulgaria" },
  { code: "+370", country: "Lithuania" },
  { code: "+371", country: "Latvia" },
  { code: "+372", country: "Estonia" },
  { code: "+373", country: "Moldova" },
  { code: "+374", country: "Armenia" },
  { code: "+375", country: "Belarus" },
  { code: "+376", country: "Andorra" },
  { code: "+377", country: "Monaco" },
  { code: "+378", country: "San Marino" },
  { code: "+380", country: "Ukraine" },
  { code: "+381", country: "Serbia" },
  { code: "+382", country: "Montenegro" },
  { code: "+383", country: "Kosovo" },
  { code: "+385", country: "Croatia" },
  { code: "+386", country: "Slovenia" },
  { code: "+387", country: "Bosnia and Herzegovina" },
  { code: "+389", country: "North Macedonia" },
  { code: "+420", country: "Czech Republic" },
  { code: "+421", country: "Slovakia" },
  { code: "+423", country: "Liechtenstein" },
  { code: "+500", country: "Falkland Islands" },
  { code: "+501", country: "Belize" },
  { code: "+502", country: "Guatemala" },
  { code: "+503", country: "El Salvador" },
  { code: "+504", country: "Honduras" },
  { code: "+505", country: "Nicaragua" },
  { code: "+506", country: "Costa Rica" },
  { code: "+507", country: "Panama" },
  { code: "+508", country: "Saint Pierre and Miquelon" },
  { code: "+509", country: "Haiti" },
  { code: "+590", country: "Guadeloupe" },
  { code: "+591", country: "Bolivia" },
  { code: "+592", country: "Guyana" },
  { code: "+593", country: "Ecuador" },
  { code: "+594", country: "French Guiana" },
  { code: "+595", country: "Paraguay" },
  { code: "+596", country: "Martinique" },
  { code: "+597", country: "Suriname" },
  { code: "+598", country: "Uruguay" },
  { code: "+599", country: "Netherlands Antilles" },
  { code: "+670", country: "East Timor" },
  { code: "+672", country: "Australian External Territories" },
  { code: "+673", country: "Brunei" },
  { code: "+674", country: "Nauru" },
  { code: "+675", country: "Papua New Guinea" },
  { code: "+676", country: "Tonga" },
  { code: "+677", country: "Solomon Islands" },
  { code: "+678", country: "Vanuatu" },
  { code: "+679", country: "Fiji" },
  { code: "+680", country: "Palau" },
  { code: "+681", country: "Wallis and Futuna" },
  { code: "+682", country: "Cook Islands" },
  { code: "+683", country: "Niue" },
  { code: "+684", country: "American Samoa" },
  { code: "+685", country: "Samoa" },
  { code: "+686", country: "Kiribati" },
  { code: "+687", country: "New Caledonia" },
  { code: "+688", country: "Tuvalu" },
  { code: "+689", country: "French Polynesia" },
  { code: "+690", country: "Tokelau" },
  { code: "+691", country: "Micronesia" },
  { code: "+692", country: "Marshall Islands" },
  { code: "+850", country: "North Korea" },
  { code: "+852", country: "Hong Kong" },
  { code: "+853", country: "Macau" },
  { code: "+855", country: "Cambodia" },
  { code: "+856", country: "Laos" },
  { code: "+880", country: "Bangladesh" },
  { code: "+886", country: "Taiwan" },
  { code: "+960", country: "Maldives" },
  { code: "+961", country: "Lebanon" },
  { code: "+962", country: "Jordan" },
  { code: "+963", country: "Syria" },
  { code: "+964", country: "Iraq" },
  { code: "+965", country: "Kuwait" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+967", country: "Yemen" },
  { code: "+968", country: "Oman" },
  { code: "+970", country: "Palestine" },
  { code: "+971", country: "United Arab Emirates" },
  { code: "+972", country: "Israel" },
  { code: "+973", country: "Bahrain" },
  { code: "+974", country: "Qatar" },
  { code: "+975", country: "Bhutan" },
  { code: "+976", country: "Mongolia" },
  { code: "+977", country: "Nepal" },
  { code: "+992", country: "Tajikistan" },
  { code: "+993", country: "Turkmenistan" },
  { code: "+994", country: "Azerbaijan" },
  { code: "+995", country: "Georgia" },
  { code: "+996", country: "Kyrgyzstan" },
  { code: "+998", country: "Uzbekistan" }
];

// Helper function to extract country code from WhatsApp number
const extractCountryCodeFromNumber = (whatsappNumber: string): { countryCode: string; number: string } => {
  if (!whatsappNumber) {
    return { countryCode: "+31", number: "" }; // Default to Netherlands
  }

  // Sort country codes by length (longest first) to match multi-digit codes first
  const sortedCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);

  for (const country of sortedCodes) {
    if (whatsappNumber.startsWith(country.code)) {
      return {
        countryCode: country.code,
        number: whatsappNumber.substring(country.code.length)
      };
    }
  }

  // If no match found, try to extract any leading + and digits
  const match = whatsappNumber.match(/^(\+\d+)(.*)$/);
  if (match) {
    return { countryCode: match[1], number: match[2] };
  }

  // Default fallback
  return { countryCode: "+31", number: whatsappNumber };
};

export default function EditSeller() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    // Check if seller data is passed from navigation state
    const sellerData = location.state?.sellerData;

    console.log("sellerData", sellerData);
    
    if (sellerData) {
      // Use data from navigation state (fast)
      
      // Extract WhatsApp country code and number
      const whatsappData = extractCountryCodeFromNumber(sellerData.whatsapp_number || "");
      
      setFormData({
        storeName: sellerData.store_name || "",
        ownerName: sellerData.owner_name || "",
        email: sellerData.email || "",
        contactPerson: sellerData.contact_person || "",
        website: sellerData.website || "",
        businessType: sellerData.seller_type === "private" ? "Private" : "B2B",
        country: sellerData.country || "",
        businessDescription: sellerData.business_description || "",
        tinNumber: sellerData.tin_number || "",
        vatNumber: sellerData.vat_number || "",
        vatRate: sellerData.vat_rate || "",
        vatRegistered: sellerData.vat_registered || false,
        accountHolder: sellerData.account_holder || "",
        iban: sellerData.iban || "",
        bankName: sellerData.bank_name || "",
        preferredShipmentCode: sellerData.shipment_method_code || "",
        status: sellerData.status || "pending",
        whatsappCountryCode: whatsappData.countryCode,
        whatsappNumber: whatsappData.number
      });
      console.log('Form data set with WhatsApp:', whatsappData);
      setIsLoading(false);
    } else {
      // Fallback: Load seller data from API
      const loadSellerData = async () => {
        if (!id) {
          setIsLoading(false);
          return;
        }
        
        try {
          setIsLoading(true);
          const response = await sellersApi.getSeller(Number(id));

          
          const seller = response.data;
          
          // Extract WhatsApp country code and number
          const whatsappData = extractCountryCodeFromNumber(seller.whatsapp_number || "");
          
          setFormData({
            storeName: seller.store_name || "",
            ownerName: seller.owner_name || "",
            email: seller.email || "",
            contactPerson: seller.contact_person || "",
            website: seller.website || "",
            businessType: seller.seller_type === "private" ? "Private" : "B2B",
            country: seller.country || "",
            businessDescription: seller.business_description || "",
            tinNumber: seller.tin_number || "",
            vatNumber: seller.vat_number || "",
            vatRate: seller.vat_rate || "",
            vatRegistered: seller.vat_registered || false,
            accountHolder: seller.account_holder || "",
            iban: seller.iban || "",
            bankName: seller.bank_name || "",
            preferredShipmentCode: seller.shipment_method_code || "",
            status: seller.status || "pending",
            whatsappCountryCode: whatsappData.countryCode,
            whatsappNumber: whatsappData.number
          });
          console.log('Form data set with WhatsApp from API:', whatsappData);
        } catch (error) {
          console.error('Error loading seller:', error);
          toast({
            title: "Error",
            description: "Failed to load seller data.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };

      loadSellerData();
    }
  }, [id, location.state, toast]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
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
        description: "Please log in to update seller.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
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
      const result = await sellersApi.updateSeller(Number(id), apiData);
      
      // Invalidate sellers cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      queryClient.invalidateQueries({ queryKey: ['seller', id] });
      
      toast({
        title: "Seller Updated Successfully",
        description: `${formData.storeName || formData.ownerName} details have been updated.`,
      });
      
      setHasChanges(false);
      navigate("/sellers");
    } catch (error: any) {
      console.error('Error updating seller:', error);
      console.log('Error structure:', {
        hasErrors: !!error?.errors,
        errors: error?.errors,
        message: error?.message,
        fullError: error
      });
      
      // Handle validation errors from backend
      if (error?.errors) {
        const errorMessages = Object.values(error.errors).flat();
        const errorMessage = errorMessages.join(', ');
        
        console.log('Validation errors found:', errorMessages);
        
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
        console.log('No validation errors, showing generic error');
        toast({
          title: "Error",
          description: error?.message || "Failed to update seller. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Invalid Seller ID</h2>
            <p className="text-muted-foreground mb-4">Please provide a valid seller ID.</p>
            <Button onClick={() => navigate("/sellers")}>Back to Sellers</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
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
                <h1 className="text-2xl font-bold text-foreground">Edit Seller Details</h1>
                <p className="text-sm text-muted-foreground">Update seller information and settings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Loading Business Information */}
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
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-10 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-10 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-10 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-10 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading Bank Details */}
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
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-10 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-10 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading Actions */}
            <div className="flex items-center justify-between pt-6">
              <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
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
              onClick={() => navigate("/sellers")}
              className="hover-scale transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sellers
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
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select 
                    value={formData.businessType} 
                    onValueChange={(value) => {
                      handleInputChange("businessType", value);
                      // Clear business name and tax numbers if switching to Private
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              disabled={isSubmitting || !hasChanges}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-32"
            >
              {isSubmitting ? "Updating Seller..." : "Update Seller"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}