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

- Dashboard with real-time metrics and analytics
- Product management with inventory tracking
- Want to Buy (WTB) order system with bulk processing
- User and seller management
- Payout processing with VAT calculations
- Role-based access control

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
- Payout processing (Revolt)
- Shipping providers (Discord reshapers & Sendcloud for UPS/DPD)
- VAT validation services (VIES)

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
- `DashboardOverview.tsx` - Analytics overview
- `ProductsOverview/` - Product management suite
- `UsersManagement.tsx` - User administration
- `SellersManagement.tsx` - Seller operations
- `PayoutManagement.tsx` - Financial operations

**WTB System:**
- `WTBModal.tsx` - Single product orders
- `BulkWTBOrder.tsx` - Bulk order processing
- `ProductsTable.tsx` - Product listing with actions

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
- Sellers can bid on multiple WTB orders
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

### WTB (Want to Buy) System

The core business logic of the platform centers around the WTB system:

**Order Creation Flow:**
1. WTB team creates orders for specific sneakers needed by customers
2. Specifications include size, condition, quantity, and max price
3. Orders enter the marketplace for seller bidding
4. Automated matching algorithm suggests optimal seller combinations
5. Admin approval triggers payment processing and fulfillment

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
- Condition grading system (DS, VNDS, Used, etc.)
- Size availability matrix across multiple sellers
- Historical pricing analysis and trends

**Integration Capabilities:**
- Automated product imports from multiple data sources
- Image recognition for authenticity verification
- Barcode scanning for quick product lookup
- Batch operations for high-volume management

### User & Seller Management

**Role-Based Access Control:**
- Super Admin: Full system access
- Operations Manager: Order and seller management
- Financial Controller: Payment and payout oversight
- Customer Service: User support and basic operations

**Seller Onboarding:**
- Multi-step verification process
- Document upload and validation
- Performance metrics tracking
- Automated rating system based on delivery and quality

**Advanced Features:**
- Seller performance analytics and insights
- Automated suspension based on quality metrics
- Bulk communication tools for announcements
- Geographic distribution analysis for shipping optimization

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