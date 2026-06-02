# Dealer Web Portal Requirements

## Project Overview

The Dealer Web Portal is the browser-based management interface for dealers and property owners on the Luxury Real Estate platform. It is a React + Vite SPA served by an Express dev/production server on port `3001`, connected to the shared backend API on port `3002`.

The portal is separate from the user-facing frontend and gives dealers full control over their property listings, amenities, enquiries, and analytics.

## Tech Stack

- Framework: React 19 with Vite 6
- Language: TypeScript
- Routing: React Router DOM v7
- State management: Zustand
- Server state: TanStack Query v5
- Forms: React Hook Form + Zod
- Styling: Tailwind CSS v4
- HTTP client: Axios
- Server: Express (dev + production SSR wrapper via `tsx server.ts`)

## Dev Server

```bash
npm run dev --prefix dealer-portal
# or from root:
npm run dev
```

Runs on: `http://localhost:3001`

## Authentication

Dealers authenticate with `role: dealer`. The portal blocks all protected routes if the user is not authenticated, redirecting to `/login`.

JWT token is stored and managed in `useAuthStore` (Zustand). All API requests include:

```http
Authorization: Bearer {token}
```

## Routes

| Path | Page | Protected |
|---|---|---|
| `/login` | Login | No |
| `/register` | Register | No |
| `/dashboard` | Dashboard | Yes |
| `/properties` | My Properties | Yes |
| `/properties/add` | Add Property | Yes |
| `/properties/:id/edit` | Edit Property | Yes |
| `/inquiries` | Inquiries | Yes |
| `/analytics` | Analytics | Yes |
| `/profile` | Profile | Yes |

All routes under `/` are wrapped in `DashboardLayout` with a sidebar and top bar.

## Pages

### Login Page (`/login`)

- Email and password form.
- Validates dealer role on login.
- Redirects to `/dashboard` on success.
- Shows error message on invalid credentials.

### Register Page (`/register`)

- Name, email, phone, password.
- Company name and license number.
- Registers with `role: dealer`.
- Redirects to login on success.

### Dashboard Page (`/dashboard`)

- Summary stat cards:
  - Total properties
  - Active listings
  - Total views
  - Total enquiries
  - Portfolio value
- Top viewed properties list.
- Recent enquiries list.
- CTA button to add a new property.

### My Properties Page (`/properties`)

- Table/card list of dealer-owned properties.
- Search by title, location, or city.
- Filter by:
  - Status (active, pending, sold, rented)
  - Listing type (rent, sale)
  - Property type
  - City
- Each property row/card shows:
  - Cover image
  - Title
  - Status badge
  - Price
  - Views count
  - Enquiries count
  - Preferred tenant type chips
  - Edit button (links to edit page)
  - Delete button (with confirmation dialog)

### Add Property Page (`/properties/add`)

Step-based form split into two steps.

**Step 1 — Property Details**

- Title
- Property type
- Listing type (rent / sale)
- Price
- Area (sq ft)
- Bedrooms
- Bathrooms
- Address / location
- City
- Description
- Status
- Images and videos (multipart upload to `/api/upload`)

**Step 2 — Amenities**

See Amenities section below.

### Edit Property Page (`/properties/:id/edit`)

- Loads existing property data on mount.
- Same two-step form as Add Property.
- Allows replacing, adding, and removing media.
- Saves property details and amenities separately.

### Amenities Form Section

Used inside both Add and Edit property pages.

**Boolean toggles:**

- Parking
- Power backup
- 24/7 security
- High-speed WiFi
- Gymnasium
- Swimming pool
- Club house
- Separate electricity meter

**Selects / inputs:**

- Air conditioning (toggle + AC count input)
- Furnishing status (unfurnished / semi-furnished / fully furnished)
- Beds count
- Almirah / wardrobe count
- Storage room
- Water supply type
- Security deposit amount
- Distance from nearest landmark

**Preferred tenant types (multi-select chips):**

- Family
- Couples
- Girls
- Boys
- Independent
- Working Professionals

Sent to the API as:

```json
{
  "preferred_tenants": ["Family", "Working Professionals"]
}
```

### Inquiries Page (`/inquiries`)

- Lists property enquiries and visit enquiries.
- Filter by:
  - Status
  - Property
  - Visit type
  - Date range
  - Search (name, email, phone)
- Each enquiry shows:
  - User name, email, phone
  - Property title
  - Message
  - Visit type and date/time
  - Guest count
  - Current status
- Inline status update action.

### Analytics Page (`/analytics`)

- Total properties.
- Active listings.
- Total views.
- Total enquiries.
- Portfolio value.
- Breakdown chart by property status.
- Breakdown chart by listing type.
- Top properties by views table.

### Profile Page (`/profile`)

- Dealer name, email, phone.
- Company name and license number.
- Role display.
- Edit profile form.
- Logout button.

## Layout

### DashboardLayout

Wraps all protected pages. Contains:

- `Sidebar` — navigation links to all protected pages with icons.
- `TopBar` — dealer name, avatar, quick actions.
- `<Outlet />` — renders the active page.

## Backend API

Base URL (development):

```text
http://localhost:3002
```

### Auth

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PATCH /api/auth/me
```

### Properties

```http
GET    /api/properties
GET    /api/properties/:id
POST   /api/properties
PATCH  /api/properties/:id
DELETE /api/properties/:id
```

### Amenities

```http
GET   /api/properties/:id/amenities
PATCH /api/properties/:id/amenities
```

### Upload

```http
POST   /api/upload
DELETE /api/upload
```

### Inquiries

```http
GET   /api/inquiries
GET   /api/inquiries/:id
PATCH /api/inquiries/:id
```

### Visit Enquiries

```http
GET   /api/visit-enquiries
PATCH /api/visit-enquiries/:id
```

### Analytics

```http
GET /api/analytics
```

## Core Data Models

### Dealer User

- `_id`
- `name`
- `email`
- `phone`
- `role` (`dealer`)
- `company`
- `licenseNumber`
- `verified`
- `createdAt`

### Property

- `_id`
- `title`
- `type`
- `listingType`
- `price`
- `area`
- `bedrooms`
- `bathrooms`
- `location`
- `city`
- `description`
- `images`
- `status`
- `views`
- `inquiries`
- `ownerId`
- `amenities`
- `createdAt`
- `updatedAt`

### Amenities

- `parking`
- `powerBackup`
- `security24x7`
- `separateElectricityMeter`
- `waterSupply`
- `highSpeedWifi`
- `gymnasium`
- `swimmingPool`
- `clubHouse`
- `airConditioning`
- `acCount`
- `furnishingStatus`
- `bedsCount`
- `almirah`
- `storage`
- `securityDeposit`
- `distanceFromLocation`
- `preferred_tenants`

### Enquiry

- `_id`
- `name`
- `email`
- `phone`
- `propertyId`
- `propertyTitle`
- `message`
- `status`
- `ownerId`
- `createdAt`

### Visit Enquiry

- `_id`
- `propertyId`
- `propertyTitle`
- `ownerId`
- `name`
- `email`
- `phone`
- `visitType`
- `visitDate`
- `visitTime`
- `message`
- `guestCount`
- `status`
- `createdAt`
- `updatedAt`

## Functional Requirements

- Authenticate dealers and block visitor-role users from protected routes.
- Create, edit, and delete properties.
- Upload images and videos via multipart to Cloudinary through backend.
- Save and update amenities including preferred tenant multi-select.
- List, filter, and search own properties.
- View and update enquiry statuses.
- View analytics and portfolio summary.
- Persist auth token across sessions.
- Handle loading, empty, error, and unauthorized states on all pages.

## Non-Functional Requirements

- Forms should preserve state on navigation back (TanStack Query cache or local state).
- Media upload should show per-file progress.
- API errors should display readable messages to the dealer.
- Auth tokens must not be logged or exposed.
- The portal must be responsive for laptop and desktop viewports (1024px+).
- All protected API calls must include the Bearer token header.

## Project Structure

```text
dealer-portal/
  src/
    components/
      Sidebar.tsx
      TopBar.tsx
      properties/
        AmenitiesFormSection.tsx
    layouts/
      DashboardLayout.tsx
    pages/
      auth/
        LoginPage.tsx
        RegisterPage.tsx
      dashboard/
        DashboardPage.tsx
      properties/
        PropertiesPage.tsx
        AddPropertyPage.tsx
        EditPropertyPage.tsx
      inquiries/
        InquiriesPage.tsx
      analytics/
        AnalyticsPage.tsx
      profile/
        ProfilePage.tsx
    store/
      useAuthStore.ts
    services/
      api.ts
    routes.tsx
    App.tsx
    main.tsx
  server.ts
  vite.config.ts
```

## Open Decisions

- Whether dealers can self-register freely or require admin approval.
- Whether property drafts should be auto-saved to local storage before submission.
- Whether push/browser notifications are needed for new enquiries.
- Whether a dedicated visit enquiries tab is needed separate from property enquiries.
- Whether bulk property actions (bulk delete, bulk status change) are required.

## Suggested Milestones

### Milestone 1: Auth Foundation

- Login and register pages.
- Role guard and protected route wrapper.
- Auth store with token persistence.
- API client with auth interceptor.

### Milestone 2: Property Management

- My Properties list with search and filter.
- Add Property (step 1 — details + media upload).
- Edit Property.
- Delete Property with confirmation.

### Milestone 3: Amenities

- Amenities form section (all toggles, selects, inputs).
- Preferred tenant multi-select chips.
- Save and load amenities on add/edit flow.

### Milestone 4: Enquiries and Analytics

- Inquiries page with filters.
- Status update.
- Analytics dashboard with charts.

### Milestone 5: Polish and QA

- Loading and empty states across all pages.
- Error boundary and API error toasts.
- Responsive layout review.
- Full QA pass across all flows.
