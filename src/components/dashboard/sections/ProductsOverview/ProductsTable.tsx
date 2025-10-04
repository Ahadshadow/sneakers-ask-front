import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Package, ShoppingCart, Plus, Lock, Loader2, MessageCircle, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { Product } from "./types";
import { toast } from "@/components/ui/use-toast";
import { config } from "@/lib/config";

// Date formatting function
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${month} ${day}, ${displayHours}:${displayMinutes} ${ampm}`;
  } catch (error) {
    return '-';
  }
};

// Format date to 2-line format: "Aug 15" on first line, "05:00 AM" on second line
const formatDateTwoLine = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${month} ${day}\n${displayHours}:${displayMinutes} ${ampm}`;
  } catch (error) {
    return '-';
  }
};

// API function to update manual status
const updateManualStatus = async (orderItemId: number, manualStatus: string) => {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${config.api.baseUrl}/order-items/${orderItemId}/manual-status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      manual_status: manualStatus
    })
  });

  if (!response.ok) {
    throw new Error('Failed to update manual status');
  }

  return await response.json();
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
  showActions = true
}: ProductsTableProps) {
  const navigate = useNavigate();
  const [unlockedProducts, setUnlockedProducts] = useState<Set<string>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  
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
      case "fliproom_sale": 
        return "bg-blue-100 text-blue-800 border-0 px-2 py-1 rounded-full text-xs";
      case "sneakerask": 
        return "bg-gray-100 text-gray-800 border-0 px-2 py-1 rounded-full text-xs";
      case "bought": 
        return "bg-purple-100 text-purple-800 border-0 px-2 py-1 rounded-full text-xs";
      default: 
        return "bg-gray-100 text-gray-800 border-0 px-2 py-1 rounded-full text-xs";
    }
  };

  const handleShopifyOrdersClick = (product: Product) => {
    // Check if product has order URL from API
    if (product.orderUrl) {
      // Use the order URL from API
      window.open(product.orderUrl, '_blank');
      toast({
        title: "Opening Order",
        description: "Redirecting to order details...",
      });
    } else if (product.orders.length > 0 && product.orders[0].orderUrl) {
      // Use the first order's URL if available
      window.open(product.orders[0].orderUrl, '_blank');
      toast({
        title: "Opening Order",
        description: "Redirecting to order details...",
      });
    } else {
      // Fallback to default Shopify admin URL
      const shopifyDomain = "your-store.myshopify.com";
      const url = `https://${shopifyDomain}/admin/orders?query=product_id:${product.shopifyId}`;
      window.open(url, '_blank');
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
    setUnlockedProducts(prev => new Set([...prev, productId]));
  };

  const isWTBLocked = (product: Product) => {
    return (product.status === "fliproom_sale" || product.status === "sneakerask") && 
           !unlockedProducts.has(product.id);
  };

  const handleManualStatusChange = async (product: Product, newStatus: string) => {
    setUpdatingStatus(prev => new Set([...prev, product.id]));
    
    try {
      const response = await updateManualStatus(parseInt(product.id), newStatus);
      
      // Update the product's manual status with the API response
      if (response.success && response.manual_status) {
        product.manualStatus = response.manual_status;
      }
      
      toast({
        title: "Status Updated",
        description: `Manual status updated to "${response.manual_status || newStatus}"`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update manual status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
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
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">Order</TableHead>
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">Product</TableHead>
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">Destination</TableHead>
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4 flex items-center gap-1">
                    Date
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </TableHead>
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">Customer</TableHead>
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">Vendor</TableHead>
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">Shopify</TableHead>
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">Sale Channel</TableHead>
                  <TableHead className="font-bold text-gray-400 text-sm py-4 px-4">Manual Status</TableHead>
                  {showActions && (
                    <TableHead className="font-bold text-gray-400 text-sm py-4 px-4 text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map((product, index) => (
                  <TableRow 
                    key={product.id} 
                    className="border-b hover:bg-muted/10 transition-colors duration-200"
                  >
                    {/* Order Column */}
                    <TableCell className="py-3 min-w-[80px]">
                      <span className="text-sm text-foreground font-bold">{product.orderNumber || '-'}</span>
                    </TableCell>
                    
                     {/* Product Column */}
                     <TableCell className="py-3 min-w-[150px]">
                       <div className="space-y-1">
                         <p className="font-semibold text-foreground text-sm leading-tight line-clamp-3">{product.name}</p>
                         <div className="flex gap-3 text-xs text-muted-foreground">
                           <span>SKU: {product.sku}</span>
                           <span>Size: {product.variant || 'N/A'}</span>
                         </div>
                         <p className="text-sm text-foreground font-semibold">{product.price}</p>
                       </div>
                     </TableCell>
                    
                    {/* Destination Column */}
                    <TableCell className="py-3 min-w-[60px]">
                      <span className="text-sm text-foreground">{product.destination || '-'}</span>
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
                        {product.customerName || '-'}
                      </div>
                    </TableCell>
                    
                    {/* Vendor Column */}
                    <TableCell className="py-3">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm text-foreground flex-1">{product.seller}</span>
                        <button className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                          <MessageCircle className="h-4 w-4 text-green-500" />
                        </button>
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
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 0 1-8 0"/>
                          </svg>
                        </button>
                      </div>
                    </TableCell>
                    
                    {/* Sale Channel Column */}
                    <TableCell className="py-3">
                      <Badge 
                        variant="outline" 
                        className={`font-medium border-0 ${getStatusBadgeClass(product.status)}`}
                      >
                        {product.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    
                    {/* Manual Status Column */}
                    <TableCell className="py-3">
                      <div className="relative">
                        <Select 
                          value={product.manualStatus && product.manualStatus !== "N/A" ? product.manualStatus : ""} 
                          onValueChange={(value) => handleManualStatusChange(product, value)}
                          disabled={updatingStatus.has(product.id)}
                        >
                          <SelectTrigger className="w-48 h-8 text-xs">
                            <SelectValue placeholder="Select status..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="On the way to warehouse">On the way to warehouse</SelectItem>
                            <SelectItem value="Arrived at warehouse">Arrived at warehouse</SelectItem>
                            <SelectItem value="Verified">Verified</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                            <SelectItem value="On the way customer">On the way customer</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                        {updatingStatus.has(product.id) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-md">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Actions Column */}
                    {showActions && (
                      <TableCell className="py-3">
                        <div className="flex gap-2 justify-end">
                          {onAddToCart && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => product.status === "sourcing" && onAddToCart(product)}
                                disabled={product.status !== "sourcing"}
                                className="h-8 px-3 gap-1 text-xs"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                Cart
                              </Button>
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => product.status === "sourcing" && handleWTBClick(product)}
                                disabled={product.status !== "sourcing"}
                                className="h-8 px-3 gap-1 text-xs"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                WTB
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
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
    </div>
  );
}