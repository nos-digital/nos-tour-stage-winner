# Stage 1: build the frontend (served statically by the API).
FROM node:22-alpine AS frontend
WORKDIR /frontend
COPY /frontend/package.json /frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: API runtime.
FROM node:22-alpine

WORKDIR /app

COPY /backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/src ./src
# Built frontend, served by Express from /app/public (see server.js).
COPY --from=frontend /frontend/build ./public

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
    CMD wget -q --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "src/server.js"]
