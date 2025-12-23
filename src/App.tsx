import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute, SellerRoute } from "@/components/auth";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Payouts from "./pages/Payouts";
import Exports from "./pages/Exports";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Sellers from "./pages/Sellers";
import Vendors from "./pages/Vendors";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import AddSeller from "./pages/AddSeller";
import EditSeller from "./pages/EditSeller";
import WTBOrder from "./pages/WTBOrder";
import BulkWTBOrder from "./pages/BulkWTBOrder";
import Profile from "./pages/Profile";
import SellerProfile from "./pages/SellerProfile";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SellerOnboarding from "./pages/SellerOnboarding";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401 (unauthorized) errors
        if (error instanceof Error && error.message.includes('401')) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/seller/onboarding" element={<SellerOnboarding />} />
            
            {/* Admin routes - only accessible to admin users */}
            <Route path="/" element={
              <AdminRoute>
                <Index />
              </AdminRoute>
            } />
            <Route path="/products" element={
              <AdminRoute>
                <Products />
              </AdminRoute>
            } />
            <Route path="/payouts" element={
              <AdminRoute>
                <Payouts />
              </AdminRoute>
            } />
            <Route path="/exports" element={
              <AdminRoute>
                <Exports />
              </AdminRoute>
            } />
            <Route path="/users" element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            } />
            <Route path="/roles" element={
              <AdminRoute>
                <Roles />
              </AdminRoute>
            } />
            <Route path="/sellers" element={
              <AdminRoute>
                <Sellers />
              </AdminRoute>
            } />
            <Route path="/vendors" element={
              <AdminRoute>
                <Vendors />
              </AdminRoute>
            } />
            <Route path="/add-employee" element={
              <AdminRoute>
                <ProtectedRoute requiredRoles={['admin', 'manager']}>
                  <AddEmployee />
                </ProtectedRoute>
              </AdminRoute>
            } />
            <Route path="/edit-employee/:id" element={
              <AdminRoute>
                <ProtectedRoute requiredRoles={['admin', 'manager']}>
                  <EditEmployee />
                </ProtectedRoute>
              </AdminRoute>
            } />
            <Route path="/add-seller" element={
              <AdminRoute>
                <ProtectedRoute requiredRoles={['admin', 'manager']}>
                  <AddSeller />
                </ProtectedRoute>
              </AdminRoute>
            } />
            <Route path="/edit-seller/:id" element={
              <AdminRoute>
                <ProtectedRoute requiredRoles={['admin', 'manager']}>
                  <EditSeller />
                </ProtectedRoute>
              </AdminRoute>
            } />
            <Route path="/wtb-order" element={
              <AdminRoute>
                <ProtectedRoute requiredRoles={['admin', 'manager', 'employee']}>
                  <WTBOrder />
                </ProtectedRoute>
              </AdminRoute>
            } />
            <Route path="/bulk-wtb-order" element={
              <AdminRoute>
                <ProtectedRoute requiredRoles={['admin', 'manager', 'employee']}>
                  <BulkWTBOrder />
                </ProtectedRoute>
              </AdminRoute>
            } />
            <Route path="/profile" element={
              <AdminRoute>
                <Profile />
              </AdminRoute>
            } />
            
            {/* Seller routes with /seller/ prefix - only accessible to seller users */}
            <Route path="/seller" element={
              <SellerRoute>
                <Index />
              </SellerRoute>
            } />
            <Route path="/seller/wtb-requests" element={
              <SellerRoute>
                <Index />
              </SellerRoute>
            } />
            <Route path="/seller/my-offers" element={
              <SellerRoute>
                <Index />
              </SellerRoute>
            } />
            <Route path="/seller/my-sales" element={
              <SellerRoute>
                <Index />
              </SellerRoute>
            } />
            <Route path="/seller/my-shipments" element={
              <SellerRoute>
                <Index />
              </SellerRoute>
            } />
            <Route path="/seller/history" element={
              <SellerRoute>
                <Index />
              </SellerRoute>
            } />
            <Route path="/seller/payout" element={
              <SellerRoute>
                <Index />
              </SellerRoute>
            } />
            <Route path="/seller/profile" element={
              <SellerRoute>
                <SellerProfile />
              </SellerRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
