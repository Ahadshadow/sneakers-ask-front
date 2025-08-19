# SneakerAsk Admin Dashboard

A comprehensive admin dashboard for managing the SneakerAsk marketplace platform. Built with React, TypeScript, and modern web technologies to handle the complex operations of a sneaker reselling business.

## About SneakerAsk Platform

SneakerAsk is a B2B sneaker marketplace that connects sneaker retailers with verified sellers worldwide. The platform operates on a "Want to Buy" (WTB) model where retailers can request specific sneaker models, sizes, and quantities, and our network of sellers can fulfill these orders.

**Platform Overview:**
- **WTB Team** places WTB orders for specific sneakers needed by customers
- **Admin dashboard** (this application) manages the entire operation
- **Shopify integration** syncs retail orders and inventory data
- **Euro currency** with automated VAT calculations for EU compliance
- **Real-time tracking** of orders, payments, and shipping

**Business Model:**
The platform takes a commission on each successful transaction and provides value through verified seller networks, streamlined operations, and integrated financial processing.

## What This Dashboard Does

This admin dashboard serves as the central command center for SneakerAsk operations. It handles products, users, sellers, orders, and financial operations in Euro currency across EU regions. The interface is responsive and optimized for both desktop and mobile usage.

### Main features

- **Dashboard Overview** - Real-time metrics, analytics, and activity tracking
- **Product Management** - Comprehensive inventory tracking with Shopify integration
- **Want to Buy (WTB) Order System** - Single and bulk order processing with seller matching
- **User & Seller Management** - Complete administration of platform participants
- **Payout Processing** - Automated financial operations with VAT calculations and Revolut integration
- **Pagination System** - Efficient navigation through large datasets (10 items per page)
- **Advanced Filtering** - Multi-criteria search and filter capabilities across all grids
- **Payment Tracking** - Overdue and upcoming payment monitoring with 5-day arrival windows
- **Authentication System** - Secure sign-in with role-based access control
- **Responsive Design** - Mobile-first interface optimized for all device sizes

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for development and building
- Tailwind CSS for styling
- shadcn/ui for components
- Radix UI primitives
- Lucide React for icons
- React Hook Form for forms
- TanStack Query for data fetching
- React Router for navigation

**Backend:**
- Supabase (PostgreSQL database)
- Real-time subscriptions
- Row Level Security
- RESTful API with automatic OpenAPI documentation
- Serverless Edge Functions for business logic

**External Integrations:**
- Shopify Admin API for order synchronization
- Fliproom platform for seller inventory management
- Payment processors (integrated through Shopify)
- Revolut for payout processing
- Shipping providers (Discord contacts & Sendcloud for UPS/DPD)

**Development:**
- ESLint for code quality
- PostCSS for CSS processing

## Getting Started

You'll need Node.js 18+ installed.

```bash
# Clone the repo
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key

# Start development server
npm run dev
```

Open http://localhost:5173 to see it running.

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   └── dashboard/       # Dashboard components
│       ├── sections/    # Different dashboard sections
│       ├── AppSidebar.tsx
│       └── Dashboard.tsx
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── assets/              # Static files
```

### Key Components

**Dashboard Structure:**
- `Dashboard.tsx` - Main container that handles section routing
- `AppSidebar.tsx` - Collapsible sidebar navigation
- `OptimizedDashboardHeader.tsx` - Header with search and actions

**Sections:**
- `DashboardOverview.tsx` - Analytics overview with real-time activity feed
- `ProductsOverview/` - Product management suite with advanced filtering
  - `ProductsTable.tsx` - Product listing with pagination and WTB actions
  - `BoughtItemsGrid.tsx` - WTB purchases tracking with status management
  - `FilterSystem.tsx` - Multi-criteria filtering for products and purchases
  - `PaginationControls.tsx` - Reusable pagination component (10 items per page)
- `UsersManagement.tsx` - User administration with role management
- `SellersManagement.tsx` - Seller operations and verification
- `PayoutManagement.tsx` - Financial operations with payment tracking and filters

**WTB System:**
- `WTBModal.tsx` - Single product order creation with seller selection
- `BulkWTBOrder.tsx` - Bulk order processing with optimized workflows
- `WTBOrderFlow.tsx` - Streamlined order creation process
- `BulkWTBOrderFlow.tsx` - Enhanced bulk ordering with batch processing

**Authentication:**
- `SignIn.tsx` - Secure authentication interface
- Role-based access control throughout the application

## Architecture Overview

### System Architecture

The SneakerAsk platform follows a modern microservices-inspired architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Dashboard (React)                 │
├─────────────────────────────────────────────────────────────┤
│                    Supabase Backend                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   PostgreSQL    │ │  Edge Functions │ │   File Storage  ││
│  │    Database     │ │  (Business Logic)│ │   (Documents)   ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                External Integrations                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   Shopify API   │ │  Payment APIs   │ │  Shipping APIs  ││
│  │  (Retail Orders)│ │ (Stripe/PayPal) │ │  (DHL/FedEx)    ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Database Structure

The PostgreSQL database is organized around these core entities:

**Core Tables:**
- `products` - Sneaker inventory with SKUs, sizes, conditions
- `users` - Platform users with roles and permissions
- `sellers` - Verified seller profiles with location and ratings
- `wtb_orders` - Want to Buy orders with specifications and pricing
- `orders` - Completed transactions with fulfillment details
- `payments` - Financial transactions and payout records

**Key Relationships:**
- WTB orders can have multiple product variants
- Orders link buyers, sellers, and products
- Payments track commission splits and VAT calculations

**Supabase Features Used:**
- Row Level Security (RLS) for data access control
- Real-time subscriptions for live order updates
- Edge Functions for complex business logic
- Built-in authentication with role-based access

### Shopify Integration

The platform integrates with Shopify to sync retail operations:

**Data Flow:**
1. **Inventory Sync**: Products from Shopify stores flow into our database
2. **Order Processing**: Retail orders trigger WTB creation in our system
3. **Fulfillment Updates**: Our order completions update Shopify inventory
4. **Financial Reconciliation**: Sales data flows back for commission tracking

**Technical Implementation:**
- Shopify Admin API for real-time data access
- Webhooks for automatic inventory updates
- GraphQL queries for efficient data retrieval
- OAuth authentication for secure store access

**Integration Benefits:**
- Automatic inventory management
- Reduced manual data entry
- Real-time stock level updates
- Integrated financial reporting

### Fliproom Integration

The platform integrates with Fliproom as the primary seller marketplace where sellers list their inventory:

**Fliproom as Seller Space:**
- External platform hosted separately from SneakerAsk
- Sellers maintain their inventory listings on Fliproom
- SneakerAsk also maintains its own stock on Fliproom for direct sales
- Acts as the primary inventory source for the WTB marketplace

**Product Status System:**
The Products grid displays various statuses that reflect the Fliproom integration:
- Products sourced from Fliproom have specific statuses indicating availability
- Status determines whether products can be included in WTB orders
- Some products require special permissions to unlock for WTB usage
- This separation allows for better inventory control and seller management

**Technical Implementation:**
- API integration with Fliproom for real-time inventory sync
- Status-based access control for WTB order eligibility
- Permission system for unlocking restricted products
- Automated sync of product availability and pricing

## Features Deep Dive

### Pagination System

All data grids feature comprehensive pagination to handle large datasets efficiently:

**Implementation:**
- **Items per page**: Fixed at 10 items for optimal performance
- **Navigation controls**: Previous/Next buttons with page number indicators
- **Entry information**: Shows current range (e.g., "Showing 1 to 10 of 156 entries")
- **Smart page display**: Ellipsis handling for large page counts
- **Responsive design**: Adapts to mobile and desktop viewports

**Applied to:**
- Product listings in Products Overview
- WTB purchases tracking
- Seller payout management
- All filterable data tables

### Advanced Filtering System

Multi-criteria filtering across all major data grids:

**Payment Management Filters:**
- **Status Filter**: Pending, Processing, Completed
- **Payment Timeline**: "Overdue (5+ days)" and "Upcoming (<5 days)" based on arrival dates
- **Date Range**: From/To date selection with calendar picker
- **Search**: Seller names, emails, and product information

**Product Filters:**
- **Status-based**: Open, Fliproom Sale, SneakerAsk listings
- **Search capability**: Product names, SKUs, seller information
- **Date range filtering**: Purchase date ranges with calendar integration

### WTB (Want to Buy) System

The core business logic of the platform centers around the WTB system:

**Order Creation Flow:**
1. WTB team creates orders for specific sneakers needed by customers
2. Specifications include size, condition, quantity, and max price
3. Orders enter the marketplace for seller bidding
4. Automated matching algorithm suggests optimal seller combinations
5. Admin approval triggers payment processing and fulfillment

**Enhanced Features:**
- **Bulk Processing**: Streamlined workflows for multiple orders
- **Seller Selection**: Comprehensive seller comparison and selection tools
- **VAT Calculations**: Automated EU VAT handling based on locations
- **Shipping Integration**: Multiple shipping options with cost calculations
- **File Upload Support**: Document handling for complex orders

**Complex Features:**
- Euro pricing with automated VAT calculations
- EU VAT calculations based on seller/buyer locations
- Bulk order optimization for shipping efficiency
- Automated seller performance scoring
- Commission calculation with tiered pricing

### Product Management

Beyond standard CRUD operations, the system handles:

**Advanced Inventory Features:**
- Real-time stock synchronization with Shopify
- Automated product categorization using SKU patterns
- Size availability matrix across multiple sellers
- Historical pricing analysis and trends

### User & Seller Management

**Enhanced Seller Information:**
- Comprehensive seller profiles with Discord contact details
- Marketing integration capabilities for SMS and email campaigns
- Performance tracking and verification status
- Location and shipping method preferences

**Role-Based Access Control:**
- Super Admin: Full system access
- Operations Manager: Order and seller management
- Financial Controller: Payment and payout oversight
- Customer Service: User support and basic operations

## Recent Updates

### January 2025
- ✅ **Pagination System**: Added comprehensive pagination to all data grids (10 items per page)
- ✅ **Enhanced Filtering**: Implemented advanced filters for payments, products, and purchases
- ✅ **Payment Tracking**: Added overdue/upcoming payment monitoring based on 5-day arrival windows
- ✅ **Seller Information**: Enhanced seller profiles with Discord contacts and marketing options
- ✅ **Authentication**: Implemented secure sign-in interface
- ✅ **Bulk WTB Orders**: Refactored and enhanced bulk order processing system
- ✅ **Mobile Optimization**: Improved responsive design across all components

## Design System

I'm using CSS custom properties for theming in `index.css`. Colors are in HSL format:

```css
:root {
  --primary: 222.2 84% 4.9%;
  --secondary: 210 40% 96%;
  --background: 0 0% 100%;
  /* ... */
}
```

Components use `class-variance-authority` for consistent variants. The design is mobile-first and fully responsive.

## Configuration

**Tailwind** is customized in `tailwind.config.ts` with:
- Custom color system integration
- Animation utilities
- Component-specific utilities

**TypeScript** is configured for:
- Path mapping (`@/` for src folder)
- Strict type checking

**Vite** is set up for:
- Fast development with HMR
- Optimized production builds

## Deployment

**Easiest way:** Use the Lovable platform
1. Go to your [Lovable project](https://lovable.dev/projects/35a7da94-6429-475b-af20-3325266b94cf)
2. Click Share → Publish

**Alternative options:**
- Vercel: `npm i -g vercel && vercel`
- Netlify: Build and deploy the `dist/` folder
- Docker: See the Dockerfile example in the original version

## Development

Standard workflow:
1. Create feature branch
2. Make changes
3. Run `npm run lint`
4. Create PR

The code uses ESLint for quality checks. I try to follow conventional commit messages.

## Contributing

If you want to contribute:
1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Test everything works
5. Submit a PR

Please follow the existing code patterns and update docs if needed.

## Known Issues

- Sidebar animation can be slow on older devices
- Large product lists might have scroll performance issues
- File upload needs better progress indication

Check GitHub Issues for the complete list.

## License

MIT License - see LICENSE file.

## Acknowledgments

Thanks to the teams behind:
- Lovable for the development platform
- shadcn/ui for the component library
- Supabase for the backend
- All the other open source libraries used

---

**Live demo:** [View the app](https://lovable.dev/projects/35a7da94-6429-475b-af20-3325266b94cf)

[Edit in Lovable](https://lovable.dev/projects/35a7da94-6429-475b-af20-3325266b94cf) • [Report Bug](#) • [Request Feature](#)