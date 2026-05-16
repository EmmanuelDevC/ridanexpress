# Ridanexpress — Customer Storefront

Ridanexpress is a full-featured e-commerce marketplace frontend built with React and Vite. It connects to a separate backend API for data, handles payments via Stripe and Flutterwave, supports Google OAuth login, real-time buyer–seller chat, Kwik delivery shipping, and PDF invoice generation.

**Live site:** https://ridanexpress.vercel.app  
**Backend API:** https://ridanexpress-api-lqo6.onrender.com  
**Admin panel:** https://ridanexpress-hq.vercel.app

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment (Vercel)](#deployment-vercel)
- [Pages & Routes](#pages--routes)
- [External Services](#external-services)
- [Common Issues](#common-issues)

---

## Features

- Browse products by category, search, new arrivals, and best sellers
- Product detail pages with ratings and reviews
- Shopping cart and wishlist
- Multi-step checkout with address and shipping selection
- Kwik delivery shipping cost calculation
- Payment via **Flutterwave** or **Stripe**
- Email/password registration with email verification
- Google OAuth login and registration
- Forgot password / reset password flow
- Customer dashboard — orders, order details, wishlist, profile, chat
- Real-time buyer–seller chat powered by Socket.IO
- PDF invoice download
- Seller profile pages
- Responsive design with mobile bottom navigation
- Offline detection modal

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | React 18 + Vite 6 |
| State management | Redux Toolkit + React Redux |
| Routing | React Router v6 |
| Styling | Tailwind CSS, DaisyUI, Flowbite, MUI |
| Animations | Framer Motion |
| HTTP client | Axios |
| Real-time | Socket.IO Client |
| Payments | Stripe (`@stripe/react-stripe-js`), Flutterwave |
| Auth | Google OAuth (`@react-oauth/google`), JWT |
| Maps & Geocoding | Mapbox GL |
| PDF generation | jsPDF + html2canvas |
| Charts | Recharts |
| Notifications | React Hot Toast, React Toastify |

---

## Project Structure

```
ridanexpress/
├── public/               # Static assets (images, manifest)
├── src/
│   ├── api/
│   │   ├── api.js        # Axios instance (base URL + auth interceptor)
│   │   └── shipping.js   # Shipping & Mapbox service calls
│   ├── assets/           # Local images
│   ├── components/       # Reusable UI components
│   │   └── dashboard/    # Dashboard-specific components
│   ├── hooks/
│   │   └── useNetworkStatus.js
│   ├── pages/            # Full page components (one per route)
│   ├── store/
│   │   ├── index.js      # Redux store setup
│   │   ├── rootReducer.js
│   │   └── reducers/     # Slice reducers (auth, card, order, etc.)
│   ├── utils/
│   │   ├── config.js     # App URL / API URL / Stripe key (from env)
│   │   └── ProtectUser.jsx # Auth guard for dashboard routes
│   ├── App.jsx           # Root component + route definitions
│   └── index.jsx         # Entry point
├── .env.example          # Template for required environment variables
├── vercel.json           # Vercel deployment config (API proxy + SPA rewrite)
└── vite.config.js        # Vite config (dev proxy to backend)
```

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | **22.x** (required — see `engines` in package.json) |
| npm | 9+ (ships with Node 22) |
| Git | Any recent version |

Check your versions:
```bash
node -v   # should print v22.x.x
npm -v
```

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/EmmanuelDevC/ridanexpress.git
cd ridanexpress
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

Copy the example file and fill in your values (see [Environment Variables](#environment-variables) below):

```bash
cp .env.example .env.local
```

### 4. Start the backend

The frontend proxies all `/api/*` requests to `http://localhost:5000` in development. You must have the backend running locally **before** starting the frontend, or point `VITE_API_URL` at the hosted Render backend.

- To run the backend locally: clone `ridanexpress-api` and follow its README.
- To use the hosted backend instead: set `VITE_API_URL=https://ridanexpress-api-lqo6.onrender.com` in your `.env.local`.

### 5. Start the development server

```bash
npm run ridan
```

The app opens automatically at **http://localhost:3000**.

---

## Environment Variables

Create a `.env.local` file in the project root (never commit this file). All variables used by Vite must be prefixed with `VITE_`.

```env
# ─── URLs ────────────────────────────────────────────────────
# Frontend base URL
VITE_APP_URL=http://localhost:3000

# Backend API base URL (no trailing slash)
# Use http://localhost:5000 if running the backend locally
VITE_API_URL=http://localhost:5000

# ─── Stripe ──────────────────────────────────────────────────
# Publishable key only — find it in your Stripe Dashboard
# Dashboard → Developers → API keys → Publishable key
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# ─── Flutterwave ─────────────────────────────────────────────
# Public key only — find it in your Flutterwave Dashboard
# Dashboard → Settings → API → Public Key
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-...

# ─── Google OAuth ────────────────────────────────────────────
# Create a project at console.cloud.google.com
# APIs & Services → Credentials → OAuth 2.0 Client IDs
# Set Authorised JavaScript origins to http://localhost:3000
VITE_GOOGLE_CLIENT_ID=xxxxxx.apps.googleusercontent.com

# ─── Mapbox ──────────────────────────────────────────────────
# Create a token at account.mapbox.com/access-tokens
# Scope: styles:read, geocoding:read
REACT_APP_MAPBOX_TOKEN=pk.eyJ1...
```

> **Never put secret keys here.** The Stripe `sk_...` key, Flutterwave secret key, Kwik API key, and database credentials all belong in the **backend** `.env` file only.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run ridan` | Start the Vite dev server at http://localhost:3000 |
| `npm run build` | Build for production (outputs to `build/`) |

---

## Deployment (Vercel)

The `vercel.json` is pre-configured. Deploying is straightforward:

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option B — Vercel Dashboard

1. Go to https://vercel.com and import the `ridanexpress` GitHub repository.
2. Vercel auto-detects Vite. Set the following in **Build & Output Settings**:
   - Build command: `npm run build`
   - Output directory: `build`
3. Add all environment variables from your `.env.local` under **Settings → Environment Variables**.
4. Deploy.

### How the Vercel proxy works

`vercel.json` rewrites `/api/*` requests to the Render backend so the browser never hits the backend domain directly (avoids CORS issues in production):

```
https://ridanexpress.vercel.app/api/... → https://ridanexpress-api-lqo6.onrender.com/api/...
```

All other paths fall through to `index.html` so React Router handles client-side navigation.

---

## Pages & Routes

| Route | Page | Auth required |
|---|---|---|
| `/` | Home — banner, categories, products | No |
| `/shops` | All shops | No |
| `/new-arrivals` | New arrival products | No |
| `/best-sellers` | Best selling products | No |
| `/products` | Category shop | No |
| `/products/search` | Search results | No |
| `/product/details/:slug` | Product detail + reviews | No |
| `/seller/:sellerId` | Seller profile | No |
| `/product/:slug/reviews` | All reviews for a product | No |
| `/register` | Sign up (email or Google) | No |
| `/login` | Sign in (email or Google) | No |
| `/verify-email` | Email verification (token in URL) | No |
| `/forgot-password` | Request password reset | No |
| `/reset-password` | Set new password (token in URL) | No |
| `/card` | Shopping cart | No |
| `/shipping` | Select delivery address + shipping | Yes |
| `/payment` | Choose payment method | Yes |
| `/order/confirm` | Order confirmation | Yes |
| `/dashboard` | Customer dashboard home | Yes |
| `/dashboard/my-orders` | Order history | Yes |
| `/dashboard/order/details/:orderId` | Single order detail + invoice | Yes |
| `/dashboard/my-wishlist` | Saved products | Yes |
| `/dashboard/profile` | Edit profile | Yes |
| `/dashboard/chat` | Chat with sellers | Yes |
| `/dashboard/chat/:sellerId` | Chat with a specific seller | Yes |

---

## External Services

### Backend API (`ridanexpress-api`)
All product, order, auth, and chat data is fetched from the backend. In development the Vite proxy forwards `/api/*` to `localhost:5000`. In production Vercel rewrites handle the same.

### Stripe
Used for card payments. Only the **publishable key** (`pk_...`) is used in the frontend. The backend holds the secret key and creates Payment Intents.

### Flutterwave
Used as an alternative payment method for African markets. Only the **public key** is used in the frontend. The backend verifies the transaction.

### Google OAuth
Users can sign in or register with their Google account. The Google credential token is sent to the backend (`/api/google-auth`) which validates it and returns a JWT.

### Mapbox
Used for address autocomplete and geocoding on the shipping page. The token is read-only and scoped to geocoding.

### Kwik Delivery
Shipping cost calculation is handled **entirely on the backend**. The frontend calls `/api/shipping/calculate` and displays the returned rates — no Kwik API key exists in the frontend.

### Socket.IO
Real-time chat between buyers and sellers. The socket connects to `VITE_API_URL` on mount inside the Chat dashboard page.

---

## Common Issues

**Port 3000 already in use**  
Vite is configured with `strictPort: true` so it will error instead of switching ports. Free port 3000 or change the port in `vite.config.js`.

**API requests returning 404 or network errors locally**  
Make sure the backend server is running on port 5000, or update `VITE_API_URL` in `.env.local` to point to the hosted backend.

**Google login not working**  
In the Google Cloud Console, add `http://localhost:3000` to the list of **Authorised JavaScript origins** for your OAuth client. The production URL (`https://ridanexpress.vercel.app`) must also be listed for the deployed app.

**Flutterwave payment modal not opening**  
Confirm `VITE_FLUTTERWAVE_PUBLIC_KEY` is set in `.env.local` and that the key matches the environment (test vs. live) your backend is configured for.

**Stripe checkout not initialising**  
Confirm `VITE_STRIPE_PUBLIC_KEY` is set. The key must start with `pk_test_` (test) or `pk_live_` (production).

**`npm run ridan` command not found**  
Run `npm install` first to install Vite and all other dependencies.
