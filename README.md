# Flimod Catalog Demo

Educational full-stack ecommerce catalog demo built with React, Vite, TailwindCSS, FastAPI, PostgreSQL, SQLAlchemy, and Pydantic.

This project does not copy Flimod branding, logos, exact UI, or claim any ownership. It is a demo scaffold that may later use a public external catalog API only as a product data source.

## Stack

- Frontend: React, Vite, JavaScript/JSX, TailwindCSS
- Backend: FastAPI, PostgreSQL, SQLAlchemy, Pydantic
- Payments: Stripe Checkout test mode

## Project Structure

```text
backend/
  app/
    main.py
    config.py
    database.py
    models.py
    schemas.py
    dependencies.py
    routers/
    services/
  requirements.txt
  .env.example
frontend/
  src/
    main.jsx
    App.jsx
    api/
    context/
    pages/
    components/
  package.json
  .env.example
docker-compose.yml
README.md
```

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

The backend health endpoint is available at:

```text
http://localhost:8000/health
```

## Product Catalog Sync

The backend can sync demo product data from the public external catalog API:

```text
https://flimod.com/api/v1/catalog/women
```

Default sync parameters:

```text
categories=женщины
offset=0
limit=24
priceMin=5000
priceMax=10000000
sort=date,desc
```

Manual catalog sync is admin-only. Start PostgreSQL and the backend, log in as an admin, then run:

```bash
curl -X POST http://localhost:8000/api/products/sync-external ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Catalog endpoints:

```text
GET  http://localhost:8000/api/products
GET  http://localhost:8000/api/products/{id}
POST http://localhost:8000/api/products/sync-external
```

`GET /api/products` supports `search`, `brand`, `category`, `priceMin`, `priceMax`, `offset`, `limit`, and `sort`. If the local database has fewer than 20 products, the API will try to sync from the external catalog before returning results.

## Authentication

Auth endpoints:

```text
POST http://localhost:8000/api/auth/register
POST http://localhost:8000/api/auth/login
GET  http://localhost:8000/api/auth/me
```

Register a user:

```bash
curl -X POST http://localhost:8000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"user@example.com\",\"password\":\"password123\",\"full_name\":\"Demo User\"}"
```

Log in:

```bash
curl -X POST http://localhost:8000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"user@example.com\",\"password\":\"password123\"}"
```

Use the returned `access_token` with `/me`:

```bash
curl http://localhost:8000/api/auth/me ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

For local development, create an admin user on backend startup by copying `backend/.env.example` to `backend/.env` and setting:

```env
CREATE_DEV_ADMIN=true
DEV_ADMIN_EMAIL=admin@example.com
DEV_ADMIN_PASSWORD=change-me-admin-password
DEV_ADMIN_FULL_NAME=Local Admin
```

Restart the backend, then log in with those credentials and use that token for admin-only endpoints.

## Orders And Stripe Checkout

Order and payment endpoints:

```text
POST http://localhost:8000/api/orders
GET  http://localhost:8000/api/orders/me
POST http://localhost:8000/api/payments/create-checkout-session
POST http://localhost:8000/api/payments/webhook
```

Stripe is used in test mode only. The app redirects customers to Stripe-hosted Checkout and does not collect card details manually.

Add these values to `backend/.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_local_webhook_secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

Install backend dependencies after adding Stripe:

```bash
cd backend
pip install -r requirements.txt
```

For local webhook testing, install and log in to the Stripe CLI, then forward Checkout events:

```bash
stripe listen --events checkout.session.completed --forward-to localhost:8000/api/payments/webhook
```

Copy the `whsec_...` value printed by the Stripe CLI into `STRIPE_WEBHOOK_SECRET`, then restart the backend. Use Stripe test card `4242 4242 4242 4242` with any future expiry date and CVC on the hosted Checkout page.

## Database Setup

Start PostgreSQL:

```bash
docker compose up -d postgres
```

The default database URL is:

```text
postgresql+psycopg://postgres:postgres@localhost:5432/flimod_catalog_demo
```

This demo uses `create_all` on startup instead of migrations. If you already started an older local database before schema fields were added, recreate the local Postgres volume or add proper migrations before running the updated backend.

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## Notes

- Payment is intentionally not implemented yet.
- Database tables are created on FastAPI startup for the demo skeleton.
- Use migrations such as Alembic before turning this into a production-style app.
