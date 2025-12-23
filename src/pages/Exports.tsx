import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { OptimizedDashboardHeader } from "@/components/dashboard/OptimizedDashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { exportsApi } from "@/lib/api/exports";
import { useToast } from "@/hooks/use-toast";

const Exports = () => {
  const [currentSection, setCurrentSection] = useState("exports");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Format dates as YYYY-MM-DD for API
      const params: { from_date?: string; to_date?: string } = {};
      if (fromDate) {
        params.from_date = format(fromDate, "yyyy-MM-dd");
      }
      if (toDate) {
        params.to_date = format(toDate, "yyyy-MM-dd");
      }
      
      // Call the API to get the file blob
      const { blob, contentType, filename } = await exportsApi.exportSales(params);
      
      // Determine file extension from content type or use default
      let fileExtension = '.xlsx'; // default
      if (contentType.includes('csv')) {
        fileExtension = '.csv';
      } else if (contentType.includes('xlsx') || contentType.includes('spreadsheet')) {
        fileExtension = '.xlsx';
      } else if (contentType.includes('xls')) {
        fileExtension = '.xls';
      }
      
      // Use filename from response if available, otherwise generate one
      let downloadFilename: string;
      if (filename) {
        downloadFilename = filename;
      } else {
        // Generate filename with date range if applicable
        const dateRange = fromDate && toDate 
          ? `_${format(fromDate, "yyyy-MM-dd")}_to_${format(toDate, "yyyy-MM-dd")}`
          : fromDate 
          ? `_from_${format(fromDate, "yyyy-MM-dd")}`
          : toDate 
          ? `_to_${format(toDate, "yyyy-MM-dd")}`
          : "";
        downloadFilename = `sales_export${dateRange}${fileExtension}`;
      }
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Sales export file has been downloaded.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export sales data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
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
          <OptimizedDashboardHeader currentSection={currentSection} />
          
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6 space-y-8 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Range Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">From Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !fromDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {fromDate ? format(fromDate, "MMM dd, yyyy") : "Select from date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={fromDate}
                            onSelect={setFromDate}
                            initialFocus
                            className="p-3"
                            disabled={(date) => toDate ? date > toDate : false}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">To Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !toDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {toDate ? format(toDate, "MMM dd, yyyy") : "Select to date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={toDate}
                            onSelect={setToDate}
                            initialFocus
                            className="p-3"
                            disabled={(date) => fromDate ? date < fromDate : false}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  {/* Clear Dates Button */}
                  {(fromDate || toDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFromDate(undefined);
                        setToDate(undefined);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Clear Dates
                    </Button>
                  )}
                  
                  {/* Export Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="min-w-[150px]"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Export Sales
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Exports;

