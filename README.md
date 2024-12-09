# Node Typescript ESM

Opinionated project template for a Node.js & TypeScript apps with native ESM

## Stacks

- Node.js 18+
- TypeScript 5+
- Native ESM Modules 
- [tsx: Node.js enhanced to run TypeScript & ESM files](https://github.com/privatenumber/tsx)
- [tsc-alias: Import path alias using `@/` prefix](https://github.com/justkey007/tsc-alias) 
- Hono.js
- Kysely for query Builder & migrations
- Pino for logging
- RabbitMQ for job queue
- ESLint & Prettier — linting & formatting
- [jsx-email](https://github.com/shellscape/jsx-email) for email templating
- vitest for testing
- znv for type safe env
- Faker for generate fake data
- dayjs for handling date-time

## Quick Start

### 1. Clone repo

clone repo without commit history

```bash
git clone --depth=1 https://github.com/ibnumusyaffa/node-ts-esm-starter my-project-name
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```


## Available scripts

- `npm run dev` - Starts the application in development mode at.
- `npm run build` - Compile the application.
- `npm start` - Starts the application in production mode.
- `npm run lint` - Check code using ESLint.
- `npm run lint:fix` - Fix autofixable ESLint problem.
- `npm run format:all` - Format code using Prettier for all files.
- `npm run format:check` - Check code format using prettier.

## Kysely/migration scripts

- `npx kysely migrate:down` - Undo the last/specified migration that was run.
- `npx kysely migrate:latest` - Update the database schema to the latest version.
- `npx kysely migrate:list` - List both completed and pending migrations.
- `npx kysely migrate:make` - Create a new migration file.
- `npx kysely migrate:rollback` - Rollback all the completed migrations.
- `npx kysely seed:run` - Run seed files.
- `npx kysely seed:make` - Create a new seed file.
- `npx kysely migrate:up` - Run the next migration that has not yet been run.
- `npx kysely migrate` - Migrate the database schema.
- `npx kysely seed` - Populate your database with test or seed data independent of your migration files
