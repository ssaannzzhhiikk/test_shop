# Flimod Catalog Demo

Educational full-stack ecommerce catalog demo built with React, Vite, TailwindCSS, FastAPI, PostgreSQL, SQLAlchemy, Pydantic, and Stripe Checkout test mode.

This project does not copy Flimod branding, logos, exact UI, or claim any ownership. It may use a public external catalog API only as a product data source.

## Stack

- Frontend: React, Vite, JavaScript/JSX, TailwindCSS, React Router, Axios
- Backend: FastAPI, PostgreSQL, SQLAlchemy, Pydantic, JWT auth
- Payments: Stripe Checkout test mode

## Environment Files

Backend:

```bash
cd backend
copy .env.example .env
```

Frontend:

```bash
cd frontend
copy .env.example .env
```

Default local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8000
Database: postgresql+psycopg://postgres:postgres@localhost:5432/flimod_catalog_demo
```

## Run Commands

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Install and run the backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m compileall app
uvicorn app.main:app --reload
```

Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

If PowerShell blocks `npm.ps1`, use:

```bash
npm.cmd install
npm.cmd run dev
```

## Seed Admin And Sync Products

Create a local admin user by setting these values in `backend/.env`:

```env
CREATE_DEV_ADMIN=true
DEV_ADMIN_EMAIL=admin@example.com
DEV_ADMIN_PASSWORD=change-me-admin-password
DEV_ADMIN_FULL_NAME=Local Admin
```

Restart the backend, then log in:

```bash
curl -X POST http://localhost:8000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"change-me-admin-password\"}"
```

Use the returned token to sync external catalog products:

```bash
curl -X POST http://localhost:8000/api/products/sync-external ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

`GET /api/products` also auto-syncs from the external catalog if the database has fewer than 20 products.

External catalog defaults:

```text
https://flimod.com/api/v1/catalog/women
categories=женщины
offset=0
limit=24
priceMin=5000
priceMax=10000000
sort=date,desc
```

## API Endpoints

Health:

```text
GET /health
```

Auth:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Products:

```text
GET  /api/products
GET  /api/products/{id}
POST /api/products/sync-external
```

Orders and payments:

```text
POST /api/orders
GET  /api/orders/me
POST /api/payments/create-checkout-session
POST /api/payments/webhook
```

`GET /api/products` supports `search`, `brand`, `category`, `priceMin`, `priceMax`, `offset`, `limit`, and `sort`.

## Stripe Test Mode

The app uses Stripe-hosted Checkout only. It does not collect card data manually.

Add test credentials to `backend/.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_local_webhook_secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

Forward local webhook events with the Stripe CLI:

```bash
stripe listen --events checkout.session.completed --forward-to localhost:8000/api/payments/webhook
```

Copy the `whsec_...` value printed by the CLI into `STRIPE_WEBHOOK_SECRET`, then restart FastAPI. Use Stripe test card `4242 4242 4242 4242` with any future expiry date and CVC.

## Frontend Routes

```text
/
/catalog
/products/:id
/cart
/login
/register
/profile
/checkout/success
/checkout/cancel
```

## Common Troubleshooting

- `python` is not recognized: install Python 3.11+ and enable "Add Python to PATH", then reopen the terminal.
- `npm.ps1 cannot be loaded`: run `npm.cmd install` and `npm.cmd run dev`, or change your PowerShell execution policy for local scripts.
- Backend CORS error: open the frontend at `http://localhost:5173` or keep `BACKEND_CORS_ORIGINS` including both `http://localhost:5173` and `http://127.0.0.1:5173`.
- Database connection refused: run `docker compose up -d postgres` and verify port `5432` is free.
- Missing columns after code changes: this demo uses `create_all`, not migrations. Recreate the local Postgres volume or add Alembic migrations before continuing.
- External catalog returns no products: check internet access and try `POST /api/products/sync-external` with an admin token.
- Stripe Checkout fails: verify `STRIPE_SECRET_KEY` starts with `sk_test_`, restart the backend, and check the backend logs.
- Order stays pending after payment: run the Stripe CLI webhook forwarder and make sure `STRIPE_WEBHOOK_SECRET` matches the printed `whsec_...` value.

## Notes

- Database tables are created on FastAPI startup for this demo.
- Use Alembic migrations before treating this as a production-style app.
- Footer disclaimer in the UI states that this is an educational demo and is not affiliated with Flimod.
