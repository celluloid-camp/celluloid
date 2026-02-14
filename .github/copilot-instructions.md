# GitHub Copilot Instructions for Celluloid

## Project Overview

Celluloid is a collaborative video annotation application designed for educational purposes. It allows teachers to import PeerTube videos, select educational objectives, annotate videos, share them with students, collect answers, and respond to questions.

## Tech Stack

### Core Technologies
- **Frontend**: Next.js 15+ with React 19+, TypeScript
- **Styling**: Material-UI (MUI) v6+ with Emotion
- **Backend**: Next.js API routes with tRPC for type-safe APIs
- **Database**: PostgreSQL 13+ with Prisma ORM
- **Queue**: Prisma-based queue system (@mgcrea/prisma-queue) for background jobs
- **Storage**: S3-compatible storage (Minio)
- **Authentication**: better-auth
- **Video Processing**: Custom vision package for video analysis
- **Email**: Nodemailer for transactional emails

### Build & Dev Tools
- **Package Manager**: Bun (for workspace support and fast installs)
- **Monorepo**: Turborepo for build orchestration
- **Linting & Formatting**: Biome (configured in `biome.json`)
- **Testing**: Playwright for E2E tests
- **Commit Conventions**: Conventional commits with commitlint
- **Git Hooks**: Husky for pre-commit hooks

## Project Structure

This is a Bun monorepo with the following structure:

### Apps (`apps/`)
- **web**: Main Next.js application (frontend and API)
- **worker**: Background job processor using @mgcrea/prisma-queue

### Packages (`packages/`)
- **auth**: Authentication logic using better-auth
- **config**: Shared configuration
- **emails**: Email templates and sender
- **prisma**: Database schema and Prisma client
- **queue**: Prisma-based queue system using @mgcrea/prisma-queue
- **trpc**: tRPC router definitions and procedures
- **types**: Shared TypeScript types
- **utils**: Shared utility functions
- **vision**: Video processing and analysis

## Coding Standards

### Code Style
- Use **Biome** for linting and formatting (not Prettier or ESLint)
- Run `bun run lint` to check and auto-fix issues
- Indentation: 2 spaces
- Quotes: Double quotes for JavaScript/TypeScript
- TypeScript strict mode is enabled

### TypeScript Guidelines
- Prefer type inference over explicit types when obvious
- Use `const` assertions where appropriate
- Avoid `any` type; use `unknown` if type is truly unknown
- No parameter reassignment (`noParameterAssign` rule enabled)
- Use namespace keyword instead of module (`useNamespaceKeyword`)

### Code Organization
- Keep components small and focused
- Use composition over inheritance
- Follow the existing file structure in each package
- Place shared code in appropriate packages, not in apps

### Naming Conventions
- Components: PascalCase
- Files: kebab-case or PascalCase for components
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE for true constants
- Types/Interfaces: PascalCase

## Development Workflow

### Initial Setup
```bash
bun install
cp env.sample .env
# Edit .env with your configuration
docker compose up  # Start PostgreSQL, Redis, Minio
bun run dev        # Start development servers
```

### Common Commands
- `bun run dev` - Start all apps in watch mode
- `bun run build` - Build all packages and apps
- `bun run lint` - Run Biome linter/formatter
- `bun run test` - Run Playwright E2E tests
- `bun run clean` - Clean build artifacts
- `bun run web` - Run commands in web app workspace
- `bun run db` - Run commands in db workspace
- `bunx prisma` - Run Prisma commands

### Working with Workspaces
To run commands in specific workspaces:
```bash
bun run --filter web <command>
bun run --filter @celluloid/db <command>
```

### Database Migrations
```bash
bunx prisma migrate dev
bunx prisma generate
```

## Git Commit Guidelines

Use conventional commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example: `feat(auth): add password reset functionality`

Commits are automatically validated with commitlint via Husky hooks.

## Testing

### E2E Testing with Playwright
- Test files are in `tests/` directory
- Configuration in `playwright.config.ts`
- Run tests: `bun run test`
- Generate test code: `bun run test:codegen`

### Writing Tests
- Test user workflows, not implementation details
- Use data-testid attributes for reliable selectors
- Ensure tests are independent and can run in any order
- Clean up test data after tests complete

## Architecture Patterns

### tRPC Procedures
- Define routers in `packages/trpc/src/routers/`
- Use `protectedProcedure` for authenticated endpoints
- Use `publicProcedure` for public endpoints
- Input validation with Zod schemas
- Type-safe from frontend to backend

### Database Access
- Use Prisma client from `@celluloid/db`
- Follow Prisma best practices
- Use transactions for related operations
- Handle errors appropriately

### Background Jobs
- Define jobs in `packages/queue/src/`
- Process jobs in `apps/worker/`
- Use @mgcrea/prisma-queue for job management (Prisma-based queue system)

### State Management
- Use React hooks for local state
- Use tRPC for server state
- Minimize global state

## Environment Variables

Key environment variables used in the codebase:
- Database: `DATABASE_URL`
- Redis: `REDIS_URL`
- Storage: `STORAGE_URL`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`
- Auth: `AUTH_SECRET`, `BASE_URL`
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_EMAIL_FROM`
- Other: `NODE_ENV`, `MISTRAL_API_KEY` (optional)

Use `.env` file for local development (copy from `env.sample`).

**Note**: While `turbo.json` lists some environment variables for build caching, the actual variables used in the code are defined in the environment validation schemas in each package (`packages/auth/src/env.ts`, `packages/queue/src/env.ts`, etc.).

## Important Notes

### Dependencies
- Always use `bun` for package management
- Add dependencies to the appropriate workspace package
- Run `bun install` at the root to update all workspaces

### Docker
- Production deployment uses Docker with multi-stage builds
- Development can use Docker Compose for services
- Configuration in `Dockerfile`, `docker-compose.yml`, and `stack.yml`

### Internationalization
- Using inlang for translations
- Translation files in `locales/` directory

## Best Practices

1. **Minimal Changes**: Make the smallest possible changes to accomplish the goal
2. **Type Safety**: Leverage TypeScript's type system; avoid type assertions when possible
3. **Error Handling**: Always handle errors gracefully with appropriate user feedback
4. **Security**: Never commit secrets; use environment variables
5. **Performance**: Consider performance implications, especially for video processing
6. **Accessibility**: Ensure UI components are accessible (use MUI's built-in accessibility features)
7. **Testing**: Write or update tests when modifying functionality
8. **Documentation**: Update documentation when changing public APIs or significant behavior

## Getting Help

- Check existing issues and discussions on GitHub
- Review the README.md for setup instructions
- Consult the documentation in `docs/` directory
- The project actively welcomes community contributions
