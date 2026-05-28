# Frontend — Aetheria Luxury Real Estate

User-facing React application running at `http://localhost:3000`.

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + Vite + TypeScript |
| Routing | React Router v7 |
| State management | Zustand (with `persist` middleware) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Smooth scroll | Lenis |
| HTTP | Native `fetch` (wrapped in `src/services/api.ts`) |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| Dev server | Express + Vite middleware (`server.ts`) |

---

## Running Locally

```bash
cd frontend
npm install
npm run dev        # starts at http://localhost:3000
```

The dev server is an Express app (`server.ts`) that mounts Vite as middleware. The backend API must be running at `http://localhost:3002` for data to load.

---

## Folder Structure

```
frontend/
├── src/
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Entry point
│   ├── routes/index.tsx           # All route definitions
│   ├── layouts/
│   │   └── MainLayout.tsx         # Navbar + Footer + page transition wrapper
│   ├── pages/
│   │   ├── home/
│   │   │   ├── index.tsx          # Home page (property listing + filters)
│   │   │   └── sections/Hero.tsx  # Hero banner
│   │   ├── properties/
│   │   │   ├── PropertiesListing.tsx
│   │   │   └── PropertyDetails.tsx
│   │   ├── projects/
│   │   │   ├── ProjectsListing.tsx
│   │   │   └── ProjectDetails.tsx
│   │   ├── specialists/
│   │   │   ├── SpecialistsListing.tsx
│   │   │   └── SpecialistDetails.tsx
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   └── dashboard/
│   │       ├── WishlistPage.tsx   # Saved/liked properties
│   │       ├── ProfilePage.tsx
│   │       └── EnquiriesPage.tsx
│   ├── components/
│   │   ├── shared/
│   │   │   ├── Navbar.tsx         # Top nav (hidden on home page)
│   │   │   ├── BottomNav.tsx      # Mobile bottom nav
│   │   │   └── Footer.tsx
│   │   ├── home/
│   │   │   ├── CategoryTabs.tsx   # Tab strip + SmartFilter sidebars
│   │   │   └── SmartLoanCalculator.tsx
│   │   ├── properties/
│   │   │   ├── PropertyGallery.tsx
│   │   │   ├── BookingModal.tsx
│   │   │   └── VisitEnquiryModal.tsx
│   │   └── ui/
│   │       ├── PropertyCard.tsx       # Property card with wishlist button
│   │       ├── PropertyCardSkeleton.tsx
│   │       ├── WishlistButton.tsx     # Heart toggle button
│   │       ├── Button.tsx
│   │       ├── GlassCard.tsx
│   │       ├── VideoPlayer.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── bg-pattern.tsx
│   ├── store/
│   │   ├── useAuthStore.ts         # JWT token + user profile (persisted)
│   │   ├── useWishlistStore.ts     # Saved property IDs (persisted)
│   │   ├── usePropertiesStore.ts   # Home page property cache
│   │   ├── useHomeCategoryStore.ts # Pending tab category for home nav
│   │   └── useUIStore.ts
│   ├── services/
│   │   └── api.ts                  # All API calls to backend :3002
│   ├── constants/
│   │   ├── routes.ts               # Typed route constants
│   │   └── mockData.ts
│   ├── types/index.ts              # Property, Specialist, Project, Agent interfaces
│   ├── lib/utils.ts                # cn(), formatCurrency(), etc.
│   ├── hooks/useCounter.ts
│   └── animations/variants.ts
├── server.ts                       # Express + Vite dev server
├── .env                            # PORT=3000, GEMINI_API_KEY
└── package.json
```

---

## Routes

| Path | Component | Auth required |
|---|---|---|
| `/` | `Home` | No |
| `/properties` | `PropertiesListing` | No |
| `/properties/:id` | `PropertyDetails` | No |
| `/projects` | `ProjectsListing` | No |
| `/projects/:id` | `ProjectDetails` | No |
| `/agents` | `SpecialistsListing` | No |
| `/specialists/:id` | `SpecialistDetails` | No |
| `/login` | `LoginPage` | No |
| `/signup` | `RegisterPage` | No |
| `/dashboard/profile` | `ProfilePage` | Yes |
| `/dashboard/saved` | `WishlistPage` | Yes |
| `/dashboard/enquiries` | `EnquiriesPage` | Yes |

---

## State Management (Zustand Stores)

### `useAuthStore` — `src/store/useAuthStore.ts`
Persisted to `localStorage` as `auth-storage`.

| Key | Type | Description |
|---|---|---|
| `user` | `User \| null` | Logged-in user profile |
| `token` | `string \| null` | JWT bearer token |
| `isAuthenticated` | `boolean` | Login status |
| `setAuthFromApi(apiUser, token)` | fn | Set auth state after login/register |
| `logout()` | fn | Clear auth state |

### `useWishlistStore` — `src/store/useWishlistStore.ts`
Persisted to `localStorage` as `wishlist-storage`.

| Key | Type | Description |
|---|---|---|
| `savedPropertyIds` | `string[]` | IDs of liked properties |
| `synced` | `boolean` | Whether server sync has completed |
| `toggleWishlist(id, token)` | fn | Optimistic toggle + `POST /api/liked/:id` |
| `syncFromServer(token)` | fn | `GET /api/liked` — overwrites local IDs with server truth |
| `isInWishlist(id)` | fn | Check if a property is liked |
| `clearWishlist()` | fn | Called on logout |

**Important:** `toggleWishlist` only calls the API when `token` is present. If the user is unauthenticated, `WishlistButton` redirects to `/login` before calling `toggleWishlist`.

### `usePropertiesStore` — `src/store/usePropertiesStore.ts`
In-memory only (not persisted). Caches home page property list.

| Key | Type | Description |
|---|---|---|
| `properties` | `Property[]` | Cached property list |
| `lastFetched` | `number \| null` | Timestamp of last fetch |
| `setProperties(props)` | fn | Update cache + timestamp |

Cache TTL is 60 seconds. The home page shows cached data immediately on return visits and silently refetches in background when the cache is stale.

### `useHomeCategoryStore` — `src/store/useHomeCategoryStore.ts`
In-memory only. Used to pass a pending tab ID when navigating to the home page from elsewhere (e.g. clicking "For Rent" in a CTA).

---

## API Layer — `src/services/api.ts`

All requests go to `http://localhost:3002`. Auth endpoints send `Authorization: Bearer <token>` in the header.

### Public
| Function | Endpoint | Description |
|---|---|---|
| `propertiesApi.listPublic(params?)` | `GET /api/public/properties` | List all active properties |
| `propertiesApi.getPublic(id)` | `GET /api/public/properties/:id` | Single property detail |
| `propertiesApi.recordView(id, payload)` | `POST /api/public/properties/:id/view` | Increment view count |

### Auth
| Function | Endpoint |
|---|---|
| `authApi.login(email, password)` | `POST /api/auth/login` |
| `authApi.register(data)` | `POST /api/auth/register` |
| `authApi.getMe(token)` | `GET /api/auth/me` |

### Wishlist (requires auth)
| Function | Endpoint | Description |
|---|---|---|
| `likedApi.getIds(token)` | `GET /api/liked` | Returns `string[]` of liked property IDs |
| `likedApi.toggle(id, token)` | `POST /api/liked/:id` | Add or remove. Returns updated `string[]` |
| `likedApi.getProperties(token)` | `GET /api/liked/properties` | Full property objects for all saved IDs |

### Visit Enquiries
| Function | Endpoint |
|---|---|
| `visitEnquiriesApi.create(data)` | `POST /api/visit-enquiries` |
| `visitEnquiriesApi.list(token, params?)` | `GET /api/visit-enquiries` |
| `visitEnquiriesApi.updateStatus(id, status, token)` | `PATCH /api/visit-enquiries/:id` |

### General Enquiries
| Function | Endpoint |
|---|---|
| `inquiriesApi.create(data)` | `POST /api/inquiries` |

---

## Key Components

### `PropertyCard` — `src/components/ui/PropertyCard.tsx`
Displays a single property. Contains the `WishlistButton` (floating heart). Renders tenant-type chips, price overlay, specs bar, and action buttons (View Details / Book Now / Enquire).

### `WishlistButton` — `src/components/ui/WishlistButton.tsx`
Heart toggle button. Three variants: `default`, `floating` (used on cards), `outline` (used on detail page).

- If user is **not authenticated**: redirects to `/login`
- If authenticated: calls `toggleWishlist(id, token)` — optimistic UI + API call
- Animates on toggle with a spring scale sequence

### `CategoryTabs` — `src/components/home/CategoryTabs.tsx`
Horizontal scrollable tab strip for the home page property categories (Rent, Sale, Lease, Apartments, Villas…). Exports `SmartFilterSidebar` (rent filters) and `SaleSmartFilterSidebar` (sale filters).

---

## Wishlist Flow (End-to-End)

```
User clicks heart on PropertyCard
        │
        ▼
WishlistButton.handleToggle()
        │
        ├─ Not logged in? → navigate('/login')
        │
        └─ Logged in:
              │
              ▼
        useWishlistStore.toggleWishlist(id, token)
              │
              ├─ Optimistic: flip savedPropertyIds immediately (UI responds instantly)
              │
              ▼
        POST /api/liked/:id  →  backend toggles savedProperties on User model
              │
              ├─ Success: set savedPropertyIds = server response (confirmed state)
              └─ Error:   revert savedPropertyIds to previous state
```

**WishlistPage reactivity:**

The wishlist page derives its displayed list from `savedPropertyIds` (store) every render:

```
displayedProperties = savedPropertyIds
  .map(id => propertiesCache[id])
  .filter(Boolean)
```

- On mount: fetches all saved property objects via `GET /api/liked/properties` → populates `propertiesCache`
- When `savedPropertyIds` gains a new ID (toggled from home/listing page): fetches that property via `GET /api/public/properties/:id` → adds to cache → card appears
- When `savedPropertyIds` loses an ID (heart clicked again): `displayedProperties` recomputes immediately → card animates out

---

## Bug Fixes Applied

### 1. Wishlist listing always empty (race condition)
**File:** `WishlistPage.tsx`
**Problem:** Page fetched properties from `/api/liked/properties`, then filtered the result against `savedPropertyIds` from the Zustand store. On fresh load, `savedPropertyIds` was empty while `syncFromServer` was still in-flight — so the filter wiped out all results.
**Fix:** Removed the double-filter. Display is now derived directly from `savedPropertyIds` (see Wishlist Flow above).

### 2. Wishlist page not reactive to real-time toggles
**File:** `WishlistPage.tsx`
**Problem:** Properties were stored in a local `useState` array fetched once on mount. Toggling a heart from the home page updated the store but the wishlist page never re-rendered its list.
**Fix:** Replaced local state with a `propertiesCache` dictionary. The displayed list is derived from `savedPropertyIds` on every render, so any store change instantly reflects on the page.

### 3. Unauthenticated users could corrupt local wishlist state
**File:** `WishlistButton.tsx`
**Problem:** When `token` was `null`, `toggleWishlist` skipped the API but still flipped `savedPropertyIds` in localStorage. The heart appeared liked but nothing was saved server-side.
**Fix:** Added an auth guard — unauthenticated clicks redirect to `/login` before any state change.

### 4. Properties blank on return visits to home page
**Files:** `src/store/usePropertiesStore.ts`, `src/pages/home/index.tsx`
**Problem:** Home page started with `loading: true` and refetched from zero every mount. Combined with `AnimatePresence mode="wait"` in `MainLayout`, every navigation back to home caused a blank loading flash.
**Fix:** Created `usePropertiesStore` to cache the property list in memory. On return visits, cached data renders immediately. Background refetch runs silently when cache is older than 60 seconds.

### 5. Clicking Home when already on Home did nothing
**Files:** `BottomNav.tsx`, `Navbar.tsx`
**Problem:** React Router skips navigation to the current path, so `<Link to="/">` was a no-op when already on `/`.
**Fix:** Added `onClick` handler — if already on `/`, call `window.scrollTo({ top: 0, behavior: "smooth" })` instead.

---

## Environment Variables

`frontend/.env`

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Dev server port |
| `GEMINI_API_KEY` | — | Google Gemini key for AI chat endpoint |
