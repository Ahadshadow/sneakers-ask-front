# SneakerAsk Admin Dashboard

Admin dashboard for managing a sneaker marketplace. Built with React, TypeScript, and modern web technologies.

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

## What is this?

This is an admin dashboard I built for managing a sneaker marketplace. It handles products, users, sellers, orders, and financial operations. The interface is responsive and works well on mobile devices.

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

## Features Deep Dive

### WTB (Want to Buy) System

This is probably the most complex part. It handles:

- Individual product orders with seller selection
- Bulk orders for multiple products
- VAT calculations based on seller location (EU compliance)
- Multiple shipping options including label uploads
- Shopping cart with persistent storage

The flow is: browse products → add to cart → bulk order page → configure sellers/VAT/shipping → submit.

### Product Management

Standard CRUD operations plus:
- Advanced filtering and search
- Inventory tracking
- Integration with Shopify for order data
- Status management (open, sold, processing, etc.)
- Bulk operations

### User & Seller Management

- User profiles with role-based permissions
- Seller onboarding workflow
- Performance metrics and analytics
- Bulk user operations

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