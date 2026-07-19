# PROMETHEUS — Running & Deployment Guide

This document outlines the standard procedures for running the Prometheus platform locally, profiling it for performance, and deploying it to a production environment.

## Prerequisites
Ensure your environment meets the minimum standards outlined in `requirements.txt`.
* **Node.js**: v18.17.0+ (v20+ recommended)
* **npm**: v9+ (or `yarn` / `pnpm` equivalent)

## 1. Local Development Mode
Use this mode when actively developing the application, modifying React components, or tweaking UI variables. 

```bash
# 1. Install all dependencies
npm install

# 2. Start the development server
npm run dev
```

*Note: In development mode, Next.js compiles pages on demand. This means the first time you click a sidebar link, it might feel slightly slower as the bundler compiles the route. This is normal and does NOT reflect production speed.*

## 2. Production Mode (Recommended for Demos)
Use this mode to experience the application exactly as a user will, with maximum performance, pre-fetched routes, and zero compilation lag. **If you are testing the UI/UX for speed, you MUST run it this way.**

```bash
# 1. Build the production bundles
npm run build

# 2. Start the optimized production server
npm run start
```
*The server will typically run on `http://localhost:3000`.*

## 3. Deployment (Industry Grade)

The Prometheus application is a standard Next.js App Router project and is highly portable.

### Vercel (Preferred Serverless)
1. Push your repository to GitHub/GitLab.
2. Import the project into Vercel.
3. Vercel automatically detects Next.js and configures the build step (`next build`).
4. Set any required Environment Variables in the Vercel dashboard.
5. Deploy.

### Docker / Containerized Environments
To deploy inside a corporate intranet or private data center, you can wrap this application in a standard Docker container.

**Dockerfile Template:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting
- **Port in use:** If port 3000 is occupied, you can run `npm run dev -- -p 3001` or `npm start -- -p 3001`.
- **Stale cache:** If you encounter weird behavior after changing core files, delete the `.next` directory and run `npm run build` again.
