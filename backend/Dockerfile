# Express API for the Tour stage winner app.
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

# Run as the unprivileged node user (OWASP A05).
USER node

EXPOSE 8090

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
    CMD wget -q --spider http://127.0.0.1:8090/api/health || exit 1

CMD ["node", "src/server.js"]
