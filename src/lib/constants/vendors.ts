export const VENDOR_OPTIONS = [
  { value: "StockX", label: "StockX" },
  { value: "GOAT", label: "GOAT" },
  { value: "LEO", label: "LEO" },
  { value: "AIRPLANE", label: "AIRPLANE" },
  { value: "Mikail", label: "Mikail" },
  { value: "Luca", label: "Luca" },
  { value: "T/M ling", label: "T/M ling" },
  { value: "Bulk ess", label: "Bulk ess" },
];

export const VENDORS_REQUIRING_ORDER_ID = ["StockX", "GOAT"];

// Get all vendor values as an array
export const VENDOR_VALUES = VENDOR_OPTIONS.map(v => v.value);

// Check if a status is a vendor status
export const isVendorStatus = (status: string): boolean => {
  return VENDOR_VALUES.includes(status);
};

// Get vendor values for sidebar navigation (first 4 vendors)
export const VENDOR_SIDEBAR_OPTIONS = VENDOR_OPTIONS.slice(0, 4);


