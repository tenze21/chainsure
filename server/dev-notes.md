# For Developer reference only

## Database setup.

1. Run docker
2. Open terminal in [server directory](/server/)
3. execute `docker compose up -d`
4. You can view the database with pgAdmin on `http://localhost:5050`
5. Run the migrations with `pnpm db:migrate`
6. Run the seeders with `pnpm db:seed:all`

## Server setup.

1. Open terminal in [server directory](/server/)
2. execute `pnpm i` to install dependencies.
3. Create a `.env.development` file in server directory and include the following content.

```
  # Application
  NODE_ENV=development
  PORT=3000

  # Database
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=chainsure_dev
  DB_USER=user
  DB_PASSWORD=password

  # JWT
  JWT_SECRET=12ef92443facccc398ae2c34fc75521942df95762fa42083

  # CORS
  CORS_ORIGIN=http://localhost:5173/

  # Rate Limiting
  RATE_LIMIT_WINDOW_MS=900000
  RATE_LIMIT_MAX_REQUESTS=100

  # Logging
  LOG_LEVEL=debug

  # Stripe
  STRIPE_SECRET_KEY=
  STRIPE_WEBHOOK_SECRET=

  # ETHEREUM
  RPC_URL=
  PRIVATE_KEY=
  PUBLIC_KEY=
  CONTRACT_ADDRESS=

  # PINATA
  PINATA_API_KEY=
  PINATA_API_SECRET=
  PINATA_JWT=
  PINATA_GATEWAY=
  HEALTH_INSURANCE_IMAGE_CID=
  PROPERTY_INSURANCE_IMAGE_CID=
  VEHICLE_INSURANCE_IMAGE_CID=
```

3. execute `pnpm dev` to start server.

## Calling contract functions

### Get owner of a token

```
  cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "ownerOf(uint256)(address)" 0
```

### Get a token signature

```
 cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "getPolicySignature(uint256)(string)" 0
```

### Check if token is valid

```
 cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "isPolicyInvalid(uint256)(bool)" 0
```
