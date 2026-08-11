# Cocktale

Learn cocktails, prepare ingredients, follow make steps, and get mood- and weather-aware recommendations.

## Features

- **Discover feed** — swipe right through an infinite relevance-ranked deck
- **Ranking** — weather (Open-Meteo) · popularity · browsing history · optional mood
- **Cocktail cards** — name, origin, description, photo
- **Full tale** — ingredients, steps, stories, best people/situations
- **Collect** — save to your book
- **Tried** — journal with date + notes
- **Auth** — local sign-in / register (demo: `demo@cocktale.app` / `demo`)

## Database

Seeded from [TheCocktailDB](https://www.thecocktaildb.com/) public API (441 drinks), enriched with origin, moods, weather affinity, situations, and stories.

```bash
npm run seed
```

## Languages

Switch language from the header or login screen. Supported: English, 简体中文, 繁體中文, Español, हिन्दी, العربية (RTL), Français, Português, Русский, 日本語, Deutsch, 한국어, Italiano, Türkçe, Tiếng Việt, ไทย, Bahasa Indonesia, Nederlands, Polski, বাংলা, Українська, Bahasa Melayu, فارسی (RTL), עברית (RTL), Svenska.

UI chrome is fully localized. Cocktail recipe text from TheCocktailDB remains in its source language, with a localized note in the detail view.

## Marketplace & Stripe

396 products are generated from cocktail ingredients, glassware, and bar tools (`npm run seed:products`).

- Browse: `/market`
- Cart: `/cart`
- Orders: `/orders`
- Cocktail cards also link “Shop what you need”

Checkout uses **Stripe Checkout Sessions**. Without keys, cart checkout runs in **demo paid** mode so you can still exercise orders.

Copy `.env.example` to `.env.local` and add Test mode keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys):

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
