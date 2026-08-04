# ---- Stage 1: Build the frontend ----
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY FRONTEND/package.json ./
RUN npm install
COPY FRONTEND/ ./
RUN npm run build

# ---- Stage 2: Backend + built frontend ----
FROM node:20-alpine
WORKDIR /app

COPY BACKEND/package.json ./
RUN npm install --omit=dev

COPY BACKEND/ ./

# Put the built frontend files where server.js expects them
COPY --from=frontend-build /frontend/dist ./public

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
