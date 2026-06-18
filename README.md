# MHStore Frontend

Vite + React frontend for MHStore. This folder is ready to live in its own Git repository and deploy independently from the backend.

## Requirements

- Node.js 22+
- npm

## Environment

Copy the example file and update values for your machine/deploy target:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5018
VITE_ZALO_PHONE=0334140131
```

Notes:

- For local development, you can leave `VITE_API_URL` empty to use the Vite `/api` proxy configured in `vite.config.ts`.
- For production deploy, set `VITE_API_URL` to the public backend URL, for example `https://api.example.com`.
- Vite env values are embedded at build time, so rebuild the image/app after changing `VITE_API_URL`.

## Local development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run build
```

## Docker

Build with an API URL:

```bash
docker build --build-arg VITE_API_URL=https://api.example.com -t mhstore-frontend .
```

Run locally:

```bash
docker run --rm -p 8080:80 mhstore-frontend
```

Open `http://localhost:8080`.

## CI/CD

The GitHub Actions workflow in `.github/workflows/ci.yml` runs:

1. `npm ci`
2. `npm run lint`
3. `npm run build`

Add provider-specific deploy steps later after choosing the hosting platform.
