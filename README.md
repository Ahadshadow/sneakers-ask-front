# SneakerAsk Admin Dashboard

<div align="center">
  <h3>🚀 Modern Admin Dashboard for Sneaker Marketplace Management</h3>
  <p>A sophisticated, feature-rich admin panel built with React, TypeScript, and modern web technologies</p>
  
  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
  ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
  ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
</div>

---

## 🎯 Project Overview

SneakerAsk Admin Dashboard is a comprehensive management system designed for sneaker marketplace operations. It provides administrators with powerful tools to manage products, users, sellers, orders, and financial operations through an intuitive, modern interface.

### 🌟 Key Highlights

- **Modern Architecture**: Built with React 18, TypeScript, and Vite for optimal performance
- **Responsive Design**: Mobile-first approach with Tailwind CSS and shadcn/ui components
- **Real-time Operations**: Integrated with Supabase for live data synchronization
- **Advanced UI/UX**: Features collapsible sidebar, dark/light mode, and smooth animations
- **Comprehensive Management**: Full CRUD operations for all business entities
- **WTB System**: Sophisticated "Want to Buy" order management workflow

---

## 🚀 Features

### 📊 Dashboard & Analytics
- **Overview Dashboard**: Real-time metrics and KPIs
- **Interactive Charts**: Revenue, sales, and performance analytics
- **Quick Actions**: Fast access to frequently used functions
- **Status Monitoring**: Live system health and activity feeds

### 🛍️ Product Management
- **Product Catalog**: Comprehensive product listing with search and filters
- **Inventory Tracking**: Real-time stock management
- **SKU Management**: Automated SKU generation and tracking
- **Bulk Operations**: Mass updates and bulk actions
- **Image Management**: Product photo upload and optimization

### 🛒 WTB (Want to Buy) System
- **Order Creation**: Streamlined WTB order workflow
- **Bulk Processing**: Handle multiple WTB orders simultaneously
- **Seller Selection**: Dynamic seller assignment with VAT calculations
- **Shipping Management**: Multiple shipping options with label uploads
- **Price Calculation**: Automated payout calculations with VAT handling

### 👥 User Management
- **User Profiles**: Complete user information management
- **Role-Based Access**: Granular permission system
- **Activity Monitoring**: User action tracking and audit logs
- **Bulk User Operations**: Mass user management capabilities

### 🏪 Seller Management
- **Seller Onboarding**: Streamlined seller registration process
- **Performance Tracking**: Seller metrics and analytics
- **Commission Management**: Automated fee calculations
- **Verification System**: Seller validation and approval workflow

### 💰 Financial Operations
- **Payout Management**: Automated and manual payout processing
- **VAT Handling**: EU VAT compliance with multiple schemes
- **Financial Reporting**: Comprehensive financial analytics
- **Transaction History**: Complete audit trail of all transactions

### 🔐 Security & Authentication
- **Profile Management**: User profile and settings
- **Secure Authentication**: JWT-based authentication system
- **Permission Control**: Role-based access control (RBAC)
- **Data Protection**: GDPR compliant data handling

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development environment
- **Vite** - Next-generation frontend tooling for fast development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible component library

### UI/UX Libraries
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Performant forms with easy validation
- **Sonner** - Toast notifications system
- **Recharts** - Composable charting library

### State Management & Routing
- **React Router DOM** - Declarative routing for React
- **TanStack Query** - Powerful data synchronization
- **React Context** - Lightweight state management

### Backend & Database
- **Supabase** - Open-source Firebase alternative
- **PostgreSQL** - Robust relational database
- **Real-time subscriptions** - Live data updates
- **Row Level Security** - Database-level security

### Development Tools
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization
- **TypeScript Compiler** - Static type checking

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── dashboard/       # Dashboard-specific components
│       ├── sections/    # Dashboard section components
│       ├── AppSidebar.tsx
│       └── Dashboard.tsx
├── pages/               # Page components
│   ├── Index.tsx        # Main dashboard page
│   ├── Profile.tsx      # User profile page
│   ├── AddEmployee.tsx  # Employee management
│   ├── AddSeller.tsx    # Seller management
│   └── ...
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── assets/             # Static assets
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

### Key Components

#### Dashboard Structure
- **`Dashboard.tsx`** - Main dashboard container with section routing
- **`AppSidebar.tsx`** - Collapsible navigation sidebar
- **`OptimizedDashboardHeader.tsx`** - Dashboard header with search and actions

#### Section Components
- **`DashboardOverview.tsx`** - Analytics and metrics overview
- **`ProductsOverview/`** - Product management suite
- **`UsersManagement.tsx`** - User administration
- **`SellersManagement.tsx`** - Seller operations
- **`PayoutManagement.tsx`** - Financial operations

#### WTB System
- **`WTBModal.tsx`** - Single product WTB order creation
- **`BulkWTBOrder.tsx`** - Bulk order processing
- **`ProductsTable.tsx`** - Product listing with WTB actions

---

## 🎨 Design System

### Color Palette
The application uses a semantic color system defined in `index.css`:

```css
:root {
  --primary: 222.2 84% 4.9%;
  --secondary: 210 40% 96%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --accent: 210 40% 96%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
}
```

### Component Variants
Consistent styling through `class-variance-authority` with predefined variants for:
- Buttons (default, secondary, outline, ghost, destructive)
- Cards (elevated, flat, interactive)
- Badges (default, secondary, destructive, outline)

---

## 🔧 Configuration

### Tailwind CSS
Customized configuration in `tailwind.config.ts`:
- Custom color system integration
- Animation utilities
- Responsive breakpoints
- Component-specific utilities

### TypeScript
Strict TypeScript configuration with:
- Path mapping for clean imports
- Strict type checking
- Modern ES features support

### Vite Configuration
Optimized build setup with:
- Fast HMR for development
- Optimized production builds
- Asset optimization
- Plugin ecosystem integration

---

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first approach** - Designed for mobile devices first
- **Breakpoint system** - sm (640px), md (768px), lg (1024px), xl (1280px)
- **Adaptive layouts** - Components adjust to screen size
- **Touch-friendly** - Optimized for touch interactions

---

## 🔐 Authentication & Security

### Authentication Flow
1. **Login/Registration** - Secure user authentication via Supabase Auth
2. **Session Management** - Automatic token refresh and session handling
3. **Protected Routes** - Route-level authentication guards
4. **Role-based Access** - Different permission levels for different user types

### Security Features
- **Row Level Security** - Database-level access control
- **SQL Injection Protection** - Parameterized queries
- **XSS Protection** - Input sanitization
- **CSRF Protection** - Token-based request validation

---

## 🌐 API Integration

### Supabase Integration
- **Real-time subscriptions** - Live data updates
- **Optimistic updates** - Immediate UI feedback
- **Error handling** - Comprehensive error management
- **Retry logic** - Automatic retry for failed requests

### Data Fetching Strategy
- **TanStack Query** - Intelligent caching and synchronization
- **Background refetching** - Keep data fresh
- **Pagination** - Efficient large dataset handling
- **Search and filtering** - Server-side query optimization

---

## 🚀 Deployment

### Lovable Platform (Recommended)
1. Open your [Lovable project](https://lovable.dev/projects/35a7da94-6429-475b-af20-3325266b94cf)
2. Click on **Share** → **Publish**
3. Your app will be deployed automatically

### Alternative Deployment Options

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 🔧 Development

### Code Style
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting (configured via ESLint)
- **Conventional Commits** - Standardized commit messages

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run quality checks: `npm run lint`
4. Create pull request
5. Review and merge

### Performance Optimization
- **Lazy Loading** - Route-based code splitting
- **Image Optimization** - Automatic image compression
- **Bundle Analysis** - Regular bundle size monitoring

---

## 📊 Key Features Deep Dive

### WTB (Want to Buy) System
The WTB system is a sophisticated order management workflow that allows:

1. **Individual Orders**: Single product WTB orders with seller selection
2. **Bulk Orders**: Multiple products processed simultaneously
3. **VAT Calculations**: Automatic payout calculations based on seller location
4. **Shipping Management**: Multiple shipping options including label uploads
5. **Cart System**: Persistent cart with real-time updates

### Product Management
Comprehensive product lifecycle management:

1. **Product Catalog**: Advanced filtering and search capabilities
2. **Inventory Tracking**: Real-time stock level monitoring
3. **Order Management**: Integration with external platforms (Shopify)
4. **Status Management**: Product lifecycle states (open, sold, processing)

### User & Seller Management
Complete user administration system:

1. **Role-Based Access Control**: Granular permissions
2. **Profile Management**: Comprehensive user profiles
3. **Seller Onboarding**: Streamlined seller registration
4. **Performance Analytics**: User and seller metrics

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use existing component patterns
- Update documentation as needed
- Test your changes thoroughly

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Lovable** - For the amazing development platform
- **shadcn/ui** - For the excellent component library
- **Supabase** - For the powerful backend platform
- **Radix UI** - For accessible UI primitives
- **Tailwind CSS** - For the utility-first CSS framework

---

## 📞 Support & Links

- **Live Demo**: [View your live app](https://lovable.dev/projects/35a7da94-6429-475b-af20-3325266b94cf)
- **Documentation**: Project documentation and guides
- **Issues**: Report bugs and request features
- **Community**: Join our developer community

---

<div align="center">
  <p>Built with ❤️ using Lovable</p>
  <p>
    <a href="https://lovable.dev/projects/35a7da94-6429-475b-af20-3325266b94cf">🚀 Edit in Lovable</a> •
    <a href="#">⭐ Star this repo</a> •
    <a href="#">🐛 Report Bug</a> •
    <a href="#">💡 Request Feature</a>
  </p>
</div>