# ── Frontend Dockerfile ───────────────────────────────────────────────────────
# Instructions:
# 1. Save this file as: frontend/Dockerfile  (no extension)

FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# standalone output mode requires this start command
CMD ["node", ".next/standalone/server.js"]