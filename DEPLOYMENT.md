# Deployment Guide

## 1) Why your Docker build failed
Your original image build timed out while downloading a very large PyTorch wheel.
This project now uses Chroma's default ONNX embedding function instead of local
`sentence-transformers` + `torch`, which makes container builds much lighter.

## 2) Backend: build and run with Docker
From the `backend` folder:

```powershell
docker build -t rag-backend .
docker run --name rag-backend -p 8000:8000 --env-file .env rag-backend
```

Health check:

```powershell
curl http://localhost:8000/health
```

Expected response:

```json
{"status":"ok"}
```

## 3) Backend env vars (minimum)
Copy `.env.example` to `.env` and set:

- `LLM_PROVIDER` (one of: `gemini`, `groq`, `openrouter`)
- Corresponding API key(s)
- `CORS_ORIGINS` for production frontend URL

Example production CORS:

```env
CORS_ORIGINS=https://your-frontend.vercel.app
```

## 4) Deploy backend on Render (recommended)
Vercel is great for frontend; this backend is better on Render/Railway/Fly because
it is a long-running API service with local file/chroma storage behavior.

Render settings:
- Runtime: Docker
- Root directory: `backend`
- Start command: use Dockerfile CMD (already configured with `${PORT}`)
- Environment variables: all values from backend `.env`

Important persistence note:
- This app stores PDFs and Chroma data on local disk under `backend/storage`.
- On most cloud platforms, container filesystems are ephemeral.
- For production, move persistent data to durable storage (S3/R2 + managed DB/vector DB), or attach a persistent disk if your platform supports it.

## 5) Deploy frontend on Vercel
From the `frontend` folder:

1. Set env var in Vercel project:
   - `VITE_API_URL=https://your-backend-domain`
2. Build command: `npm run build`
3. Output directory: `dist`

If deploying from GitHub, Vercel auto-detects Vite and these defaults usually work.

## 6) Local full-stack smoke test
1. Start backend container (port 8000)
2. In `frontend`, set `.env`:

```env
VITE_API_URL=http://localhost:8000
```

3. Start frontend:

```powershell
npm install
npm run dev
```

4. Open the app, upload a PDF, then call `/ask` through UI.
