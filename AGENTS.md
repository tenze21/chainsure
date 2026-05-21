# Repository Guidelines

## Project Structure & Module Organization

This repository has three main work areas:

- `client/`: React 19 + Vite frontend. Source is in `client/src`; pages are in `src/pages`, UI in `src/components`, hooks in `src/hooks`, API/utilities in `src/lib`, and assets in `src/assets` or `public`.
- `server/`: Express + TypeScript API. Source is in `server/src`, grouped by controllers, routes, services, middleware, database, config, and shared libs.
- `contract/`: Foundry contracts. Solidity files are in `contract/src`, scripts in `contract/script`, and tests in `contract/test`.

Do not edit generated outputs such as `client/dist`, `server/dist`, or dependency folders.

## Build, Test, and Development Commands

Run commands from the relevant package directory.

- `cd client && pnpm run dev`: start Vite.
- `cd client && pnpm run build`: create the production bundle.
- `cd client && pnpm run lint`: run frontend ESLint.
- `cd server && pnpm run dev`: start the API with `tsx watch`.
- `cd server && pnpm run build`: compile TypeScript and rewrite aliases.
- `cd server && pnpm run start`: run `dist/index.js`.
- `cd server && pnpm run lint`: run backend ESLint.
- `cd contract && forge build`: compile smart contracts.
- `cd contract && forge test`: run Solidity tests.

## Coding Style & Naming Conventions

Use the existing style in each area. Client files use JSX, ES modules, two-space indentation, and PascalCase component filenames such as `AdminClaimsReview.jsx`. Server code uses TypeScript, ES modules, aliases such as `@/lib/types`, and kebab-case filenames such as `auth-service.ts`. Keep controllers thin and put business logic in services.

## Testing Guidelines

The contract package uses Foundry; add tests under `contract/test` and run `forge test`. The client and server do not currently define JS test scripts, so run the affected `pnpm run build` and `pnpm run lint` commands before opening a PR.

## Commit & Pull Request Guidelines

History includes conventional commits, for example `fix: typescript build error`, plus short task summaries. Prefer concise imperative messages like `fix: resolve server build aliases`.

Pull requests should include a summary, commands run, linked issue or task, and screenshots for visible UI changes. Call out migrations, new environment variables, contract deployment needs, and skipped checks.

## Security & Configuration Tips

Do not commit secrets or private keys. Server startup requires environment values for database, Stripe, RPC, Pinata, JWT, and contract settings. Use local `.env.development` files for development and deployment-managed secrets for production.
