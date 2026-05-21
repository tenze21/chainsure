# ChainSure

ChainSure is a blockchain-based insurance prototype that combines a familiar Web2 insurance experience with blockchain-backed policy ownership. Users register with email/password, submit insurance proposals, pay premiums through Stripe, and receive policy records that can be represented as ERC-721 NFTs. Administrators manage policy templates, review proposals and claims, issue policies, and invalidate policies when needed.

The project is based on a hybrid Web 2.5 architecture: sensitive user and policy data stays off-chain in PostgreSQL, while policy ownership and integrity references are recorded through an Ethereum smart contract.

## Project Goals

- Provide verifiable insurance policy ownership using NFTs.
- Hide blockchain complexity from policyholders through normal web login and card payments.
- Keep private insurance data off-chain while storing hashes/signatures for verification.
- Support admin workflows for policy templates, proposal review, claims review, and revocation.
- Demonstrate a practical prototype for the Bhutanese insurance ecosystem.

## Repository Structure

```text
.
├── client/      # React + Vite frontend
├── server/      # Express + TypeScript API, Sequelize models, migrations
├── contract/    # Foundry Solidity smart contract project
├── AGENTS.md    # Contributor guidelines
└── README.md
```

Key implementation areas:

- `client/src/pages`: public pages, dashboard pages, admin pages, proposal forms.
- `client/src/components`: shared UI including admin layout and Stripe payment modal.
- `client/src/lib`: API clients, session helpers, dashboard configuration, Stripe helpers.
- `server/src/routes`: API route definitions.
- `server/src/controllers`: request handlers.
- `server/src/services`: Stripe, blockchain, payment, authentication, Pinata, and webhook logic.
- `server/src/database`: Sequelize models, migrations, and seeders.
- `contract/src/ChainSureToken.sol`: ERC-721 policy token contract.

## Features

### Policyholder

- Register and sign in with email/password.
- Generate and store wallet-related registration data.
- Browse policy products and templates.
- Submit proposals for health, property, and motor insurance.
- View submitted proposals, active policies, claims, and profile details.
- Initiate policy payments through Stripe.
- File claims against owned policies.

### Administrator

- Register/sign in through admin auth routes.
- Create and update policy categories and templates.
- Review proposals and issue policies.
- View active policies.
- Approve or reject claims.
- Revoke/invalidate policies.

### Blockchain

- ERC-721 policy NFT contract.
- Owner-controlled policy issuance.
- Policy signature storage by token ID.
- Policy invalidation status by token ID.
- Foundry-based contract build, test, and deployment scripts.

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS, React Router, Stripe.js, Viem.
- Backend: Node.js, Express 5, TypeScript, Sequelize, PostgreSQL, JWT, Stripe, Pino, Zod.
- Smart contract: Solidity, OpenZeppelin ERC-721, Foundry.
- Storage/integrations: PostgreSQL, Stripe webhooks, Pinata/IPFS metadata support, Ethereum RPC.

## Prerequisites

Install the following:

- Node.js and pnpm
- Docker and Docker Compose
- Foundry (`forge`, `cast`, `anvil`)
- Stripe CLI, if testing webhooks locally
- Access to an Ethereum RPC endpoint, for example Anvil or Sepolia

## Flow chart
![](/docs/flow_chart.png)
## Environment Variables

The server loads `.env.development` by default and `.env.production` when `NODE_ENV=production`.

Create `server/.env.development`:

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

DB_HOST=localhost
DB_PORT=5432
DB_USER=user
DB_PASSWORD=password
DB_NAME=chainsure_dev

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:5173

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

PRIVATE_KEY=0x...
PUBLIC_KEY=0x...
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

PINATA_API_KEY=...
PINATA_API_SECRET=...
PINATA_JWT=...
PINATA_GATEWAY=...

HEALTH_INSURANCE_IMAGE_CID=...
PROPERTY_INSURANCE_IMAGE_CID=...
VEHICLE_INSURANCE_IMAGE_CID=...
```

Optional frontend variables can be placed in `client/.env.development`:

```env
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_TEMPLATE_ID_LIFE=<template-id>
VITE_TEMPLATE_ID_TRAVEL=<template-id>
VITE_TEMPLATE_ID_MOTOR=<template-id>
```

During local Vite development, API requests are proxied to `http://localhost:3000`, so `VITE_API_URL` is mainly needed for production builds.

## Setup Instructions

### 1. Install dependencies

```bash
cd client
pnpm install

cd ../server
pnpm install

cd ../contract
forge install
```

### 2. Start PostgreSQL

```bash
cd server
docker compose up -d
```

PostgreSQL runs on port `5432` with the default credentials used in the example env file. pgAdmin is available at `http://localhost:5050`.

### 3. Run database migrations and seeders

```bash
cd server
pnpm run db:migrate
pnpm run db:seed:all
```

Useful database commands:

```bash
pnpm run db:migrate:status
pnpm run db:migrate:undo
pnpm run db:seed:undo:all
```

### 4. Start a local blockchain

In a separate terminal:

```bash
cd contract
make anvil
```

Deploy the contract locally:

```bash
cd contract
make deploy
```

Copy the deployed contract address into `server/.env.development` as `CONTRACT_ADDRESS`.

### 5. Start the backend

```bash
cd server
pnpm run dev
```

The API runs at `http://localhost:3000`.

### 6. Start the frontend

```bash
cd client
pnpm run dev
```

The frontend runs at `http://localhost:5173`.

## Stripe Webhook Testing

The backend webhook endpoint is:

```text
POST /api/stripe/webhooks
```

For local testing, forward Stripe events to the backend:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

Use the generated webhook signing secret as `STRIPE_WEBHOOK_SECRET`.

## Common Commands

### Client

```bash
pnpm run dev      # start Vite dev server
pnpm run build    # production build
pnpm run lint     # lint frontend code
pnpm run preview  # preview built frontend
```

### Server

```bash
pnpm run dev       # start API with tsx watch
pnpm run build     # compile TypeScript and rewrite path aliases
pnpm run start     # run dist/index.js
pnpm run lint      # lint backend code
```

### Contract

```bash
forge build        # compile contracts
forge test         # run Solidity tests
forge snapshot     # gas snapshot
forge fmt          # format Solidity files
make deploy        # deploy using Makefile network settings
```

## API Overview

Main API groups:

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- `POST /api/auth/register/admin`, `POST /api/auth/login/admin`
- `GET /api/template`, `POST /api/template`, `PATCH /api/template/:id`
- `GET /api/template/category`, `POST /api/template/category`
- `POST /api/proposal/:templateId`, `GET /api/proposal/user`, `GET /api/proposal/admin`
- `POST /api/policy/:proposalId`, `GET /api/policy/all`, `PATCH /api/policy/:policyId`
- `POST /api/stripe/payments/initiate/:policyId`
- `POST /api/claim/:policyId`, `GET /api/claim`, `PATCH /api/claim/approve/:claimId`, `PATCH /api/claim/reject/:claimId`
- `GET /api/explorer/:tokenId`

Most proposal, policy, user, claim, subscription, and payment routes require authentication. Admin-only routes also require the authenticated user to have the `admin` role.

## Build and Deployment Notes

Build the frontend:

```bash
cd client
pnpm run build
```

Build the backend:

```bash
cd server
pnpm run build
pnpm run start
```

For production:

- Set `NODE_ENV=production`.
- Provide `server/.env.production` or deployment-managed environment variables.
- Set `client/.env.production` with `VITE_API_URL` pointing to the deployed API.
- Run database migrations before starting the API.
- Use a deployed contract address and production RPC endpoint.
- Configure Stripe webhook forwarding to `/api/stripe/webhooks`.

## Security Notes

- Never commit private keys, JWT secrets, Stripe keys, Pinata credentials, or production env files.
- Private keys should never be sent to the backend in plain text.
- Sensitive policy documents should remain off-chain; store only hashes, signatures, and metadata references on-chain.
- Use testnet or local Anvil keys for development only.

## Current Limitations

- Claim settlement is not automated with oracles; admins manually approve or reject claims.
- Fiat payments are handled through Stripe; the system does not manage crypto claim reserves.
- If a user loses their encryption passphrase, recovery is handled operationally through revoke/reissue flows rather than cryptographic recovery.
- This is a technical prototype and not a licensed insurance or financial product.
