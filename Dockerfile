# One container serves the whole Sylo AI site: the built React website + the FastAPI backend.
# 1) Build the website
FROM node:22-slim AS web
WORKDIR /app/frontend
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY VITE_API_BASE_URL=
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2) Run the backend, which also serves the website from frontend/dist
FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements_deploy.txt backend/
RUN pip install --no-cache-dir -r backend/requirements_deploy.txt
COPY backend/ backend/
COPY --from=web /app/frontend/dist frontend/dist
WORKDIR /app/backend
ENV PYTHONUNBUFFERED=1
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
