import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { isSeller } from "@/lib/utils/auth";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userIsSeller = isSeller(user);

  // Handle route redirects based on user type
  useEffect(() => {
    if (userIsSeller) {
      // If seller is on /seller without a specific section, default to wtb-requests
      if (location.pathname === '/seller') {
        navigate('/seller/history', { replace: true });
      }
    } else {
      // If admin is on root, ensure they're on dashboard
      if (location.pathname === '/' || location.pathname === '') {
        // Already on correct route, no redirect needed
        return;
      }
    }
  }, [userIsSeller, location.pathname, navigate]);

  return <Dashboard />;
};

export default Index;
