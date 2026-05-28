# ERP Referral System — Docker setup

Referral program management built with React and Flask. A single `docker-compose.yml` works for local development and production; use a `.env` file to switch behavior.

## Prerequisites

- Docker Desktop installed and running
- Git (optional)

## Quick start (local)

```bash
cp .env.example .env
docker compose up --build
```

### Local URLs

- **Frontend**: http://localhost:5066
- **Backend API**: http://localhost:5500/api

### Stop services

```bash
docker compose down
```

### Local environment notes

- Hot reload for frontend and backend
- SQLite database (no extra setup)
- Mounted volumes for active development
- Defaults in `.env.example` (ports **5500** / **5066** avoid common conflicts with 5000 and 3000)

## Production

### 1. Environment variables

```bash
cp env.production.example .env
```

Edit `.env` with your production values.

**Critical variables**

- `SECRET_KEY`: generate with `python -c "import secrets; print(secrets.token_hex(32))"`
- `FRONTEND_URL`: e.g. `http://147.93.5.220:5066`
- `REACT_APP_API_URL`: e.g. `http://147.93.5.220:5500/api`
- `NETWORK_EXTERNAL=true` and `TRAEFIK_ENABLE=true` when using Traefik

### 2. Docker network (production)

```bash
docker network create elantar_net
```

### 3. Start services

```bash
docker compose up -d --build
```

### 4. Check status

```bash
docker compose ps
docker compose logs -f
```

### 5. Production URLs (example IP)

- **Frontend**: http://147.93.5.220:5066
- **Backend API**: http://147.93.5.220:5500/api

If Traefik is on port 80 with the same host rule:

- **Frontend**: http://147.93.5.220
- **Backend API**: http://147.93.5.220/api

## Database (migrations)

### Current migration

```bash
docker exec elantar-backend flask db current
```

### Apply migrations

```bash
docker exec elantar-backend flask db upgrade
```

### Create migration

```bash
docker exec elantar-backend flask db migrate -m "Describe your change"
```

## Monitoring and logs

```bash
docker compose logs -f
docker logs elantar-backend --tail 100
docker logs elantar-frontend --tail 100
```

## Useful commands

### Restart

```bash
docker compose restart
```

### Stop (keep volumes)

```bash
docker compose down
```

### Stop and remove volumes

```bash
docker compose down -v
```

### Rebuild images

```bash
docker compose build --no-cache
```

## Troubleshooting

### Port already in use

Change `BACKEND_HOST_PORT` and `FRONTEND_HOST_PORT` in `.env`, then update `FRONTEND_URL` and `REACT_APP_API_URL` to match.

### Container will not start

```bash
docker compose logs
docker compose ps
```

### Full reset (local)

```bash
docker compose down -v
docker compose up --build
```

## Default credentials

### Admin

- **Username**: admin
- **Password**: admin123
- **Email**: admin@elantar.com

### Test data

Set `CREATE_TEST_DATA=true` in `.env` to seed on startup. To seed manually:

```bash
docker exec elantar-backend python create_test_data.py
```

Creates:

- Vendors: vendor1, vendor2, vendor3 (password: password123)
- Clients: client1 through client10 (password: password123)

## Project layout

```
ERP/
├── backend/
├── frontend/
├── docker-compose.yml
├── .env.example
└── env.production.example
```

## Important notes

- **Security**: never commit `.env` to the repository
- **Database**: SQLite in both environments unless you enable PostgreSQL
- **Docker network**: set `NETWORK_EXTERNAL=true` in production after `docker network create elantar_net`
- **Traefik**: set `TRAEFIK_ENABLE=true` and `TRAEFIK_HOST` to your server IP or domain
