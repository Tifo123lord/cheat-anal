# Cheat & Anal (C&A)

Formerly "leafpress". The repo was renamed to `cheat-anal` (URL `/cheat-anal`); the storage keys and demo/admin logins keep the old identifiers so existing data and sign-ins keep working.

**Digital files, grown with care.** A demo marketplace for templates, UI kits, fonts, icon packs, mockups, 3D assets, presets, ebooks and source code, styled after a late-2000s "nature web gallery": a night sky with aurora ribbons, a beveled olive nav bar, a featured slider in a double cream frame, and two columns of cream cards with leaf ratings.

Everything is original. The brand, the authors and the house ads are invented, and every image (aurora, logo sprout, leaves, avatars, promo banners and default product previews) is drawn in code as SVG.

**The store starts empty.** There are no seeded products or bundles: every list (home, shop, categories, new releases, bundles, free files, author pages, search) shows a "No files yet" empty state until the admin uploads files at `/admin/`. Uploads live in the browser (localStorage + IndexedDB) and appear everywhere, can be bought and download byte-for-byte. Saved carts, wishlists, libraries and reviews that still point at the removed demo files (ids `p01`–`p36` and the old bundles) are pruned on load. `/product/[slug]/` pre-renders only a placeholder (`/product/unavailable/`), because static export needs at least one param; admin files open at `/product/view/?id=…`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              | What it does                                                            |
| ------------------- | ----------------------------------------------------------------------- |
| `npm run dev`       | Development server with hot reload                                      |
| `npm run build`     | Static export to `out/` (`output: 'export'`), ready for any static host |
| `npm start`         | Serves `out/` locally on port 3000 (after a build)                      |
| `npm run lint`      | ESLint (Next core-web-vitals + TypeScript rules, zero warnings)         |
| `npm run typecheck` | `tsc --noEmit` in strict mode                                           |
| `npm test`          | Vitest unit tests                                                       |
| `npm run format`    | Prettier                                                                |

Optional environment variables: `NEXT_PUBLIC_SITE_URL` (origin for canonical/Open Graph/sitemap/RSS URLs, defaults to `https://cheat-anal.example`) and `NEXT_PUBLIC_BASE_PATH` (sub-path, e.g. `/cheat-anal`; empty for `npm run dev`).

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` runs lint, typecheck, tests and `npm run build` with `NEXT_PUBLIC_BASE_PATH=/<repo>` and `NEXT_PUBLIC_SITE_URL=https://<owner>.github.io` on every push to `main`, then publishes `out/` with GitHub Pages (Settings → Pages → Source: GitHub Actions). Live: https://tifo123lord.github.io/cheat-anal/. Locally, `npm run dev` stays at the root because both variables are unset.

Demo sign-in: `demo@leafpress.test` / `leafpress`. Demo card at checkout: `4242 4242 4242 4242`, any future expiry, any CVC. Coupon: `LEAF15` (15% off).

## Accounts and the admin panel

- Visitors register with a name, email and a password of 8+ characters. Passwords are hashed with SHA-256 (WebCrypto) over a random per-user salt; the plain password is never stored. Sign in / sign out and **Account → change name / password** work as usual.
- Checkout and **My downloads** require a signed-in account: signed-out visitors are sent to `/login/?next=…` and returned afterwards. The library shows only the signed-in account's orders.
- **Admin:** `admin@leafpress.local` / `leafpress-admin` (documented demo password). The admin panel at `/admin/` shows a banner until you change it under **Admin password**. Only an account with `role: admin` can open `/admin/`, and the header's Admin link is shown only to that account.
- **Product manager** (Admin → Products): create, edit, delete, publish and unpublish products with title, description, category, price, optional sale price, tags, file types, licence tiers, the downloadable **file** (any type, max 50 MB) and up to 5 optional preview **images** (JPG/PNG/WebP, resized in the browser to max 1600 px). With no image, a preview is generated from the title and category with the same SVG generator as the catalogue.
- Published admin products appear on the home grid (and the slider when "Show in the home slider" is ticked), in shop filters and search, on a client-rendered product page (`/product/view/?id=…`, because static export cannot pre-render files created at runtime), and in cart, checkout and the library, where **Download returns the exact uploaded file under its original name**.
- The author dashboard's submit-for-review flow still works; submissions appear under Admin → Review queue.

### Storage caveat (important)

There is no backend. Everything — accounts, password hashes, orders, admin products — lives in **each visitor's own browser** (`localStorage`, plus IndexedDB for uploaded files and images). Products the admin adds are visible only in the browser where they were added; other visitors to the live site will not see them, and clearing site data deletes them. SHA-256 with a salt keeps passwords out of plain sight in `localStorage` but is not a substitute for server-side authentication; anyone with access to the browser can edit its storage (including roles). Use this as a demo or a single-device tool, not as a real multi-user shop.

## File structure

```
app/                     App Router pages (all statically exported)
  page.tsx               Home: slider + card grid + sidebar
  shop/                  Shop with URL-synced filters and sort
  new-releases/          Newest 12 files
  category/[slug]/       One static page per category (13), incl. /category/cheats/; lists admin files, empty state when none
  product/[slug]/        Product detail (gallery, licences, tabs, reviews, changelog, FAQ)
  cart/, checkout/       Cart with coupon + tax; mock payment; checkout/success
  library/               My downloads (Blob .zip downloads, licence keys, counter) + invoice
  dashboard/             Author dashboard: upload form, SVG chart, earnings, payouts
  admin/                 Admin-lite review queue (approve / reject uploads)
  authors/, authors/[id] Top authors and profiles
  bundles/, free-files/  Bundles; email-gated free downloads
  journal/, journal/[slug]
  login/, register/, forgot-password/, account/
  info/[slug]/           About, Licenses, Refunds, Help, Contact, Terms, Privacy
  not-found.tsx          404 with a leaf doodle
  error.tsx, loading.tsx Error boundary and loading skeleton
  feed.xml/, sitemap.ts, robots.ts
components/              CreamFrame, SiteHeader (NavBar + drawer), SearchBox, FeaturedSlider,
                         ProductCard, LeafRating, Badge, PromoBanner, Sidebar, SidebarWidget,
                         FiltersPanel, Modal, QuickView, Aurora, Logo, Footer, MobileBar, ...
lib/
  art.ts                 Procedural SVG previews (browser frames, type posters, icon sheets, ...)
  pricing.ts             Licence pricing, coupons, tax and cart totals
  filters.ts             Filter / sort / paginate + URL (de)serialisation
  rating.ts              Rating maths and leaf fills
  catalog.ts             Typed access to /data
  zip.ts, download.ts    Tiny ZIP writer + Blob download helper
  types.ts               Product, Author, Order, ... types
store/                   Zustand stores (cart, wishlist, library, reviews, auth, studio, ui)
data/                    products.json (empty), authors.json, categories.json (13, incl. Cheats), bundles.json (empty), posts.json
styles/globals.css       Brand tokens (CSS variables) and the frame / nav / button styles
tests/                   Vitest: pricing, coupon, cart totals, filters/sort, rating, misc
scripts/                 seed.mjs (regenerates /data), og.svg + og.cjs (Open Graph image)
```

## Change the brand colours

All colours are CSS variables at the top of `styles/globals.css`:

```css
:root {
  --bg-night: #0b0b0f; /* page background */
  --paper: #d8d0bd; /* cream frames */
  --paper-light: #e9e3d3;
  --paper-dark: #b9b098;
  --olive: #5c5a3c; /* nav bar */
  --olive-dark: #3d3b28;
  --leaf: #7fa23a; /* rating leaves, buttons */
  --leaf-dark: #4f6a1f;
  --text-dark: #2b2a22;
  --text-light: #eeeadb;
  --link: #5b7a1e;
  --sale: #c2452d;
  --link-strong: #3f5714; /* darker link green used for text on cream (WCAG AA) */
  --text-muted: #57533f;
}
```

Tailwind maps them to utilities (`bg-paper`, `text-olive`, `bg-leaf`, `text-ink-muted`, ...) in `tailwind.config.ts`, so changing a variable recolours the whole site. The aurora ribbons have their own gradient stops in `components/Aurora.tsx`, and preview palettes live in `PALETTES` in `lib/art.ts`.

Note: the brand `--link` green (#5b7a1e) is below 4.5:1 on the cream paper, so body text links use `--link-strong`; the brand value is kept for icons and accents.

## Add a product

Add an object to `data/products.json`:

```json
{
  "id": "p37",
  "slug": "mossbed-ui-kit",
  "title": "Mossbed — Calm UI Kit",
  "description": "Two sentences about the file.",
  "price": 24,
  "salePrice": 18,
  "category": "ui-kits",
  "tags": ["figma", "components"],
  "fileTypes": ["FIG"],
  "fileSize": "18 MB",
  "version": "1.0.0",
  "compatibility": ["Figma"],
  "licenses": [
    { "type": "Personal", "price": 24 },
    { "type": "Commercial", "price": 60 },
    { "type": "Extended", "price": 240 }
  ],
  "images": ["uikit:3", "uikit:4", "uikit:5"],
  "authorId": "mossy-pixel",
  "rating": 4.6,
  "votes": 12,
  "sales": 80,
  "badges": ["NEW", "SALE"],
  "createdAt": "2026-11-14",
  "updatedAt": "2026-11-14"
}
```

- `category` must match an id in `categories.json`; `authorId` an id in `authors.json`.
- `images` are preview descriptors `<kind>:<variant>`. Kinds: `browser`, `uikit`, `type`, `icons`, `device`, `shape3d`, `gradient`, `book`, `code`, `illustration`, `texture`, `motion`. The variant (0–11) picks the palette and layout seed.
- `salePrice` is optional; when present the same discount ratio applies to every licence tier.
- A product with `price: 0` appears on the Free Files page.

The page `/product/<slug>/` is generated automatically at build time. `scripts/seed.mjs` writes zero products on purpose (the shop shows admin uploads only); run `node scripts/seed.mjs` to regenerate categories, authors and posts.

## Add an author

Add to `data/authors.json`:

```json
{
  "id": "wild-oat",
  "name": "Wild Oat Studio",
  "avatarSeed": 7,
  "bio": "One line about them.",
  "sales": 0,
  "rating": 0,
  "location": "Oslo",
  "joined": "2026-11-01"
}
```

`avatarSeed` picks the generated avatar colours. Then reference the id from products. `/authors/<id>/` is generated automatically.

## Notes and limits

- Payments and emails are mocks; all data (accounts, admin products, uploaded files) is per-browser.
- Images are SVG data URIs through `next/image` (unoptimized, as required by static export), lazy-loaded with fixed dimensions to avoid layout shift.
- Respects `prefers-reduced-motion` (no slider autoplay, no hover motion).

## Brand

- Name: **Cheat & Anal**, short name **C&A** (`lib/site.ts`). Accent red `#e0102a` (`--leaf` in `styles/globals.css`; `--link-strong` `#8c0a19` for text on cream, white text on red buttons, all WCAG AA).
- Logo, favicons, apple-touch icon and the Open Graph image are generated from `scripts/brand-src/` by `python3 scripts/brand-assets.py`.
- Headings (H1, `.page-title`, `.brand-heading`) use **Rubik Glitch**, self-hosted via `next/font/local` from `app/fonts/RubikGlitch-latin.woff2` (SIL Open Font License 1.1, see `app/fonts/OFL.txt`, also published as `/fonts-OFL.txt`). Body text stays Open Sans.
