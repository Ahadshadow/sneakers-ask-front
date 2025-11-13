import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Mail, Globe, UserPlus, Phone, Check, ChevronsUpDown, Truck } from "lucide-react";
import { toast } from "sonner";
import { sellersApi } from "@/lib/api/sellers";
import { sendcloudApi } from "@/lib/api/sendcloud";
import { useQuery } from "@tanstack/react-query";
import { COUNTRIES } from "@/data/countries";
import { COUNTRY_CODES, getCountryCodeByName } from "@/data/countryCodes";
import { cn } from "@/lib/utils";

interface QuickAddSellerModalProps {
  onSellerCreated?: () => void;
  children?: React.ReactNode;
}

const businessTypes = ["Private", "B2B"];

const countryCodes = COUNTRY_CODES;

export function QuickAddSellerModal({ onSellerCreated, children }: QuickAddSellerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    enabled: isOpen, // Only fetch when modal is open
  });

  const [formData, setFormData] = useState({
    storeName: "",
    ownerName: "",
    email: "",
    contactPerson: "",
    website: "",
    businessType: "",
    country: "",
    businessDescription: "",
    tinNumber: "",
    vatNumber: "",
    vatRate: "",
    vatRegistered: false,
    accountHolder: "",
    iban: "",
    bankName: "",
    preferredShipmentCode: "",
    whatsappCountryCode: "+31",
    whatsappNumber: "",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-select country code when country is selected
    if (field === 'country' && typeof value === 'string') {
      const countryCode = getCountryCodeByName(value);
      if (countryCode) {
        setFormData(prev => ({ ...prev, whatsappCountryCode: countryCode }));
      }
    }

    if (field === "iban") {
      setIbanError(false);
    }
  };

  const handleWhatsAppNumberChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    handleInputChange("whatsappNumber", numericValue);
  };

  const resetForm = () => {
    setFormData({
      storeName: "",
      ownerName: "",
      email: "",
      contactPerson: "",
      website: "",
      businessType: "",
      country: "",
      businessDescription: "",
      tinNumber: "",
      vatNumber: "",
      vatRate: "",
      vatRegistered: false,
      accountHolder: "",
      iban: "",
      bankName: "",
      preferredShipmentCode: "",
      whatsappCountryCode: "+31",
      whatsappNumber: "",
    });
    setIbanError(false);
    setWhatsappCountryOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
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
        status: "active" as "active",
        vat_number: formData.vatNumber,
        vat_rate: parseFloat(formData.vatRate) || 0,
        vat_registered: formData.vatRegistered,
        join_date: new Date().toISOString().split("T")[0],
        whatsapp_number: formData.whatsappCountryCode && formData.whatsappNumber 
          ? `${formData.whatsappCountryCode}${formData.whatsappNumber}` 
          : "",
      };

      // Add optional bank details
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

      await sellersApi.createSeller(apiData);

      toast.success(
        `Seller ${formData.storeName || formData.ownerName} created successfully!`
      );

      resetForm();
      setIsOpen(false);

      // Callback to refresh seller list
      if (onSellerCreated) {
        onSellerCreated();
      }
    } catch (error: any) {
      console.error("Error creating seller:", error);

      if (error?.errors) {
        const errorMessages = Object.values(error.errors).flat();
        const errorMessage = errorMessages.join(", ");

        if (error.errors.iban || errorMessage.toLowerCase().includes("iban")) {
          setIbanError(true);
        }

        toast.error(errorMessage);
      } else {
        toast.error(
          error?.message || "Failed to create seller. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Seller
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Quick Add Seller
          </DialogTitle>
          <DialogDescription>
            Create a new seller quickly without leaving this page
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Business Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quick-storeName">
                    Store Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quick-storeName"
                    value={formData.storeName}
                    onChange={(e) =>
                      handleInputChange("storeName", e.target.value)
                    }
                    placeholder="Enter store name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quick-ownerName">
                    Owner Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quick-ownerName"
                    value={formData.ownerName}
                    onChange={(e) =>
                      handleInputChange("ownerName", e.target.value)
                    }
                    placeholder="Enter owner name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quick-email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="quick-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="email@example.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quick-contactPerson">Contact Person</Label>
                  <Input
                    id="quick-contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      handleInputChange("contactPerson", e.target.value)
                    }
                    placeholder="Contact person name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quick-website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="quick-website"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://example.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="quick-whatsappNumber">WhatsApp Number</Label>
                  <div className="flex gap-2">
                    <div className="w-40">
                      <Popover open={whatsappCountryOpen} onOpenChange={setWhatsappCountryOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={whatsappCountryOpen}
                            className="w-full justify-between"
                            type="button"
                          >
                            {formData.whatsappCountryCode
                              ? `${countryCodes.find((country) => country.code === formData.whatsappCountryCode)?.code} ${countryCodes.find((country) => country.code === formData.whatsappCountryCode)?.country}`
                              : "Select code"}
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
                          id="quick-whatsappNumber"
                          value={formData.whatsappNumber}
                          onChange={(e) => handleWhatsAppNumberChange(e.target.value)}
                          placeholder="1234567890"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">WhatsApp number only</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quick-businessType">
                    Business Type <span className="text-red-500">*</span>
                  </Label>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quick-country">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleInputChange("country", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Conditional Tax Fields */}
              {formData.businessType === "B2B" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quick-vatNumber">VAT Number</Label>
                    <Input
                      id="quick-vatNumber"
                      value={formData.vatNumber}
                      onChange={(e) =>
                        handleInputChange("vatNumber", e.target.value)
                      }
                      placeholder="Enter VAT number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quick-vatRate">VAT Rate (%)</Label>
                    <Input
                      id="quick-vatRate"
                      type="number"
                      step="0.01"
                      value={formData.vatRate}
                      onChange={(e) => handleInputChange("vatRate", e.target.value)}
                      placeholder="Enter VAT rate"
                    />
                  </div>
                  <div className="flex items-center space-x-2 col-span-2">
                    <Checkbox
                      id="quick-vatRegistered"
                      checked={formData.vatRegistered}
                      onCheckedChange={(checked) =>
                        handleInputChange("vatRegistered", checked)
                      }
                    />
                    <Label htmlFor="quick-vatRegistered">VAT Registered</Label>
                  </div>
                </div>
              )}

              {formData.businessType === "Private" && (
                <div className="space-y-2">
                  <Label htmlFor="quick-tinNumber">TIN Number</Label>
                  <Input
                    id="quick-tinNumber"
                    value={formData.tinNumber}
                    onChange={(e) => handleInputChange("tinNumber", e.target.value)}
                    placeholder="Enter TIN number"
                  />
                </div>
              )}
            </div>

            {/* Bank Details */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Bank Details (Optional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quick-accountHolder">Account Holder</Label>
                  <Input
                    id="quick-accountHolder"
                    value={formData.accountHolder}
                    onChange={(e) =>
                      handleInputChange("accountHolder", e.target.value)
                    }
                    placeholder="Account holder name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quick-iban">IBAN</Label>
                  <Input
                    id="quick-iban"
                    value={formData.iban}
                    onChange={(e) => handleInputChange("iban", e.target.value)}
                    placeholder="Enter IBAN"
                    className={cn(
                      ibanError &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50"
                    )}
                  />
                  {ibanError && (
                    <p className="text-sm text-red-500">
                      Please enter a valid IBAN number
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quick-bankName">Bank Name</Label>
                  <Input
                    id="quick-bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                    placeholder="Enter bank name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quick-preferredShipmentCode">Preferred Shipment Option</Label>
                  {isLoadingShipping ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading shipping options...
                    </div>
                  ) : shippingOptions && shippingOptions.length > 0 ? (
                    <Select
                      value={formData.preferredShipmentCode}
                      onValueChange={(value) =>
                        handleInputChange("preferredShipmentCode", value)
                      }
                    >
                      <SelectTrigger>
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
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsOpen(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Seller"
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

