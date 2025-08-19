import { Product, WTBPurchase } from "./types";

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
  },
  {
    id: "6",
    name: "Vans Old Skool Classic",
    sku: "VOS-CL-006",
    category: "Skate",
    price: "€70.00",
    stock: 33,
    status: "open",
    seller: "Skate Central",
    shopifyId: "gid://shopify/Product/6789123461",
    orders: []
  },
  {
    id: "7",
    name: "Air Force 1 '07 White",
    sku: "AF1-07-007",
    category: "Basketball",
    price: "€100.00",
    stock: 0,
    status: "fliproom_sale",
    seller: "Nike Official Store",
    shopifyId: "gid://shopify/Product/6789123462",
    orders: [
      {
        orderId: "5",
        orderNumber: "#SP005",
        quantity: 1,
        orderDate: "2024-08-12",
        customerName: "David Wilson",
        orderTotal: "€100.00"
      }
    ]
  },
  {
    id: "8",
    name: "Stan Smith Classic White",
    sku: "SS-CW-008",
    category: "Tennis",
    price: "€80.00",
    stock: 22,
    status: "open",
    seller: "Adidas Outlet",
    shopifyId: "gid://shopify/Product/6789123463",
    orders: []
  },
  {
    id: "9",
    name: "Air Max 90 Essential",
    sku: "AM90-ES-009",
    category: "Running",
    price: "€130.00",
    stock: 15,
    status: "sneakerask",
    seller: "Air Max Specialists",
    shopifyId: "gid://shopify/Product/6789123464",
    orders: [
      {
        orderId: "6",
        orderNumber: "#SP006",
        quantity: 2,
        orderDate: "2024-08-11",
        customerName: "Lisa Taylor",
        orderTotal: "€260.00"
      }
    ]
  },
  {
    id: "10",
    name: "React Element 55",
    sku: "RE55-010",
    category: "Running",
    price: "€125.00",
    stock: 8,
    status: "open",
    seller: "React Runner",
    shopifyId: "gid://shopify/Product/6789123465",
    orders: []
  },
  {
    id: "11",
    name: "Blazer Mid '77 Vintage",
    sku: "BM77-VT-011",
    category: "Lifestyle",
    price: "€110.00",
    stock: 19,
    status: "open",
    seller: "Vintage Kicks",
    shopifyId: "gid://shopify/Product/6789123466",
    orders: [
      {
        orderId: "7",
        orderNumber: "#SP007",
        quantity: 1,
        orderDate: "2024-08-10",
        customerName: "Alex Miller",
        orderTotal: "€110.00"
      }
    ]
  },
  {
    id: "12",
    name: "Jordan 4 Retro White Cement",
    sku: "J4R-WC-012",
    category: "Basketball",
    price: "€180.00",
    stock: 5,
    status: "fliproom_sale",
    seller: "Jordan Collection",
    shopifyId: "gid://shopify/Product/6789123467",
    orders: []
  },
  {
    id: "13",
    name: "Ultraboost 22 Core Black",
    sku: "UB22-CB-013",
    category: "Running",
    price: "€150.00",
    stock: 11,
    status: "open",
    seller: "Boost Central",
    shopifyId: "gid://shopify/Product/6789123468",
    orders: [
      {
        orderId: "8",
        orderNumber: "#SP008",
        quantity: 1,
        orderDate: "2024-08-09",
        customerName: "Chris Taylor",
        orderTotal: "€150.00"
      }
    ]
  },
  {
    id: "14",
    name: "Air Huarache Run",
    sku: "AHR-014",
    category: "Lifestyle",
    price: "€120.00",
    stock: 25,
    status: "sneakerask",
    seller: "Huarache Hub",
    shopifyId: "gid://shopify/Product/6789123469",
    orders: []
  },
  {
    id: "15",
    name: "Gel-Lyte III Heritage",
    sku: "GL3-HE-015",
    category: "Running",
    price: "€105.00",
    stock: 14,
    status: "open",
    seller: "Asics Authority",
    shopifyId: "gid://shopify/Product/6789123470",
    orders: [
      {
        orderId: "9",
        orderNumber: "#SP009",
        quantity: 2,
        orderDate: "2024-08-08",
        customerName: "Emma White",
        orderTotal: "€210.00"
      }
    ]
  }
];

export const mockWTBPurchases: WTBPurchase[] = [
  {
    id: "wtb1",
    product: {
      name: "Nike Air Jordan 1 Retro High OG",
      sku: "555088-134"
    },
    seller: "Premium Kicks Store",
    payoutPrice: 145,
    shippingMethod: "DHL Express",
    status: "processing",
    purchaseDate: "2024-01-15"
  },
  {
    id: "wtb2",
    product: {
      name: "Adidas Yeezy Boost 350 V2",
      sku: "GZ5541"
    },
    seller: "Sneaker World",
    payoutPrice: 195,
    shippingMethod: "UPS Standard",
    status: "shipped",
    purchaseDate: "2024-01-14"
  },
  {
    id: "wtb3",
    product: {
      name: "Nike Dunk Low Retro",
      sku: "DD1391-100"
    },
    seller: "Urban Footwear",
    payoutPrice: 85,
    shippingMethod: "PostNL",
    status: "delivered",
    purchaseDate: "2024-01-13"
  },
  {
    id: "wtb4",
    product: {
      name: "New Balance 550 White Green",
      sku: "BB550WTG"
    },
    seller: "Classic Runners",
    payoutPrice: 95,
    shippingMethod: "DHL Express",
    status: "delivered",
    purchaseDate: "2024-01-12"
  },
  {
    id: "wtb5",
    product: {
      name: "Converse Chuck Taylor All Star",
      sku: "M9160C"
    },
    seller: "Retro Sneakers",
    payoutPrice: 65,
    shippingMethod: "PostNL",
    status: "processing",
    purchaseDate: "2024-01-11"
  },
  {
    id: "wtb6",
    product: {
      name: "Vans Old Skool",
      sku: "VN000D3HY28"
    },
    seller: "Skate Central",
    payoutPrice: 70,
    shippingMethod: "UPS Standard",
    status: "processing",
    purchaseDate: "2024-01-10"
  },
  {
    id: "wtb7",
    product: {
      name: "Air Force 1 '07",
      sku: "315122-111"
    },
    seller: "Nike Store Official",
    payoutPrice: 100,
    shippingMethod: "DHL Express",
    status: "shipped",
    purchaseDate: "2024-01-09"
  },
  {
    id: "wtb8",
    product: {
      name: "Stan Smith",
      sku: "FX5500"
    },
    seller: "Adidas Outlet",
    payoutPrice: 80,
    shippingMethod: "PostNL",
    status: "delivered",
    purchaseDate: "2024-01-08"
  },
  {
    id: "wtb9",
    product: {
      name: "Air Max 90",
      sku: "CN8490-100"
    },
    seller: "Air Max Specialists",
    payoutPrice: 130,
    shippingMethod: "DHL Express",
    status: "delivered",
    purchaseDate: "2024-01-07"
  },
  {
    id: "wtb10",
    product: {
      name: "React Element 55",
      sku: "BQ6166-100"
    },
    seller: "React Runner",
    payoutPrice: 125,
    shippingMethod: "UPS Standard",
    status: "processing",
    purchaseDate: "2024-01-06"
  },
  {
    id: "wtb11",
    product: {
      name: "Blazer Mid '77",
      sku: "BQ6806-100"
    },
    seller: "Vintage Kicks",
    payoutPrice: 110,
    shippingMethod: "PostNL",
    status: "processing",
    purchaseDate: "2024-01-05"
  },
  {
    id: "wtb12",
    product: {
      name: "Jordan 4 Retro",
      sku: "308497-111"
    },
    seller: "Jordan Collection",
    payoutPrice: 180,
    shippingMethod: "DHL Express",
    status: "shipped",
    purchaseDate: "2024-01-04"
  },
  {
    id: "wtb13",
    product: {
      name: "Ultraboost 22",
      sku: "GZ0127"
    },
    seller: "Boost Central",
    payoutPrice: 150,
    shippingMethod: "UPS Standard",
    status: "delivered",
    purchaseDate: "2024-01-03"
  },
  {
    id: "wtb14",
    product: {
      name: "Air Huarache",
      sku: "318429-111"
    },
    seller: "Huarache Hub",
    payoutPrice: 120,
    shippingMethod: "PostNL",
    status: "delivered",
    purchaseDate: "2024-01-02"
  },
  {
    id: "wtb15",
    product: {
      name: "Gel-Lyte III",
      sku: "1191A201-100"
    },
    seller: "Asics Authority",
    payoutPrice: 105,
    shippingMethod: "DHL Express",
    status: "processing",
    purchaseDate: "2024-01-01"
  }
];