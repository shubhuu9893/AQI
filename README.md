# AirHealth India

AirHealth India is a full‑stack application that collects, aggregates and visualises real‑time air quality data for Indian cities. The project exposes a **FastAPI** REST API backed by an SQL database and Redis cache, while the front‑end is a responsive **React + Vite** single‑page app.

> **Why AirHealth?**  The name reflects our goal of providing *air quality health information* to the public so that people can make informed decisions about outdoor activities and health precautions.

## Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
-   - [Backend setup](#backend-setup)
-   - [Frontend setup](#frontend-setup)
- [Environment variables](#environment-variables)
- [Running tests](#running-tests)
- [Building for production](#building-for-production)
- [Deployment options](#deployment-options)
- [Contributing](#contributing)
- [License](#license)

## Features

| Feature | Description |
|---------|-------------|
| **Real‑time AQI** | Pulls data from AirVisual and OpenAQ APIs, stores in a PostgreSQL/SQLite database. |
| **Weather integration** | Fetches temperature, humidity, wind, etc., using OpenWeatherMap. |
| **Health risk scoring** | Calculates risk level (Low / Medium / High) based on EPA guidelines and custom heuristics. |
| **AI‑powered recommendations** | Uses Google Gemini to generate user‑friendly tips. |
| **Export reports** | Download CSV, JSON or PDF summaries for a chosen city and date range. |
| **Interactive map & charts** | Leaflet heatmap + Recharts visualisation of AQI over time and across locations. |

## Architecture

```
   ┌─────────────────────┐            ┌───────────────────────┐
   │  Front‑end (React)   │◀──────────▶│  Back‑end (FastAPI)    │
   └─────────────────────┘            └───────────────────────┘
                     ▲                               ▲
                     │                               │
                     │ REST / JSON API              │
                     ▼                               ▼
          ┌───────────────────────┐        ┌────────────────────────────┐
          │   PostgreSQL / SQLite  │◀──────▶│        Redis (cache)      │
          └───────────────────────┘        └────────────────────────────┘
```

*The API exposes a `/api` prefix for all endpoints. Static files from the built front‑end can be served by FastAPI’s `StaticFiles` when deployed in production.*

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.12, FastAPI, SQLAlchemy, Alembic, Redis, Pydantic‑Settings |
| Frontend | Node 20+, React 18, Vite 5, Leaflet, Recharts, Lucide Icons |
| DB | PostgreSQL (default), SQLite for quick dev setups |
| Caching | Redis (optional) |
| AI | Google Gemini (`google-genai`) |

## Prerequisites

- **Python 3.12** – backend
- **Node 20+** and npm – frontend
- **PostgreSQL** (or SQLite for a lightweight dev copy)
- Optional: **Redis** if you plan to use the cache layer.

## Getting started

```bash
# Clone the repository
git clone https://github.com/your-org/airhealth-india.git
cd airhealth-india
```

### Backend setup

```bash
# Create a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r Backend/requirements.txt

# Copy the example env file and adjust values (see section below)
cp Backend/.env.example Backend/.env

# Run database migrations (requires alembic)
alembic upgrade head

# Seed initial data if DB is empty
python Backend/scripts/load_sample_history.py

# Start the development server
uvicorn Backend.app.main:app --reload
```

The API will be available at `http://localhost:8000`.  Swagger UI can be accessed at `http://localhost:8000/docs`.

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The React app will open automatically in your browser at `http://localhost:5173`.  It talks to the backend running on port 8000.

## Environment variables

Create a file named `.env` inside the **Backend** directory (copy from `.env.example`). The following variables are required:

| Variable | Description |
|----------|-------------|
| `APP_NAME` | Name of the application. |
| `ENVIRONMENT` | `development`, `staging`, or `production`. |
| `PORT` | Backend port (default: 8000). |
| `DATABASE_URL` | SQLAlchemy database URL (e.g., `postgresql://user:pass@localhost/db`). |
| `REDIS_URL` | Redis connection string. Optional if caching is disabled. |
| `ALLOWED_ORIGINS` | Comma‑separated list of CORS origins or `*`. |
| API keys:
  - `AIRVISUAL_API_KEY`, `AIRVISUAL_API_URL`
  - `OPENAQ_API_KEY`, `OPENAQ_API_URL`
  - `WEATHER_API_KEY` / `OPENWEATHERMAP_API_KEY`, `WEATHER_API_URL`
  - `GEMINI_API_KEY`, `GEMINI_MODEL`
| `FCM_SERVER_KEY` | Firebase Cloud Messaging server key (optional). |

For local development you can set dummy values or use the free tiers of the external APIs.

## Running tests

Backend unit tests are located under `Backend/tests`. Run them with:

```bash
cd Backend
pytest
```

Frontend tests (if any) can be run from the `frontend` directory using `npm test`.

## Building for production

1. **Build the front‑end**
   ```bash
   cd frontend
   npm run build
   ```
   This generates a static `dist/` folder.
2. **Serve static files from FastAPI** – add the following to `Backend/app/main.py` after creating the app (or keep it in a separate file) and uncomment it:
   ```python
   from fastapi.staticfiles import StaticFiles

   app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")
   ```
3. **Deploy** – Run the backend normally (`uvicorn Backend.app.main:app`) and it will serve the built React files.

Alternatively, deploy the front‑end and back‑end as separate services behind a reverse proxy (NGINX, Traefik, etc.).

## Deployment options

- **Docker** – Not included by default but easy to add: expose ports 8000 (API) and serve static files from `/dist`. 
- **Heroku / Render / Railway** – Simply point the build scripts at the repo; ensure environment variables are set in the platform.
- **Serverless** – FastAPI can be exported as an ASGI app to AWS Lambda or Cloudflare Workers via tools like `Mangum` or `Cloudflare Workers + Python`.

## Contributing

We welcome contributions!  Please open a pull request and follow the existing style conventions:

- Use type annotations throughout the codebase.
- Run `flake8`, `black` and `isort` (available in `Backend/requirements.txt`).
- Keep tests up‑to‑date – add them for any new feature or bug fix.
"""
