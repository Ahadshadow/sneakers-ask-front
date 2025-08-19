import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BulkWTBOrderFlow } from "@/components/wtb-order/BulkWTBOrderFlow";

export default function BulkWTBOrder() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there are items in cart
    const savedCart = sessionStorage.getItem('wtb-cart');
    if (!savedCart) {
      toast.error("No items in cart");
      navigate(-1);
    }
  }, [navigate]);

  return <BulkWTBOrderFlow />;
}