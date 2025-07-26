# Technology Stack & Build System

## Build System
- **Monorepo**: Turborepo for orchestrating builds and development
- **Package Manager**: Bun (specified in package.json)
- **Task Runner**: Turbo with parallel execution support

## Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: Redux Toolkit with React Redux
- **Routing**: React Router DOM v6
- **Linting**: ESLint with TypeScript and React plugins

## Backend Stack
- **Runtime**: Node.js with Bun for development
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis (optional)
- **Authentication**: JWT with bcryptjs for password hashing
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: Joi for request validation
- **Testing**: Jest with Supertest and MongoDB Memory Server

## Shared Packages
- **Types & Utilities**: `@finance-app/shared` with Zod validation
- **UI Components**: `@finance-app/ui` for reusable React components
- **Configuration**: `@finance-app/config` for shared settings

## External Integrations
- **Banking**: Plaid API for account and transaction data
- **Market Data**: External market data API for investment tracking
- **Email**: Configurable email service for notifications

## Common Commands

### Development
```bash
bun run dev          # Start all apps in development mode
bun run build        # Build all packages and apps
bun run lint         # Run linting across all packages
bun run test         # Run tests across all packages
bun run type-check   # TypeScript type checking
bun run clean        # Clean all build artifacts
```

### Database Management (Server)
```bash
bun run db:setup     # Initialize database
bun run db:seed      # Seed with sample data
bun run db:clear     # Clear all data
bun run db:indexes   # Create database indexes
bun run db:reset     # Reset database completely
bun run db:test      # Test database connection
```

## Development Ports
- **Client**: http://localhost:3000 (Vite dev server)
- **Server**: http://localhost:3001 (Express API)

## Environment Configuration
All environment variables are defined in `.env.example` and include database connections, API keys, authentication secrets, and service configurations.