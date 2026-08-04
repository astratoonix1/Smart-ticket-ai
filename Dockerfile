FROM node:20-alpine

WORKDIR /app

COPY BACKEND/package.json ./
RUN npm install --omit=dev

COPY BACKEND/ ./

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
