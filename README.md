# Upload Application — Frontend

Next.js frontend for image upload, gallery view, and commenting.

## Tech Stack

- **Next.js 16** — React framework
- **React 19** — UI library
- **Tailwind CSS 4** + **SCSS Modules** — Styling
- **i18next** — Internationalization (EN / VI)
- **browser-image-compression** — Client-side image compression before upload

## Prerequisites

- Node.js >= 22
- pnpm

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4040
```

### 3. Start development server

```bash
pnpm dev
```

App runs at `http://localhost:3000`.

## Features

- Drag & drop or click to upload images (JPG, PNG)
- Auto compression before upload (max 1MB, max 1920px)
- Image gallery with infinite scroll
- Image detail modal with comments
- Add comments with infinite scroll pagination
- Language switcher (English / Vietnamese)

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production build |
| `pnpm lint` | Run ESLint |

## Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:4040 \
  -t upload-app-view .

docker run -p 3000:3000 upload-app-view
```

> **Note**: `NEXT_PUBLIC_API_BASE_URL` is baked at build time. Pass it as a build arg, not a runtime env var.
