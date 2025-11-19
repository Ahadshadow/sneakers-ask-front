import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Plus,
  Loader2,
  MessageCircle,
  Truck,
  Eye,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { SendCloudModal } from "@/components/wtb-order/SendCloudModal";
import { ConsignmentSendCloudModal } from "@/components/wtb-order/ConsignmentSendCloudModal";
import { ViewShipmentLabelModal } from "@/components/wtb-order/ViewShipmentLabelModal";
import { VendorAssignmentModal } from "./VendorAssignmentModal";
import { isVendorStatus } from "@/lib/constants/vendors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { Product } from "./types";
import { toast } from "@/components/ui/use-toast";
import { config } from "@/lib/config";
import { VENDOR_OPTIONS } from "@/lib/constants/vendors";

// Date formatting function
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");

    return `${month} ${day}, ${displayHours}:${displayMinutes} ${ampm}`;
  } catch (error) {
    return "-";
  }
};

// Format date to 2-line format: "Aug 15" on first line, "05:00 AM" on second line
const formatDateTwoLine = (dateString: string | undefined): string => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");

    return `${month} ${day}\n${displayHours}:${displayMinutes} ${ampm}`;
  } catch (error) {
    return "-";
  }
};


interface ProductsTableProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  isLoading?: boolean;
  showActions?: boolean;
  onRefetch?: () => void;
  showVendorColumns?: boolean;
}

export function ProductsTable({
  products,
  onAddToCart,
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
  onPageChange: externalOnPageChange,
  totalItems: externalTotalItems,
  itemsPerPage: externalItemsPerPage,
  isLoading = false,
  showActions = true,
  onRefetch,
  showVendorColumns = false,
}: ProductsTableProps) {
  const navigate = useNavigate();
  const [unlockedProducts, setUnlockedProducts] = useState<Set<string>>(
    new Set()
  );
  const [vendorAssignmentModalOpen, setVendorAssignmentModalOpen] = useState(false);
  const [selectedProductForVendor, setSelectedProductForVendor] = useState<Product | null>(null);

  // Use external pagination if provided, otherwise use local pagination
  const currentPage = externalCurrentPage || 1;
  const totalPages = externalTotalPages || Math.ceil(products.length / 10);
  const onPageChange = externalOnPageChange || (() => {});
  const totalItems = externalTotalItems || products.length;
  const itemsPerPage = externalItemsPerPage || 10;

  // If external pagination is provided, show all products (API already paginated)
  // Otherwise, use local pagination
  const paginatedProducts = useMemo(() => {
    if (externalCurrentPage !== undefined) {
      // API pagination - show all products as they're already paginated
      return products;
    } else {
      // Local pagination - slice products
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return products.slice(startIndex, endIndex);
    }
  }, [products, currentPage, itemsPerPage, externalCurrentPage]);
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 border-0 px-2 py-1 rounded-full text-xs";
      case "sourcing":
        return "bg-yellow-100 text-yellow-800 border-0 px-2 py-1 rounded-full text-xs";
      case "stock":
        return "bg-blue-100 text-blue-800 border-0 px-2 py-1 rounded-full text-xs";
      case "consignment":
        return "bg-indigo-100 text-indigo-800 border-0 px-2 py-1 rounded-full text-xs";
      case "fliproom_sale":
        return "bg-blue-100 text-blue-800 border-0 px-2 py-1 rounded-full text-xs";
      case "sneakerask":
        return "bg-gray-100 text-gray-800 border-0 px-2 py-1 rounded-full text-xs";
      case "bought":
        return "bg-purple-100 text-purple-800 border-0 px-2 py-1 rounded-full text-xs";
      case "wtb":
        return "bg-red-500 text-white border-0 px-2 py-1 rounded-full text-xs";
      default:
        return "bg-gray-100 text-gray-800 border-0 px-2 py-1 rounded-full text-xs";
    }
  };

  const handleShopifyOrdersClick = (product: Product) => {
    // Check if product has order URL from API
    if (product.orderUrl) {
      // Use the order URL from API
      window.open(product.orderUrl, "_blank");
      toast({
        title: "Opening Order",
        description: "Redirecting to order details...",
      });
    } else if (product.orders.length > 0 && product.orders[0].orderUrl) {
      // Use the first order's URL if available
      window.open(product.orders[0].orderUrl, "_blank");
      toast({
        title: "Opening Order",
        description: "Redirecting to order details...",
      });
    } else {
      // Fallback to default Shopify admin URL
      const shopifyDomain = "your-store.myshopify.com";
      const url = `https://${shopifyDomain}/admin/orders?query=product_id:${product.shopifyId}`;
      window.open(url, "_blank");
      toast({
        title: "Opening Orders",
        description: "Redirecting to Shopify admin...",
      });
    }
  };

  const handleWTBClick = (product: Product) => {
    navigate(`/wtb-order?productId=${product.id}`);
  };

  const handleUnlockWTB = (productId: string) => {
    setUnlockedProducts((prev) => new Set([...prev, productId]));
  };

  const isWTBLocked = (product: Product) => {
    return (
      (product.status === "fliproom_sale" || product.status === "sneakerask") &&
      !unlockedProducts.has(product.id)
    );
  };

  const handleWhatsAppClick = (whatsappNumber: string) => {
    if (!whatsappNumber) {
      toast({
        title: "No WhatsApp Number",
        description: "This seller doesn't have a WhatsApp number registered.",
        variant: "destructive",
      });
      return;
    }

    // Clean the number (remove any spaces or special characters except +)
    const cleanNumber = whatsappNumber.replace(/[^\d+]/g, "");

    // Open WhatsApp chat
    const whatsappUrl = `https://wa.me/${cleanNumber}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleShipmentLabelCreated = (product: Product, labelData: any) => {
    toast({
      title: "Shipment Created",
      description: `Shipment label created successfully for ${product.name}`,
    });

    // Refresh the products list to show updated shipment status
    if (onRefetch) {
      onRefetch();
    }
  };

  const handleAssignVendorClick = (product: Product) => {
    setSelectedProductForVendor(product);
    setVendorAssignmentModalOpen(true);
  };

  const handleVendorAssignmentSuccess = () => {
    // Refresh the products list to show updated vendor assignment
    if (onRefetch) {
      onRefetch();
    }
  };

  // Format tracking status based on shipping destination
  const getTrackingStatusLabel = (status: string, shippingDestination?: string) => {
    // If destination is not consumer (i.e., warehouse), rename some statuses
    if (shippingDestination && shippingDestination !== "consumer") {
      switch (status) {
        case "Driver en route":
          return "On the way to authentication";
        case "Delivered":
          return "Arrived at authentication";
        default:
          return status;
      }
    }
    return status;
  };

  // Get status badge color based on tracking status
  const getTrackingStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus.includes("delivered") || lowerStatus.includes("arrived")) {
      return "border-green-300 bg-green-50 text-green-700";
    }
    if (lowerStatus.includes("en route") || lowerStatus.includes("on the way") || lowerStatus.includes("driver")) {
      return "border-blue-300 bg-blue-50 text-blue-700";
    }
    if (lowerStatus.includes("ready") || lowerStatus.includes("sorting") || lowerStatus.includes("pickup")) {
      return "border-yellow-300 bg-yellow-50 text-yellow-700";
    }
    if (lowerStatus.includes("failed") || lowerStatus.includes("refused") || lowerStatus.includes("returned") || lowerStatus.includes("invalid")) {
      return "border-red-300 bg-red-50 text-red-700";
    }
    if (lowerStatus.includes("delayed")) {
      return "border-orange-300 bg-orange-50 text-orange-700";
    }
    
    return "border-gray-300 bg-gray-50 text-gray-700";
  };

  // Format tracking status for display
  const formatTrackingStatus = (status: string) => {
    // Convert snake_case to Title Case
    return status
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading products...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[800px]">
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">
                    Order
                  </TableHead>
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">
                    Product
                  </TableHead>
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">
                    Destination
                  </TableHead>
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4 flex items-center gap-1">
                    Date
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </TableHead>
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">
                    Customer
                  </TableHead>
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">
                    Seller
                  </TableHead>
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">
                    Shopify
                  </TableHead>
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">
                    Sale Channel
                  </TableHead>
                  {showVendorColumns && (
                    <>
                      <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">
                        Vendor Price
                      </TableHead>
                      <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">
                        Vendor Order ID
                      </TableHead>
                    </>
                  )}
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4 min-w-[180px]">
                    Tracking Status
                  </TableHead>
                  {showActions && (
                    <TableHead className="font-bold text-gray-400 text-sm py-4 px-4 text-right">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map((product, index) => {
                  // Check if product is stock and has "fear of god" in name (case insensitive)
                  const isFearOfGodStock = product.status === "stock" && 
                    product.name.toLowerCase().includes("fear of god");
                  
                  return (
                  <TableRow
                    key={product.id}
                    className={`border-b transition-colors duration-200 ${
                      product.status === "wtb"
                        ? "bg-gray-100 hover:bg-gray-200"
                        : isFearOfGodStock
                        ? "bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
                        : "hover:bg-muted/10"
                    }`}
                  >
                    {/* Order Column */}
                    <TableCell className="py-3 min-w-[80px]">
                      <span className="text-sm text-foreground font-bold">
                        {product.orderNumber || "-"}
                      </span>
                    </TableCell>

                    {/* Product Column */}
                    <TableCell className="py-3 min-w-[150px]">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground text-sm leading-tight line-clamp-3">
                          {product.name}
                        </p>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>SKU: {product.sku}</span>
                          <span>Size: {product.variant || "N/A"}</span>
                        </div>
                        <p className="text-sm text-foreground font-semibold">
                          {product.price}
                        </p>
                      </div>
                    </TableCell>

                    {/* Destination Column */}
                    <TableCell className="py-3 min-w-[60px]">
                      <span className="text-sm text-foreground">
                        {product.destination || "-"}
                      </span>
                    </TableCell>

                    {/* Date Column */}
                    <TableCell className="py-3 min-w-[120px]">
                      <div className="text-sm text-foreground leading-tight whitespace-pre-line">
                        {formatDateTwoLine(product.processedAt)}
                      </div>
                    </TableCell>

                    {/* Customer Column */}
                    <TableCell className="py-3 min-w-[100px]">
                      <div className="text-sm text-foreground leading-tight min-h-[2.5rem] flex items-center">
                        {product.customerName || "-"}
                      </div>
                    </TableCell>

                    {/* Vendor/Seller Column */}
                    <TableCell className="py-3">
                      <div className="flex items-center justify-between w-full">
                        {/* Show consigner info for consignment items with shipment labels */}
                        {product.status === "consignment" && product.hasShipmentLabel && product.shipmentLabel ? (
                          <div className="flex-1 space-y-1">
                            <div className="text-sm text-foreground font-medium">
                              {product.shipmentLabel.consigner_name || "--"}
                            </div>
                            {product.shipmentLabel.consigner_email && (
                              <div className="text-xs text-muted-foreground">
                                {product.shipmentLabel.consigner_email}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-foreground flex-1">
                            {product.seller?.store_name || "--"}
                          </span>
                        )}
                        {/* Show WhatsApp button for consignment items with phone, or regular seller */}
                        {product.status === "consignment" && product.hasShipmentLabel && product.shipmentLabel?.consigner_phone && product.shipmentLabel.consigner_phone.trim() !== "+" ? (
                          <button
                            onClick={() =>
                              handleWhatsAppClick(
                                product.shipmentLabel?.consigner_phone || ""
                              )
                            }
                            className="p-1 rounded-full hover:bg-green-50 transition-colors duration-200 cursor-pointer"
                            title="Open WhatsApp chat with consigner"
                          >
                            <MessageCircle className="h-4 w-4 text-green-500 hover:text-green-600" />
                          </button>
                        ) : product.seller ? (
                          <button
                            onClick={() =>
                              handleWhatsAppClick(
                                product.seller?.whatsapp_number || ""
                              )
                            }
                            className="p-1 rounded-full hover:bg-green-50 transition-colors duration-200 cursor-pointer"
                            title="Open WhatsApp chat"
                          >
                            <MessageCircle className="h-4 w-4 text-green-500 hover:text-green-600" />
                          </button>
                        ) : null}
                      </div>
                    </TableCell>

                    {/* Shopify Column */}
                    <TableCell className="py-3">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleShopifyOrdersClick(product)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                          title="View order details"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-black"
                          >
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                        </button>
                      </div>
                    </TableCell>

                    {/* Sale Channel Column */}
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={`font-medium border-0 ${getStatusBadgeClass(
                          product.status
                        )}`}
                      >
                        {product.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    {showVendorColumns && (
                      <>
                        {/* Vendor Price Column */}
                        <TableCell className="py-3">
                          <span className="text-sm text-foreground">
                            {product.vendorPrice != null ? product.vendorPrice : "-"}
                          </span>
                        </TableCell>
                        {/* Vendor Order ID Column */}
                        <TableCell className="py-3">
                          <span className="text-sm text-foreground">
                            {product.vendorOrderId || "-"}
                          </span>
                        </TableCell>
                      </>
                    )}

                    {/* Tracking Status Column */}
                    <TableCell className="py-3 min-w-[180px]">
                      {product.shipmentLabel && product.shipmentLabel.status ? (
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className={`font-medium border whitespace-nowrap ${getTrackingStatusColor(
                              product.shipmentLabel.status
                            )}`}
                          >
                            {getTrackingStatusLabel(
                              formatTrackingStatus(product.shipmentLabel.status),
                              product.shipmentLabel?.shipping_destination
                            )}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    {/* Actions Column */}
                    {showActions && (
                      <TableCell className="py-3">
                        <div className="flex gap-2 justify-end">
                          {/* Assign Vendor Button - For sourcing items, or stock items with "fear of god" in name */}
                          {(product.status === "sourcing" || 
                            (product.status === "stock" && product.name.toLowerCase().includes("fear of god"))) && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAssignVendorClick(product)}
                              className="h-8 px-3 gap-1 text-xs bg-blue-600 hover:bg-blue-700"
                            >
                              <Package className="h-3.5 w-3.5" />
                              Assign Vendor
                            </Button>
                          )}

                          {onAddToCart && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  product.status === "sourcing" &&
                                  onAddToCart(product)
                                }
                                disabled={product.status !== "sourcing"}
                                className="h-8 px-3 gap-1 text-xs"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                Cart
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  product.status === "sourcing" &&
                                  handleWTBClick(product)
                                }
                                disabled={product.status !== "sourcing"}
                                className="h-8 px-3 gap-1 text-xs"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                WTB
                              </Button>
                            </>
                          )}

                           {product.hasShipmentLabel ? (
                             // View existing label
                             <ViewShipmentLabelModal
                               orderItemId={parseInt(product.id)}
                               productName={product.name}
                               orderNumber={product.orderNumber || ""}
                             >
                               <Button
                                 variant="default"
                                 size="sm"
                                 className="h-8 px-3 gap-1 text-xs bg-green-600 hover:bg-green-700"
                               >
                                 <Eye className="h-3.5 w-3.5" />
                                 View Label
                               </Button>
                             </ViewShipmentLabelModal>
                           ) : null}

                          {/* Consignment Orders - Use ConsignmentSendCloudModal */}
                          {(product.status === "consignment" ) && !product.hasShipmentLabel && (
                            <>
                              {product.customerAddress ? (
                                <ConsignmentSendCloudModal
                                  customerCountryCode={
                                    product.customerAddress.country_code ||
                                    product.destination ||
                                    "NL"
                                  }
                                  orderItem={{
                                    id: product.id,
                                    orderId: product.orderId,
                                    orderNumber: product.orderNumber,
                                    name: product.name,
                                    sku: product.sku,
                                    variant: product.variant,
                                    price: product.price,
                                    totalPrice: product.totalPrice,
                                    quantity: product.quantity || 1,
                                    customerName: product.customerName,
                                    customerEmail: product.customerEmail,
                                    customerPhone:
                                      product.customerAddress.phone,
                                    customerAddress: product.customerAddress,
                                  }}
                                  onLabelCreated={(labelData) =>
                                    handleShipmentLabelCreated(
                                      product,
                                      labelData
                                    )
                                  }
                                >
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="h-8 px-3 gap-1 text-xs bg-indigo-600 hover:bg-indigo-700"
                                  >
                                    <Truck className="h-3.5 w-3.5" />
                                    Ship
                                  </Button>
                                </ConsignmentSendCloudModal>
                              ) : null}
                            </>
                          )}

                          {/* Stock Orders - Use regular SendCloudModal */}
                          {product.status === "stock" && !product.hasShipmentLabel && (
                            <>
                              {product.customerAddress ? (
                                <SendCloudModal
                                  customerCountryCode={
                                    product.customerAddress.country_code ||
                                    product.destination ||
                                    "NL"
                                  }
                                  orderItem={{
                                    id: product.id,
                                    orderId: product.orderId,
                                    orderNumber: product.orderNumber,
                                    name: product.name,
                                    sku: product.sku,
                                    variant: product.variant,
                                    price: product.price,
                                    totalPrice: product.totalPrice,
                                    quantity: product.quantity || 1,
                                    customerName: product.customerName,
                                    customerEmail: product.customerEmail,
                                    customerPhone:
                                      product.customerAddress.phone,
                                    customerAddress: product.customerAddress,
                                  }}
                                  onLabelCreated={(labelData) =>
                                    handleShipmentLabelCreated(
                                      product,
                                      labelData
                                    )
                                  }
                                  defaultShipmentMethodCode={null}
                                  orderItemStatus={product.status}
                                >
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="h-8 px-3 gap-1 text-xs bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Truck className="h-3.5 w-3.5" />
                                    Ship
                                  </Button>
                                </SendCloudModal>
                              ) : null}
                            </>
                          )}

                          {/* Vendor Orders - Use regular SendCloudModal for vendor statuses */}
                          {isVendorStatus(product.status) && !product.hasShipmentLabel && (
                            <>
                              {product.customerAddress ? (
                                <SendCloudModal
                                  customerCountryCode={
                                    product.customerAddress.country_code ||
                                    product.destination ||
                                    "NL"
                                  }
                                  orderItem={{
                                    id: product.id,
                                    orderId: product.orderId,
                                    orderNumber: product.orderNumber,
                                    name: product.name,
                                    sku: product.sku,
                                    variant: product.variant,
                                    price: product.price,
                                    totalPrice: product.totalPrice,
                                    quantity: product.quantity || 1,
                                    customerName: product.customerName,
                                    customerEmail: product.customerEmail,
                                    customerPhone:
                                      product.customerAddress.phone,
                                    customerAddress: product.customerAddress,
                                  }}
                                  onLabelCreated={(labelData) =>
                                    handleShipmentLabelCreated(
                                      product,
                                      labelData
                                    )
                                  }
                                  defaultShipmentMethodCode={null}
                                  orderItemStatus={product.status}
                                >
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="h-8 px-3 gap-1 text-xs bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Truck className="h-3.5 w-3.5" />
                                    Ship
                                  </Button>
                                </SendCloudModal>
                              ) : null}
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-6 pt-4 border-t border-border">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </>
      )}

      {/* Vendor Assignment Modal */}
      {selectedProductForVendor && (
        <VendorAssignmentModal
          open={vendorAssignmentModalOpen}
          onOpenChange={setVendorAssignmentModalOpen}
          orderItemId={parseInt(selectedProductForVendor.id)}
          productName={selectedProductForVendor.name}
          onSuccess={handleVendorAssignmentSuccess}
        />
      )}
    </div>
  );
}
