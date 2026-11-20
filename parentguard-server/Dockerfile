# ParentGuard server — one Docker image, one service.
# Builds the parent dashboard (React) and the backend (Node + Socket.IO),
# then serves the dashboard FROM the backend, so one URL does everything.
# No env vars needed: the backend reads $PORT (Render sets it), the
# dashboard talks to the same origin it was loaded from.

# ---- Stage 1: build the parent dashboard ----
FROM node:20-alpine AS dashboard
WORKDIR /app/parent-dashboard
COPY parent-dashboard/package.json parent-dashboard/package-lock.json ./
RUN npm install --no-audit --no-fund
COPY parent-dashboard/ ./
RUN npm run build

# ---- Stage 2: build + run the backend ----
FROM node:20-alpine AS backend
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm install --no-audit --no-fund
COPY backend/ ./
RUN npm run build && npm prune --omit=dev
# Dashboard files land where the backend serves them from.
COPY --from=dashboard /app/parent-dashboard/dist ./public

EXPOSE 4000
CMD ["node", "dist/index.js"]
