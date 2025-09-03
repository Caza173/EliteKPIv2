# EliteKPI Real Estate Management System

## Overview

EliteKPI is a comprehensive business intelligence platform designed specifically for real estate professionals. The application serves as a centralized hub for tracking sales performance, managing property pipelines, analyzing ROI, and monitoring key performance indicators. It provides realtors with tools to manage their entire business lifecycle from lead generation through closed transactions, including expense tracking, time management, performance analytics, subscription billing management, real-time market trend analysis with predictive forecasting, and gamified performance tracking with achievement badges to motivate continued excellence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using functional components and hooks
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **UI Components**: Radix UI primitives wrapped in custom components for accessibility

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API endpoints with consistent error handling and logging
- **Middleware**: Custom middleware for request logging and error handling
- **Development Setup**: Vite for hot module replacement and development server

### Data Storage Solutions
- **Primary Database**: PostgreSQL with connection pooling via Neon serverless
- **Schema Management**: Drizzle migrations with shared schema definitions
- **Session Storage**: PostgreSQL-backed session store for authentication persistence
- **Data Modeling**: Comprehensive schema covering users, properties, commissions, expenses, time tracking, activities, CMAs, showings, mileage logs, and goals

### Authentication and Authorization
- **Authentication Provider**: Simple development authentication system (replace with your preferred solution in production)
- **Session Management**: Express sessions with PostgreSQL storage
- **Authorization**: Route-level authentication middleware with user context
- **Security**: HTTP-only secure cookies with configurable TTL

### Component Organization
- **Layout Components**: App layout with responsive sidebar navigation
- **Feature Components**: Domain-specific components for properties, dashboard, reports, billing
- **UI Components**: Reusable shadcn/ui components with consistent styling
- **Modal System**: Dialog-based modals for data entry and editing operations
- **Billing System**: Example subscription management with tiered pricing plans

## External Dependencies

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Environment Configuration**: DATABASE_URL and SESSION_SECRET required

### Authentication Services
- **Simple Auth**: Development authentication system (customize for production)
- **Required Environment Variables**: DATABASE_URL, SESSION_SECRET

### Frontend Libraries
- **UI Framework**: React 18 with TypeScript support
- **Component Library**: Radix UI primitives for accessible components
- **State Management**: TanStack React Query for server state
- **Form Management**: React Hook Form with Hookform Resolvers
- **Validation**: Zod for runtime type validation
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Charts**: Recharts for data visualization
- **Date Handling**: date-fns for date manipulation and formatting

### Development Tools
- **Build Tool**: Vite for fast development and optimized production builds
- **Runtime**: tsx for TypeScript execution in development
- **Bundler**: esbuild for production server bundling
- **Code Quality**: TypeScript for static type checking

### Business Logic Libraries
- **Calculations**: Custom utility functions for commission, ROI, and performance metrics
- **Constants**: Predefined enums and options for property types, statuses, and categories
- **Utilities**: Helper functions for styling, formatting, and data manipulation

## Recent Changes

### Performance Analytics & Competitive Features (August 2024)
- Enhanced performance dashboard with comprehensive efficiency scoring system (73/100 overall score)
- Added detailed performance breakdown across 8 key metrics (Conversion, Call Efficiency, ROI, Days on Market, CMA Accuracy, Price Ratio, Time Management, Deal Retention)
- Implemented circular progress indicator for overall efficiency visualization
- Created Performance Recommendations system with priority-based actionable insights
- Built comprehensive Buyer & Seller Conversion Metrics with interactive charts (pie charts and bar charts)
- Added Performance Streaks & Medal Tracking system with competitive ranking features
- Integrated medal collection display (Bronze: 12, Silver: 8, Gold: 5, Platinum: 2, Diamond: 1)
- Created current streaks tracking for Daily Activities (14 days), Weekly Goals (3 weeks), Monthly Revenue (2 months), Client Follow-ups (7 days)
- Implemented competitive regional ranking system showing top 15% performance (#47 regional rank)
- Enhanced activity breakdown with modern visual progress bars and colored badges
- Made Property ROI Analysis expandable with individual property performance details

### Property Management & UI Enhancements (August 2024)
- Enhanced property details dialog from slide-out sheet to centered popup window (95% viewport width, 90% height)
- Fixed property representation type display to show correct buyer/seller status from database
- Added comprehensive property-specific activity tracking with 5-tab system (Overview, Commissions, Financial, Expenses, Time)
- Created functional Schedule Showing modal with property selection, date/time, and activity logging
- Implemented Log Mileage modal with location tracking, miles calculation, and property association
- Enhanced Log Hours modal with property-specific time tracking and activity categorization
- Fixed Add Commission functionality with automatic calculation from property sale price and commission rate
- Added interactive commission calculation (changing amount updates rate and vice versa)
- Improved add property form layout with better organization and field grouping
- Added leadSource field to property schema with comprehensive dropdown options including traditional sources (Referral, SOI, Online, Cold Call, Open House, Sign Call, Social Media, Advertising) and modern lead generation platforms (Agent Referral, HomeLight, Zillow, OpCity, UpNest, Facebook, Instagram, Direct Mail, Other)

### Billing & Subscription Management (August 2024)
- Added comprehensive billing page with subscription plans (Starter $29, Professional $79, Enterprise $199)
- Implemented tiered subscription model with usage limits and feature restrictions
- Created billing history, usage tracking, and subscription management interface
- Added billing tab to sidebar navigation with credit card icon
- Designed example subscription flow (requires Stripe integration for live payments)

### Market Trends & Predictive Analytics (August 2024)
- Built comprehensive market trends dashboard with real-time data visualization
- Implemented interactive charts for price trends, sales volume, and market metrics
- Added predictive analytics with AI-powered 5-month price forecasting and confidence intervals
- Created location-based market analysis for multiple metro areas (San Francisco, Austin, Miami, Seattle)
- Integrated market insights, alerts, and comparative analysis features
- Prepared backend infrastructure for real estate API integration (RentCast, ATTOM, Zillow, etc.)
- Added market trends navigation with line chart icon in sidebar
- **Enhanced zipcode lookup system with nationwide US coverage using Zippopotam.us API integration**
- **Replaced limited NH zipcode database (12 zipcodes) with comprehensive lookup supporting all 40,000+ US zipcodes**
- **Added fallback system for reliable location data retrieval across all US states and territories**

### Gamified Performance Dashboard (August 2024)
- Implemented comprehensive achievement system with 50+ badges across 5 categories (sales, activity, time, streak, milestone)
- Created tiered achievement levels (bronze, silver, gold, platinum, diamond) with point-based progression
- Added agent leveling system with titles from "Rookie Agent" to "Legendary Realtor"
- Built performance streak tracking from 3-day streaks up to full year consistency rewards
- Designed achievement progress tracking with visual progress bars and unlock notifications
- Integrated real-time achievement calculations based on actual user performance data
- Added achievements page with trophy icon in sidebar navigation
- Expanded commission achievements from $1K to $1M+ with 12 different revenue milestones
- Enhanced activity tracking with 8 levels from first activity to 1,000+ client interactions
- Created comprehensive time tracking achievements from 10 hours to 2,000+ hours logged
- Added streak achievements for 3, 7, 14, 30, 60, 90, 180, and 365 consecutive days
- Built milestone achievements for week, month, quarter, half-year, and multi-year anniversaries

### Competitive Agent Leaderboard (August 2024)
- Built national agent ranking system with real-time performance comparisons
- Created top performer podium with gold/silver/bronze rankings and visual badges
- Implemented local competition tracking for agents in the same geographic area
- Added competitive challenges with weekly revenue sprints and activity contests
- Designed rank change indicators showing movement up/down from previous periods
- Built filtering system by overall performance, revenue, sales, and activity metrics
- Added user position highlighting within the competitive landscape
- Integrated leaderboard navigation with trophy icon in main sidebar