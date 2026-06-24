# Docker Setup & Deployment

This guide covers containerizing the entire Study Buddy RAG project with Docker Compose.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│          Docker Compose Network (rag-network)       │
│                                                     │
│  ┌──────────────────┐        ┌──────────────────┐  │
│  │   Frontend       │        │    Backend       │  │
│  │  (Node.js)       │        │   (Python)       │  │
│  │                  │◄───────│                  │  │
│  │  Port: 5173      │HTTP    │  Port: 8000      │  │
│  │  (React App)     │        │  (FastAPI)       │  │
│  └──────────────────┘        └──────────────────┘  │
│                                      ▲              │
│                                      │              │
│                              ┌────────▼───────┐    │
│                              │   Named Volume │    │
│                              │   (rag-data)   │    │
│                              │                │    │
│                              ├─ /data/pdfs    │    │
│                              ├─ /data/chroma  │    │
│                              └─ /data/app.db  │    │
└─────────────────────────────────────────────────────┘
```

## Files Added

```
.
├── docker-compose.yml              # Main orchestration file
├── docker-compose.override.yml     # Dev overrides (hot reload)
├── .env.docker.example             # Docker env var template
├── frontend/Dockerfile             # Frontend containerization
├── frontend/.dockerignore           # Frontend build ignore
└── backend/Dockerfile              # Already exists
    └── .dockerignore               # Already exists
```

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- `.env` file in project root with API keys (copy from `.env.docker.example`)

## Quick Start

### 1. Setup Environment Variables

```bash
cp .env.docker.example .env
# Edit .env and fill in your API keys
```

### 2. Build & Run Everything

```bash
docker-compose up --build
```

This will:
- Build backend Docker image from `backend/Dockerfile`
- Build frontend Docker image from `frontend/Dockerfile`
- Create a shared network (`rag-network`)
- Create a persistent volume (`rag-data`) for storage
- Start both services
- Backend will be at `http://localhost:8000`
- Frontend will be at `http://localhost:5173`

### 3. Stop Everything

```bash
docker-compose down
```

To also remove data (careful!):
```bash
docker-compose down -v
```

---

## Development vs Production

### Development Mode (`docker-compose + docker-compose.override.yml`)

Auto-loaded when you run `docker-compose up` locally.

**Features:**
- Hot reload for both frontend (npm run dev) and backend (uvicorn --reload)
- Source code mounted as volumes
- Better debugging output
- Faster iteration

**Usage:**
```bash
docker-compose up --build
# Changes to src/ auto-update instantly
```

### Production Mode (`docker-compose.yml` only)

Ignore `docker-compose.override.yml` (already git-ignored).

**Features:**
- Optimized multi-stage builds
- Minimal image sizes
- No source code in containers
- Pre-built static assets

**Usage:**
```bash
# On your server/CI-CD
docker-compose -f docker-compose.yml up --build

# Or skip override entirely
COMPOSE_FILE=docker-compose.yml docker-compose up --build
```

---

## Environment Variables

All variables from `.env` are injected into containers at runtime.

**Critical for LLM:**
```env
LLM_PROVIDER=groq              # gemini, groq, or openrouter
GROQ_API_KEY=xxx              # Fill in your key
```

**Critical for CORS:**
```env
# Automatically set in docker-compose.yml:
# CORS_ORIGINS=http://frontend:5173,http://localhost:5173
# (no need to change this for docker-compose local dev)
```

**Storage (handled by docker-compose.yml):**
```env
PDF_STORAGE_PATH=/data/pdfs    # Inside container, persistent
CHROMA_PATH=/data/chroma_db
DB_PATH=/data/app.db
```

See `backend/.env.example` for all available options.

---

## Networking

Services communicate via service name (DNS resolution in Docker network):

```
Frontend → Backend:  http://backend:8000
           (frontend/src/api/documents.js, chat.js use VITE_API_URL env var)
```

From outside containers:
```
Frontend:  http://localhost:5173
Backend:   http://localhost:8000
```

---

## Persistent Storage

The `rag-data` volume stores:
- `/data/pdfs/` — Uploaded PDF files
- `/data/chroma_db/` — Vector database (ChromaDB)
- `/data/app.db` — Document metadata & chat history (SQLite)

**Data survives:**
- `docker-compose restart`
- `docker-compose down` (volume persists)
- Service rebuilds

**Data is deleted only when:**
```bash
docker-compose down -v   # -v flag removes volumes
```

---

## Common Tasks

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild a Service

```bash
docker-compose up --build backend
docker-compose up --build frontend
```

### Rebuild Everything (fresh)

```bash
docker-compose down
docker-compose up --build
```

### Access Backend Shell

```bash
docker-compose exec backend /bin/sh
# Now in container:
# cd /app
# python -c "import app.config; print(app.config.CHROMA_PATH)"
```

### Access Frontend Shell

```bash
docker-compose exec frontend sh
# Now in container:
# ls dist/  # View built output
```

### Manual Health Check

```bash
curl http://localhost:8000/health
# {"status":"ok"}

curl http://localhost:5173/
# Returns HTML
```

---

## Troubleshooting

### "Port 8000 already in use"

Another service is using port 8000 (maybe local backend is still running).

**Fix:**
```bash
# Stop local backend
# Or change port in docker-compose.yml:
ports:
  - "8001:8000"  # Host:Container
```

### "Frontend can't reach backend"

The frontend is trying to call `http://localhost:8000` but you're inside a container.

**Fix:**
- Check `.env` has `VITE_API_URL` set? (docker-compose.yml sets it)
- Rebuild frontend: `docker-compose up --build frontend`
- Verify backend is running: `docker-compose logs backend`

### "Embeddings failed" / "Model not found"

ChromaDB ONNX model wasn't downloaded in the container.

**Fix:**
```bash
docker-compose exec backend python -c "from chromadb.utils.embedding_functions import DefaultEmbeddingFunction; DefaultEmbeddingFunction()"
```

### Data disappeared after restart

You didn't use `-v` flag when running `down`, so volume should still be there.

**Check:**
```bash
docker volume ls | grep rag
# Should show: rag-data

docker volume inspect rag-data
# Shows mount point (usually /var/lib/docker/volumes/...)
```

---

## Deploying to Production

### Option 1: Docker Host (your VPS/server)

```bash
git clone <repo>
cd RAG\ project
cp .env.docker.example .env
# Edit .env with prod secrets
docker-compose -f docker-compose.yml up -d
# Services start in background
```

### Option 2: Railway (Recommended)

Railway auto-detects Dockerfile at project root.

**Setup:**
1. Backend only on Railway (root-level Dockerfile)
2. Frontend on Vercel (separate repo or monorepo integration)
3. Connect with env var: `VITE_API_URL=https://your-railway-domain`

See [DEPLOYMENT.md](DEPLOYMENT.md) for details.

### Option 3: Kubernetes / Docker Swarm

docker-compose can be converted to Kubernetes manifests:
```bash
kompose convert -f docker-compose.yml
# Outputs: backend-service.yaml, frontend-service.yaml, etc.
```

Then deploy with `kubectl apply`.

---

## Docker Image Sizes

Typical sizes:

```
rag-backend:latest      ~650 MB  (Python 3.11-slim + deps)
rag-frontend:latest     ~200 MB  (Node 18-alpine + serve)
```

Optimize if needed:
- **Backend:** Swap `python:3.11-slim` → `python:3.11-alpine` (risky with some deps)
- **Frontend:** Use distroless image in multi-stage build

---

## Git Ignored Files

These are NOT committed (safe for CI-CD):

```
.env                       # Local secrets
docker-compose.override.yml # Dev-only overrides
rag-data/                  # Volume mount target (if local)
backend/storage/           # Local storage
backend/__pycache__/
frontend/node_modules/
frontend/dist/
```

You CAN commit:
```
docker-compose.yml         # Main config
docker-compose.override.yml (already in .gitignore, can be committed for docs)
.env.docker.example        # Template (no secrets)
Dockerfiles
.dockerignore files
```

---

## Next Steps

1. ✅ Run `docker-compose up` locally
2. ✅ Verify both services are healthy
3. ✅ Upload a PDF, ask a question
4. ✅ Test data persistence: `docker-compose restart`, check data still there
5. ✅ When ready for production, push to Railway/Render
6. ✅ Set env vars in cloud dashboard
7. ✅ Deploy frontend separately on Vercel

---

## Support

For Docker-specific issues:
```bash
# Full debug output
docker-compose --verbose up

# Check service status
docker-compose ps

# See what's in the volume
docker volume inspect rag-data | grep Mountpoint
ls /var/lib/docker/volumes/...  # On Linux/macOS host
```

---

**Docker makes it one-click to go from zero to a running RAG app.** 🐳

