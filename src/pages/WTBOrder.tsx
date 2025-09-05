import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { WTBOrderFlow } from "@/components/wtb-order/WTBOrderFlow";

// Mock products data - in real app this would come from API
const mockProducts = {
  "1": {
    id: "1",
    name: "Air Jordan 1 Retro High OG",
    sku: "AJ1-RH-001",
    price: "€170.00",
    status: "open" as const
  },
  "2": {
    id: "2", 
    name: "Nike Dunk Low Panda",
    sku: "NDL-P-002",
    price: "€110.00",
    status: "open" as const
  }
};

export default function WTBOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  
  // Get product data
  const product = productId ? mockProducts[1] : null;

  // useEffect(() => {
  //   if (!product) {
  //     toast.error("Product not found");
  //     navigate(-1);
  //   }
  // }, [product, navigate]);

  if (!product) {
    return null;
  }

  return <WTBOrderFlow product={product} />;
}