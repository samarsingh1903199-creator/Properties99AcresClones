# User Android App Requirements

## Project Overview

Build a native Android app for users who want to browse, compare, save, and enquire about properties listed on the Luxury Real Estate platform. This app is the customer-facing marketplace experience and should connect to the existing backend APIs.

## Goals

- Let users discover active buy/rent properties quickly.
- Show property details, media, amenities, preferred tenant types, and location.
- Support visitor signup/login.
- Let users save favorite properties.
- Let users submit property enquiries and visit requests.
- Keep the mobile experience aligned with the current web frontend.

## Target Platform

- Platform: Android
- Minimum Android version: Android 8.0 Oreo, API 26
- Recommended language: Kotlin
- Recommended UI: Jetpack Compose
- Recommended architecture: MVVM with Repository pattern
- Recommended networking: Retrofit or Ktor client
- Recommended image loading: Coil
- Recommended storage: DataStore for auth/session and wishlist

## Core Screens

### Splash Screen

- Show app logo/name.
- Check stored auth token.
- Route user to Home.

### Home Screen

- Search entry.
- Category tabs:
  - Rent
  - Buy
  - Apartments
  - Villas
  - Commercial
  - Plots
- Featured/active properties.
- Smart filters for rentals:
  - Price range
  - Preferred tenant type
  - Distance

### Property Listing Screen

- Show all active public properties.
- Search by title, location, or city.
- Sort options:
  - Newest first
  - Price low to high
  - Price high to low
  - Most viewed
- Filters:
  - Listing type
  - Price range
  - Property type
  - Bedrooms
  - Furnishing
  - Preferred tenant type
  - Distance
- Property cards must display:
  - Cover image
  - Title
  - Location
  - Price or monthly rent
  - Beds, baths, area
  - Preferred tenant chips
  - Wishlist action
  - Enquire/book action

### Property Details Screen

- Image gallery with swipe support.
- Title, location, city, and price.
- Listing type: buy or rent.
- Key specs:
  - Bedrooms
  - Bathrooms
  - Area
  - Property type
  - Listed date
  - Views
- Amenities:
  - Parking
  - Power backup
  - 24/7 security
  - WiFi
  - Gymnasium
  - Swimming pool
  - Club house
  - Air conditioning
  - Water supply
  - Furnishing details
  - Security deposit
  - Distance from location
- Preferred tenant types:
  - Family
  - Couples
  - Girls
  - Boys
  - Independent
  - Working Professionals
- Actions:
  - Save/unsave property
  - Share property
  - Submit enquiry
  - Book physical visit
  - Request video tour
  - Open location in Google Maps

### Login Screen

- Email.
- Password.
- Login with backend API.
- Store JWT token securely.
- Show readable validation/API errors.

### Register Screen

- Name.
- Email.
- Phone.
- Password.
- Register as `visitor`.
- Store JWT token after successful signup.

### Wishlist Screen

- Show saved property IDs from local storage.
- Fetch matching property details.
- Allow remove from wishlist.
- Empty state with CTA to browse properties.

### Enquiry / Visit Request Screen

- Collect:
  - Name
  - Email
  - Phone
  - Visit type: physical or video
  - Visit date
  - Visit time
  - Guest count
  - Message
- Submit to backend.
- Show success state and next steps.

### Profile Screen

- Show logged-in user details:
  - Name
  - Email
  - Phone
  - Role
- Logout.

## Backend APIs

For Android emulator local development:

```text
http://10.0.2.2:3002
```

For production:

```text
https://your-production-api-domain.com
```

### Public Property List

```http
GET /api/public/properties
```

Query parameters:

- `listingType`
- `type`
- `city`
- `minPrice`
- `maxPrice`
- `search`
- `limit`

### Public Property Detail

```http
GET /api/public/properties/{id}
```

### Record View

```http
POST /api/public/properties/{propertyId}/view
```

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

### Current User

```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Create Inquiry

```http
POST /api/inquiries
```

### Create Visit Enquiry

```http
POST /api/visit-enquiries
```

## Core Data Models

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

## Functional Requirements

- Fetch and display active properties.
- Display tenant types on listing cards and detail pages.
- Filter rental listings by preferred tenant type.
- Record views when a property detail screen opens.
- Persist login token securely.
- Persist wishlist locally.
- Submit enquiries and visit requests.
- Handle loading, empty, unauthorized, and network-error states.

## Non-Functional Requirements

- Listing screen first content should render within 2 seconds on a normal 4G connection.
- Images should be cached and resized efficiently.
- App should not crash on missing images or optional amenities.
- API errors should show readable messages.
- Production API must use HTTPS.
- Secrets must not be hardcoded in the Android app.

## Suggested Milestones

### Milestone 1: Foundation

- Android project setup.
- API client setup.
- App navigation.
- Theme and reusable components.

### Milestone 2: Marketplace

- Home screen.
- Property listing.
- Property details.
- Tenant chips and filters.

### Milestone 3: Auth and User Actions

- Register.
- Login.
- Profile.
- Wishlist.

### Milestone 4: Enquiries

- General enquiry form.
- Visit request form.
- Success and error states.

### Milestone 5: Release Polish

- Loading states.
- Empty states.
- Error handling.
- QA pass.
- Release build.
