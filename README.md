# EliteKPI v2 - Real Estate Management System

A comprehensive real estate management platform built with React, TypeScript, and Express.js. This application provides real estate professionals with tools to manage properties, track commissions, analyze market data, and monitor performance metrics.

## Features

### 🏠 Property Management
- Property listing and tracking
- Property details and documentation
- Market value analysis
- Property performance metrics

### 💰 Financial Tracking
- Commission tracking and calculations
- Expense management and categorization
- Revenue analytics
- Financial performance dashboards

### 📊 Analytics & Reporting
- Real-time dashboard with key metrics
- Market analysis and timing insights
- Performance tracking and KPI monitoring
- Comprehensive reporting tools

### 🎯 Goal Management
- Task management system
- Achievement tracking
- Goal setting and monitoring
- Activity logging

### 🔍 Market Intelligence
- Market timing analysis
- Seasonal trends
- Demographics data
- Inventory level tracking
- Price analysis

### ⏰ Time & Productivity
- Time tracking for activities
- Mileage logging
- Productivity metrics
- Task prioritization

## Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Recharts** - Data visualization
- **React Router** - Client-side routing

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type-safe server development
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Primary database (Neon)
- **Express Session** - Session management

### External APIs
- **ATTOM Data API** - Real estate market data
- **OpenAI API** - AI-powered analysis
- **Stripe** - Payment processing
- **Redfin** - Additional market data

## Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (we recommend Neon)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/EliteKPIv2.git
   cd EliteKPIv2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="your_postgresql_connection_string"
   
   # Session
   SESSION_SECRET="your_super_secret_session_key"
   
   # API Keys
   ATTOM_API_KEY="your_attom_api_key"
   OPENAI_API_KEY="your_openai_api_key"
   STRIPE_SECRET_KEY="your_stripe_secret_key"
   VITE_STRIPE_PUBLIC_KEY="your_stripe_public_key"
   
   # Development (optional)
   NODE_ENV="development"
   PORT="5000"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
elitekpi-code/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── types/          # TypeScript type definitions
│   └── index.html
├── server/                 # Backend Express application
│   ├── db/                 # Database schema and migrations
│   ├── routes.ts           # API routes
│   ├── index.ts            # Server entry point
│   └── *.ts                # Various server modules
├── shared/                 # Shared types and utilities
└── public/                 # Static assets
```

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Login redirect

### Properties
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Financial
- `GET /api/commissions` - List commissions
- `GET /api/expenses` - List expenses
- `GET /api/dashboard/metrics` - Dashboard metrics

### Market Data
- `GET /api/market-timing/*` - Market analysis endpoints
- `GET /api/market-intelligence` - Market intelligence data

### Tasks & Goals
- `GET /api/tasks` - List tasks
- `GET /api/achievements` - List achievements
- `GET /api/goals` - List goals

## Development

### Database Changes
When making database schema changes:
1. Update the schema in `server/db/schema.ts`
2. Run `npm run db:push` to apply changes
3. Use `npm run db:studio` to view/edit data

### Adding New Features
1. Create components in `client/src/components/`
2. Add API routes in `server/routes.ts`
3. Update types in `shared/types.ts`
4. Add navigation in the sidebar component

## Deployment

### Environment Setup
1. Set up a PostgreSQL database (recommend Neon)
2. Configure all environment variables in your hosting platform
3. Build the application: `npm run build`
4. Start the server: `npm run start`

### Recommended Hosting
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Heroku
- **Database**: Neon, Supabase, PlanetScale

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@elitekpi.com or join our Slack channel.

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Powered by [ATTOM Data](https://www.attomdata.com/)
- AI features by [OpenAI](https://openai.com/)
- Database by [Neon](https://neon.tech/)
