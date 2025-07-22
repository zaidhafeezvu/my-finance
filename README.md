# Finance App

A comprehensive personal finance management platform built with the MERN stack in a Turborepo monorepo structure.

## Features

- 🏦 Bank account integration with Plaid
- 💳 Transaction tracking and categorization
- 📊 Budget creation and monitoring
- 📈 Investment portfolio tracking
- 💰 Bill management and reminders
- 📋 Financial reports and analytics
- 🎯 Goal setting and progress tracking

## Tech Stack

- **Frontend**: React, TypeScript, Redux Toolkit, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB, Redis
- **Monorepo**: Turborepo
- **Authentication**: JWT
- **External APIs**: Plaid (banking), Market data APIs

## Project Structure

```
finance-app/
├── apps/
│   ├── client/          # React frontend application
│   └── server/          # Express.js backend application
├── packages/
│   ├── shared/          # Shared types, utilities, and constants
│   ├── ui/              # Shared UI components
│   └── config/          # Shared configuration
├── turbo.json           # Turborepo configuration
├── package.json         # Root package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Redis (optional, for caching)

### Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your configuration
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start all applications in development mode:
```bash
npm run dev
```

This will start:
- Client app on http://localhost:3000
- Server app on http://localhost:3001

### Build

Build all applications:
```bash
npm run build
```

### Other Commands

- `npm run lint` - Run linting across all packages
- `npm run test` - Run tests across all packages
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean all build artifacts

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.