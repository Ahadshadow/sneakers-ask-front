import { WTBRequest } from "./types";

export const mockWTBRequests: WTBRequest[] = [
  {
    id: "WTB-001",
    productName: "Air Jordan 1 Retro High OG",
    sku: "AJ1-RH-001",
    size: "US 10",
    quantity: 2,
    payoutPrice: 140.50,
    requestDate: "2025-01-08",
    status: "active",
    image: "/sneakers/jordan-black.webp"
  },
  {
    id: "WTB-002",
    productName: "Nike Dunk Low Panda",
    sku: "NDL-P-002",
    size: "US 9.5",
    quantity: 5,
    payoutPrice: 90.00,
    requestDate: "2025-01-07",
    status: "active",
    image: "/sneakers/jordan-black.webp"
  },
  {
    id: "WTB-003",
    productName: "Adidas Yeezy Boost 350 V2",
    sku: "YZY-350-003",
    size: "US 11",
    quantity: 3,
    payoutPrice: 200.00,
    requestDate: "2025-01-06",
    status: "responded",
    image: "/sneakers/adidas-white.webp"
  },
  {
    id: "WTB-004",
    productName: "New Balance 550",
    sku: "NB-550-004",
    size: "US 10.5",
    quantity: 4,
    payoutPrice: 110.00,
    requestDate: "2025-01-05",
    status: "active",
    image: "/sneakers/nb-brown.webp"
  },
  {
    id: "WTB-005",
    productName: "Nike Air Max 90",
    sku: "NAM-90-005",
    size: "US 9",
    quantity: 3,
    payoutPrice: 125.00,
    requestDate: "2025-01-04",
    status: "active",
    image: "/sneakers/nb-brown.webp"
  },
  {
    id: "WTB-006",
    productName: "Adidas Samba OG",
    sku: "AS-OG-006",
    size: "US 10",
    quantity: 6,
    payoutPrice: 85.00,
    requestDate: "2025-01-03",
    status: "active",
    image: "/sneakers/adidas-white.webp"
  }
];
