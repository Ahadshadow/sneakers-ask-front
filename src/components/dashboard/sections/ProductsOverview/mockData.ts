import { Product } from "./types";

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Air Jordan 1 Retro High OG",
    sku: "AJ1-RH-001",
    category: "Basketball",
    price: "€170.00",
    stock: 45,
    status: "open",
    seller: "Premium Sneakers Co",
    shopifyId: "gid://shopify/Product/6789123456",
    orders: [
      {
        orderId: "1",
        orderNumber: "#SP001",
        quantity: 2,
        orderDate: "2024-08-15",
        customerName: "John Smith",
        orderTotal: "€510.00"
      },
      {
        orderId: "3",
        orderNumber: "#SP003",
        quantity: 1,
        orderDate: "2024-08-14",
        customerName: "Emily Davis",
        orderTotal: "€390.00"
      }
    ]
  },
  {
    id: "2",
    name: "Nike Dunk Low Retro White",
    sku: "NDL-RW-002",
    category: "Lifestyle",
    price: "€100.00",
    stock: 0,
    status: "fliproom_sale",
    seller: "Street Style Store",
    shopifyId: "gid://shopify/Product/6789123457",
    orders: [
      {
        orderId: "2",
        orderNumber: "#SP002",
        quantity: 1,
        orderDate: "2024-08-15",
        customerName: "Sarah Johnson",
        orderTotal: "€330.00"
      }
    ]
  },
  {
    id: "3",
    name: "Adidas Yeezy Boost 350 V2",
    sku: "YB3-V2-003",
    category: "Running",
    price: "€220.00",
    stock: 12,
    status: "sneakerask",
    seller: "Rare Kicks Boutique",
    shopifyId: "gid://shopify/Product/6789123458",
    orders: [
      {
        orderId: "2",
        orderNumber: "#SP002",
        quantity: 1,
        orderDate: "2024-08-15",
        customerName: "Sarah Johnson",
        orderTotal: "€330.00"
      },
      {
        orderId: "3",
        orderNumber: "#SP003",
        quantity: 1,
        orderDate: "2024-08-14",
        customerName: "Emily Davis",
        orderTotal: "€390.00"
      },
      {
        orderId: "4",
        orderNumber: "#SP004",
        quantity: 2,
        orderDate: "2024-08-13",
        customerName: "Michael Brown",
        orderTotal: "€440.00"
      }
    ]
  },
  {
    id: "4",
    name: "New Balance 550 Vintage",
    sku: "NB5-VT-004",
    category: "Lifestyle",
    price: "€110.00",
    stock: 28,
    status: "open",
    seller: "Urban Footwear",
    shopifyId: "gid://shopify/Product/6789123459",
    orders: []
  },
  {
    id: "5",
    name: "Converse Chuck 70 High Top",
    sku: "C70-HT-005",
    category: "Lifestyle",
    price: "€85.00",
    stock: 67,
    status: "sneakerask",
    seller: "Street Style Store",
    shopifyId: "gid://shopify/Product/6789123460",
    orders: [
      {
        orderId: "4",
        orderNumber: "#SP004",
        quantity: 1,
        orderDate: "2024-08-13",
        customerName: "Michael Brown",
        orderTotal: "€440.00"
      }
    ]
  }
];