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
    size: "US 10",
    orders: [
      {
        orderId: "1",
        orderNumber: "#SP001",
        quantity: 3,
        orderDate: "2024-08-15",
        customerName: "John Smith",
        orderTotal: "€510.00",
        products: [
          { productId: "1", productName: "Air Jordan 1 Retro High OG", quantity: 2 },
          { productId: "2", productName: "Nike Dunk Low Retro White", quantity: 1 }
        ]
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
    size: "US 9",
    orders: [
      {
        orderId: "1",
        orderNumber: "#SP001",
        quantity: 3,
        orderDate: "2024-08-15",
        customerName: "John Smith",
        orderTotal: "€510.00",
        products: [
          { productId: "1", productName: "Air Jordan 1 Retro High OG", quantity: 2 },
          { productId: "2", productName: "Nike Dunk Low Retro White", quantity: 1 }
        ]
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
    size: "US 11",
    orders: [
      {
        orderId: "2",
        orderNumber: "#SP002",
        quantity: 1,
        orderDate: "2024-08-15",
        customerName: "Sarah Johnson",
        orderTotal: "€330.00",
        products: [
          { productId: "3", productName: "Adidas Yeezy Boost 350 V2", quantity: 1 }
        ]
      },
      {
        orderId: "3",
        orderNumber: "#SP003",
        quantity: 1,
        orderDate: "2024-08-14",
        customerName: "Emily Davis",
        orderTotal: "€390.00",
        products: [
          { productId: "3", productName: "Adidas Yeezy Boost 350 V2", quantity: 1 }
        ]
      },
      {
        orderId: "4",
        orderNumber: "#SP004",
        quantity: 2,
        orderDate: "2024-08-13",
        customerName: "Michael Brown",
        orderTotal: "€440.00",
        products: [
          { productId: "3", productName: "Adidas Yeezy Boost 350 V2", quantity: 1 },
          { productId: "5", productName: "Converse Chuck 70 High Top", quantity: 1 }
        ]
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
    size: "US 9.5",
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
    size: "US 8",
    orders: [
      {
        orderId: "4",
        orderNumber: "#SP004",
        quantity: 2,
        orderDate: "2024-08-13",
        customerName: "Michael Brown",
        orderTotal: "€440.00",
        products: [
          { productId: "3", productName: "Adidas Yeezy Boost 350 V2", quantity: 1 },
          { productId: "5", productName: "Converse Chuck 70 High Top", quantity: 1 }
        ]
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
        orderTotal: "€100.00",
        products: [
          { productId: "7", productName: "Air Force 1 '07 White", quantity: 1 }
        ]
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
        orderTotal: "€260.00",
        products: [
          { productId: "9", productName: "Air Max 90 Essential", quantity: 2 }
        ]
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
        orderTotal: "€110.00",
        products: [
          { productId: "11", productName: "Blazer Mid '77 Vintage", quantity: 1 }
        ]
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
        orderTotal: "€150.00",
        products: [
          { productId: "13", productName: "Ultraboost 22 Core Black", quantity: 1 }
        ]
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
        orderTotal: "€210.00",
        products: [
          { productId: "15", productName: "Gel-Lyte III Heritage", quantity: 2 }
        ]
      }
    ]
  },
  {
    id: "16",
    name: "Puma Suede Classic",
    sku: "PSC-016",
    category: "Lifestyle",
    price: "€75.00",
    stock: 31,
    status: "open",
    seller: "Puma Collective",
    shopifyId: "gid://shopify/Product/6789123471",
    orders: []
  },
  {
    id: "17",
    name: "Reebok Classic Leather",
    sku: "RCL-017",
    category: "Lifestyle",
    price: "€85.00",
    stock: 18,
    status: "fliproom_sale",
    seller: "Reebok Store",
    shopifyId: "gid://shopify/Product/6789123472",
    orders: []
  },
  {
    id: "18",
    name: "Jordan 1 Low Travis Scott",
    sku: "J1L-TS-018",
    category: "Basketball",
    price: "€650.00",
    stock: 2,
    status: "sneakerask",
    seller: "Hype Vault",
    shopifyId: "gid://shopify/Product/6789123473",
    orders: []
  },
  {
    id: "19",
    name: "Nike SB Dunk High Pro",
    sku: "SBD-HP-019",
    category: "Skate",
    price: "€115.00",
    stock: 24,
    status: "open",
    seller: "Skate Central",
    shopifyId: "gid://shopify/Product/6789123474",
    orders: []
  },
  {
    id: "20",
    name: "Asics GT-2160",
    sku: "AGT-2160-020",
    category: "Running",
    price: "€140.00",
    stock: 16,
    status: "open",
    seller: "Asics Authority",
    shopifyId: "gid://shopify/Product/6789123475",
    orders: []
  },
  {
    id: "21",
    name: "Salomon XT-6",
    sku: "SXT-6-021",
    category: "Trail",
    price: "€195.00",
    stock: 9,
    status: "sneakerask",
    seller: "Trail Runners Pro",
    shopifyId: "gid://shopify/Product/6789123476",
    orders: []
  },
  {
    id: "22",
    name: "Hoka Clifton 9",
    sku: "HC9-022",
    category: "Running",
    price: "€145.00",
    stock: 21,
    status: "open",
    seller: "Running Haven",
    shopifyId: "gid://shopify/Product/6789123477",
    orders: []
  },
  {
    id: "23",
    name: "On Cloud 5",
    sku: "OC5-023",
    category: "Running",
    price: "€135.00",
    stock: 13,
    status: "open",
    seller: "Cloud Runners",
    shopifyId: "gid://shopify/Product/6789123478",
    orders: []
  },
  {
    id: "24",
    name: "Nike Air Presto",
    sku: "NAP-024",
    category: "Lifestyle",
    price: "€125.00",
    stock: 0,
    status: "fliproom_sale",
    seller: "Nike Official Store",
    shopifyId: "gid://shopify/Product/6789123479",
    orders: []
  },
  {
    id: "25",
    name: "Adidas Samba OG",
    sku: "ASO-025",
    category: "Lifestyle",
    price: "€90.00",
    stock: 42,
    status: "open",
    seller: "Adidas Outlet",
    shopifyId: "gid://shopify/Product/6789123480",
    orders: []
  },
  {
    id: "26",
    name: "New Balance 990v5",
    sku: "NB990-V5-026",
    category: "Running",
    price: "€185.00",
    stock: 7,
    status: "sneakerask",
    seller: "NB Enthusiasts",
    shopifyId: "gid://shopify/Product/6789123481",
    orders: []
  },
  {
    id: "27",
    name: "Nike Zoom Vomero 5",
    sku: "NZV5-027",
    category: "Running",
    price: "€160.00",
    stock: 19,
    status: "open",
    seller: "Zoom Collection",
    shopifyId: "gid://shopify/Product/6789123482",
    orders: []
  },
  {
    id: "28",
    name: "Adidas Gazelle Indoor",
    sku: "AGI-028",
    category: "Lifestyle",
    price: "€95.00",
    stock: 26,
    status: "open",
    seller: "Adidas Outlet",
    shopifyId: "gid://shopify/Product/6789123483",
    orders: []
  },
  {
    id: "29",
    name: "Jordan 3 Retro White Cement",
    sku: "J3R-WC-029",
    category: "Basketball",
    price: "€200.00",
    stock: 4,
    status: "fliproom_sale",
    seller: "Jordan Collection",
    shopifyId: "gid://shopify/Product/6789123484",
    orders: []
  },
  {
    id: "30",
    name: "Nike Air Max 97",
    sku: "NAM97-030",
    category: "Running",
    price: "€180.00",
    stock: 11,
    status: "open",
    seller: "Air Max Specialists",
    shopifyId: "gid://shopify/Product/6789123485",
    orders: []
  },
  {
    id: "31",
    name: "Converse Run Star Hike",
    sku: "CRSH-031",
    category: "Lifestyle",
    price: "€110.00",
    stock: 33,
    status: "open",
    seller: "Street Style Store",
    shopifyId: "gid://shopify/Product/6789123486",
    orders: []
  },
  {
    id: "32",
    name: "Vans Sk8-Hi MTE",
    sku: "VSH-MTE-032",
    category: "Skate",
    price: "€95.00",
    stock: 28,
    status: "open",
    seller: "Skate Central",
    shopifyId: "gid://shopify/Product/6789123487",
    orders: []
  },
  {
    id: "33",
    name: "Nike Cortez Classic",
    sku: "NCC-033",
    category: "Lifestyle",
    price: "€80.00",
    stock: 0,
    status: "sneakerask",
    seller: "Retro Runners",
    shopifyId: "gid://shopify/Product/6789123488",
    orders: []
  },
  {
    id: "34",
    name: "Puma RS-X³",
    sku: "PRSX3-034",
    category: "Running",
    price: "€120.00",
    stock: 17,
    status: "open",
    seller: "Puma Collective",
    shopifyId: "gid://shopify/Product/6789123489",
    orders: []
  },
  {
    id: "35",
    name: "Reebok Club C 85",
    sku: "RCC85-035",
    category: "Tennis",
    price: "€70.00",
    stock: 39,
    status: "open",
    seller: "Reebok Store",
    shopifyId: "gid://shopify/Product/6789123490",
    orders: []
  },
  {
    id: "36",
    name: "Air Jordan 11 Retro",
    sku: "AJ11R-036",
    category: "Basketball",
    price: "€220.00",
    stock: 3,
    status: "fliproom_sale",
    seller: "Jordan Collection",
    shopifyId: "gid://shopify/Product/6789123491",
    orders: []
  },
  {
    id: "37",
    name: "Nike Pegasus 40",
    sku: "NP40-037",
    category: "Running",
    price: "€135.00",
    stock: 23,
    status: "open",
    seller: "Running Haven",
    shopifyId: "gid://shopify/Product/6789123492",
    orders: []
  },
  {
    id: "38",
    name: "Adidas NMD R1",
    sku: "ANMD-R1-038",
    category: "Lifestyle",
    price: "€140.00",
    stock: 14,
    status: "sneakerask",
    seller: "Urban Footwear",
    shopifyId: "gid://shopify/Product/6789123493",
    orders: []
  },
  {
    id: "39",
    name: "New Balance 574",
    sku: "NB574-039",
    category: "Lifestyle",
    price: "€95.00",
    stock: 36,
    status: "open",
    seller: "NB Enthusiasts",
    shopifyId: "gid://shopify/Product/6789123494",
    orders: []
  },
  {
    id: "40",
    name: "Nike Blazer Low '77",
    sku: "NBL77-040",
    category: "Lifestyle",
    price: "€100.00",
    stock: 20,
    status: "open",
    seller: "Vintage Kicks",
    shopifyId: "gid://shopify/Product/6789123495",
    orders: []
  },
  {
    id: "41",
    name: "Asics Gel-Kayano 29",
    sku: "AGK29-041",
    category: "Running",
    price: "€160.00",
    stock: 8,
    status: "open",
    seller: "Asics Authority",
    shopifyId: "gid://shopify/Product/6789123496",
    orders: []
  },
  {
    id: "42",
    name: "Salomon Speedcross 5",
    sku: "SSC5-042",
    category: "Trail",
    price: "€135.00",
    stock: 12,
    status: "open",
    seller: "Trail Runners Pro",
    shopifyId: "gid://shopify/Product/6789123497",
    orders: []
  },
  {
    id: "43",
    name: "Jordan 6 Retro Carmine",
    sku: "J6R-C-043",
    category: "Basketball",
    price: "€210.00",
    stock: 0,
    status: "fliproom_sale",
    seller: "Hype Vault",
    shopifyId: "gid://shopify/Product/6789123498",
    orders: []
  },
  {
    id: "44",
    name: "Nike Dunk High Vintage",
    sku: "NDH-V-044",
    category: "Basketball",
    price: "€130.00",
    stock: 15,
    status: "sneakerask",
    seller: "Street Style Store",
    shopifyId: "gid://shopify/Product/6789123499",
    orders: []
  },
  {
    id: "45",
    name: "Adidas Forum Low",
    sku: "AFL-045",
    category: "Basketball",
    price: "€105.00",
    stock: 27,
    status: "open",
    seller: "Adidas Outlet",
    shopifyId: "gid://shopify/Product/6789123500",
    orders: []
  },
  {
    id: "46",
    name: "Puma Palermo",
    sku: "PP-046",
    category: "Lifestyle",
    price: "€85.00",
    stock: 22,
    status: "open",
    seller: "Puma Collective",
    shopifyId: "gid://shopify/Product/6789123501",
    orders: []
  },
  {
    id: "47",
    name: "Nike Air Max Plus",
    sku: "NAMP-047",
    category: "Running",
    price: "€170.00",
    stock: 6,
    status: "sneakerask",
    seller: "Air Max Specialists",
    shopifyId: "gid://shopify/Product/6789123502",
    orders: []
  },
  {
    id: "48",
    name: "New Balance 2002R",
    sku: "NB2002R-048",
    category: "Lifestyle",
    price: "€150.00",
    stock: 10,
    status: "open",
    seller: "NB Enthusiasts",
    shopifyId: "gid://shopify/Product/6789123503",
    orders: []
  },
  {
    id: "49",
    name: "Reebok Question Mid",
    sku: "RQM-049",
    category: "Basketball",
    price: "€140.00",
    stock: 0,
    status: "fliproom_sale",
    seller: "Reebok Store",
    shopifyId: "gid://shopify/Product/6789123504",
    orders: []
  },
  {
    id: "50",
    name: "Nike React Infinity Run",
    sku: "NRIR-050",
    category: "Running",
    price: "€160.00",
    stock: 18,
    status: "open",
    seller: "React Runner",
    shopifyId: "gid://shopify/Product/6789123505",
    orders: []
  },
  {
    id: "51",
    name: "Adidas Superstar",
    sku: "ASS-051",
    category: "Lifestyle",
    price: "€90.00",
    stock: 44,
    status: "open",
    seller: "Adidas Outlet",
    shopifyId: "gid://shopify/Product/6789123506",
    orders: []
  },
  {
    id: "52",
    name: "Converse Pro Leather",
    sku: "CPL-052",
    category: "Basketball",
    price: "€95.00",
    stock: 25,
    status: "open",
    seller: "Street Style Store",
    shopifyId: "gid://shopify/Product/6789123507",
    orders: []
  },
  {
    id: "53",
    name: "Vans Authentic",
    sku: "VA-053",
    category: "Skate",
    price: "€65.00",
    stock: 38,
    status: "open",
    seller: "Skate Central",
    shopifyId: "gid://shopify/Product/6789123508",
    orders: []
  },
  {
    id: "54",
    name: "Jordan 5 Retro Grape",
    sku: "J5R-G-054",
    category: "Basketball",
    price: "€190.00",
    stock: 5,
    status: "sneakerask",
    seller: "Jordan Collection",
    shopifyId: "gid://shopify/Product/6789123509",
    orders: []
  },
  {
    id: "55",
    name: "Nike Air Tailwind 79",
    sku: "NAT79-055",
    category: "Running",
    price: "€110.00",
    stock: 16,
    status: "open",
    seller: "Retro Runners",
    shopifyId: "gid://shopify/Product/6789123510",
    orders: []
  },
  {
    id: "56",
    name: "Asics Gel-Nimbus 25",
    sku: "AGN25-056",
    category: "Running",
    price: "€170.00",
    stock: 0,
    status: "fliproom_sale",
    seller: "Asics Authority",
    shopifyId: "gid://shopify/Product/6789123511",
    orders: []
  },
  {
    id: "57",
    name: "Hoka Bondi 8",
    sku: "HB8-057",
    category: "Running",
    price: "€165.00",
    stock: 14,
    status: "open",
    seller: "Running Haven",
    shopifyId: "gid://shopify/Product/6789123512",
    orders: []
  },
  {
    id: "58",
    name: "On Cloudmonster",
    sku: "OCM-058",
    category: "Running",
    price: "€180.00",
    stock: 9,
    status: "sneakerask",
    seller: "Cloud Runners",
    shopifyId: "gid://shopify/Product/6789123513",
    orders: []
  },
  {
    id: "59",
    name: "New Balance 327",
    sku: "NB327-059",
    category: "Lifestyle",
    price: "€100.00",
    stock: 29,
    status: "open",
    seller: "NB Enthusiasts",
    shopifyId: "gid://shopify/Product/6789123514",
    orders: []
  },
  {
    id: "60",
    name: "Nike Air Max 1 '86",
    sku: "NAM1-86-060",
    category: "Running",
    price: "€150.00",
    stock: 12,
    status: "open",
    seller: "Air Max Specialists",
    shopifyId: "gid://shopify/Product/6789123515",
    orders: []
  },
  {
    id: "61",
    name: "Adidas Campus 00s",
    sku: "AC00S-061",
    category: "Lifestyle",
    price: "€100.00",
    stock: 31,
    status: "open",
    seller: "Urban Footwear",
    shopifyId: "gid://shopify/Product/6789123516",
    orders: []
  },
  {
    id: "62",
    name: "Puma Speedcat OG",
    sku: "PSC-OG-062",
    category: "Lifestyle",
    price: "€105.00",
    stock: 0,
    status: "fliproom_sale",
    seller: "Puma Collective",
    shopifyId: "gid://shopify/Product/6789123517",
    orders: []
  },
  {
    id: "63",
    name: "Salomon ACS Pro",
    sku: "SAP-063",
    category: "Trail",
    price: "€175.00",
    stock: 7,
    status: "sneakerask",
    seller: "Trail Runners Pro",
    shopifyId: "gid://shopify/Product/6789123518",
    orders: []
  },
  {
    id: "64",
    name: "Nike Waffle Debut",
    sku: "NWD-064",
    category: "Running",
    price: "€75.00",
    stock: 35,
    status: "open",
    seller: "Nike Official Store",
    shopifyId: "gid://shopify/Product/6789123519",
    orders: []
  },
  {
    id: "65",
    name: "Jordan 12 Retro Taxi",
    sku: "J12R-T-065",
    category: "Basketball",
    price: "€225.00",
    stock: 4,
    status: "sneakerask",
    seller: "Hype Vault",
    shopifyId: "gid://shopify/Product/6789123520",
    orders: []
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