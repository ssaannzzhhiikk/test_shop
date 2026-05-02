# Flimod Catalog Demo

Educational full-stack ecommerce catalog demo built with React, Vite, TailwindCSS, FastAPI, PostgreSQL, SQLAlchemy, and Pydantic.

This project does not copy Flimod branding, logos, exact UI, or claim any ownership. It is a demo scaffold that may later use a public external catalog API only as a product data source.

## Stack

- Frontend: React, Vite, JavaScript/JSX, TailwindCSS
- Backend: FastAPI, PostgreSQL, SQLAlchemy, Pydantic
- Future payment integration: Stripe Checkout test mode

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

## Database Setup

Start PostgreSQL:

```bash
docker compose up -d postgres
```

The default database URL is:

```text
postgresql+psycopg://postgres:postgres@localhost:5432/flimod_catalog_demo
```

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
