import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import AddSeller from "./pages/AddSeller";
import EditSeller from "./pages/EditSeller";
import WTBOrder from "./pages/WTBOrder";
import BulkWTBOrder from "./pages/BulkWTBOrder";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            <Route path="/add-employee" element={
              <ProtectedRoute requiredPermissions={['users.create']}>
                <AddEmployee />
              </ProtectedRoute>
            } />
            
            <Route path="/edit-employee/:id" element={
              <ProtectedRoute requiredPermissions={['users.edit.all']}>
                <EditEmployee />
              </ProtectedRoute>
            } />
            
            <Route path="/add-seller" element={
              <ProtectedRoute requiredPermissions={['sellers.create']}>
                <AddSeller />
              </ProtectedRoute>
            } />
            
            <Route path="/edit-seller/:id" element={
              <ProtectedRoute requiredPermissions={['sellers.edit']}>
                <EditSeller />
              </ProtectedRoute>
            } />
            
            <Route path="/wtb-order" element={
              <ProtectedRoute requiredPermissions={['wtb.create']}>
                <WTBOrder />
              </ProtectedRoute>
            } />
            
            <Route path="/bulk-wtb-order" element={
              <ProtectedRoute requiredPermissions={['wtb.create']}>
                <BulkWTBOrder />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
