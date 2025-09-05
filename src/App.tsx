import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth";
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
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/add-employee" element={
              <ProtectedRoute requiredRoles={['admin', 'manager']}>
                <AddEmployee />
              </ProtectedRoute>
            } />
            <Route path="/edit-employee/:id" element={
              <ProtectedRoute requiredRoles={['admin', 'manager']}>
                <EditEmployee />
              </ProtectedRoute>
            } />
            <Route path="/add-seller" element={
              <ProtectedRoute requiredRoles={['admin', 'manager']}>
                <AddSeller />
              </ProtectedRoute>
            } />
            <Route path="/edit-seller/:id" element={
              <ProtectedRoute requiredRoles={['admin', 'manager']}>
                <EditSeller />
              </ProtectedRoute>
            } />
            <Route path="/wtb-order" element={
              <ProtectedRoute requiredRoles={['admin', 'manager', 'employee']}>
                <WTBOrder />
              </ProtectedRoute>
            } />
            <Route path="/bulk-wtb-order" element={
              // <ProtectedRoute requiredRoles={['admin', 'manager', 'employee']}>
                <BulkWTBOrder />
              // </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
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
