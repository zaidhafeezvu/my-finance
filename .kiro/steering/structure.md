# Project Structure & Organization

## Monorepo Architecture

This is a Turborepo monorepo with a clear separation between applications and shared packages.

```
finance-app/
├── apps/                    # Applications
│   ├── client/             # React frontend (Vite + TypeScript)
│   └── server/             # Express.js backend (Node.js + TypeScript)
├── packages/               # Shared packages
│   ├── shared/            # Common types, utilities, constants
│   ├── ui/                # Reusable React components
│   └── config/            # Shared configuration
├── .kiro/                 # Kiro AI assistant configuration
├── turbo.json             # Turborepo task configuration
└── package.json           # Root workspace configuration
```

## Package Naming Convention

All packages use the `@finance-app/` namespace:
- `@finance-app/client` - Frontend application
- `@finance-app/server` - Backend application  
- `@finance-app/shared` - Shared utilities and types
- `@finance-app/ui` - UI component library
- `@finance-app/config` - Configuration package

## Workspace Dependencies

- Apps can depend on packages using `workspace:*` protocol
- Packages can depend on other packages in the monorepo
- External dependencies are managed at the appropriate level (root, app, or package)

## Build Dependencies

Turborepo manages build order automatically:
- Packages build before apps that depend on them
- `^build` dependency ensures upstream packages are built first
- Parallel execution where possible for independent tasks

## File Organization Patterns

### Apps Structure
- `src/` - Source code
- `dist/` - Build output
- `package.json` - App-specific dependencies and scripts
- `tsconfig.json` - TypeScript configuration

### Packages Structure  
- `src/` - Source code with `index.ts` as main export
- `dist/` - Compiled output
- `package.json` - Package metadata with proper exports
- `tsconfig.json` - TypeScript configuration for library builds

## Development Workflow

1. Root-level commands orchestrate all packages via Turborepo
2. Individual packages can be developed independently
3. Changes to shared packages automatically trigger rebuilds of dependent apps
4. Hot reloading works across the entire monorepo during development

## Configuration Files

- `.env` - Environment variables (not committed)
- `.env.example` - Template for required environment variables
- `turbo.json` - Turborepo task pipeline configuration
- `tsconfig.json` - Root TypeScript configuration
- Individual `tsconfig.json` files extend the root configuration