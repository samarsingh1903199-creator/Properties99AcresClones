# Dealer Android App Requirements

## Project Overview

Build a native Android app for dealers/property owners who manage listings on the Luxury Real Estate platform. This app should mirror the core dealer portal workflows from the web app and connect to the existing backend APIs.

The dealer app can be released after the user marketplace app, or developed as a separate dealer module inside the same Android codebase.

## Goals

- Let dealers manage their property inventory from mobile.
- Let dealers create and edit properties.
- Let dealers upload property media.
- Let dealers configure amenities and preferred tenant types.
- Let dealers manage enquiries and visit requests.
- Let dealers view basic analytics for listings.

## Target Platform

- Platform: Android
- Minimum Android version: Android 8.0 Oreo, API 26
- Recommended language: Kotlin
- Recommended UI: Jetpack Compose
- Recommended architecture: MVVM with Repository pattern
- Recommended networking: Retrofit or Ktor client
- Recommended image loading: Coil
- Recommended media upload: Multipart upload through Retrofit/Ktor
- Recommended storage: DataStore for auth/session

## Dealer Role

Dealer users should authenticate with role:

```text
dealer
```

The app should restrict dealer-only screens if the logged-in user role is `visitor`.

## Core Screens

### Splash Screen

- Check stored auth token.
- Fetch current user.
- Route dealer to Dashboard.
- Route unauthenticated users to Login.

### Dealer Login Screen

- Email.
- Password.
- Login with backend API.
- Validate dealer role after login.
- Store JWT token securely.

### Dealer Register Screen

- Name.
- Email.
- Phone.
- Password.
- Company name.
- License number.
- Register with role `dealer`.

### Dashboard Screen

- Summary cards:
  - Total properties
  - Active listings
  - Total views
  - Total enquiries
  - Portfolio value
- Top viewed properties.
- Recent enquiries.
- CTA to add property.

### My Properties Screen

- List dealer-owned properties.
- Search by title, location, city.
- Filter by:
  - Status
  - Listing type
  - Property type
  - City
- Each property card should show:
  - Cover image
  - Title
  - Status
  - Price
  - Views
  - Enquiries
  - Preferred tenant chips
  - Edit action
  - Delete action

### Add Property Screen

Use a step-based flow similar to the dealer portal.

Step 1: Property Details

- Title.
- Property type.
- Listing type.
- Price.
- Area.
- Bedrooms.
- Bathrooms.
- Address/location.
- City.
- Description.
- Status.
- Images/videos.

Step 2: Amenities

- Preferred tenant types.
- Parking.
- Power backup.
- 24/7 security.
- High-speed WiFi.
- Gymnasium.
- Swimming pool.
- Club house.
- Separate electricity meter.
- Air conditioning and AC count.
- Furnishing status.
- Beds count.
- Almirah/wardrobe.
- Storage room.
- Water supply.
- Security deposit.
- Distance from nearest landmark.

### Edit Property Screen

- Load existing property.
- Edit all details from Add Property.
- Replace/add/remove media.
- Save property details.
- Save amenities.

### Amenities Screen / Section

Preferred tenant types must support multi-select:

- Family
- Couples
- Girls
- Boys
- Independent
- Working Professionals

The app should send these as:

```json
{
  "preferred_tenants": ["Family", "Working Professionals"]
}
```

### Enquiries Screen

- Show property enquiries and visit enquiries.
- Filter by:
  - Status
  - Property
  - Visit type
  - Date
  - Search
- Show enquiry details:
  - User name
  - Email
  - Phone
  - Property title
  - Message
  - Visit type
  - Visit date/time
  - Guest count
- Update status.

### Analytics Screen

- Total properties.
- Active listings.
- Total views.
- Total enquiries.
- Portfolio value.
- Breakdown by property status.
- Breakdown by listing type.
- Top properties by views.

### Profile Screen

- Dealer name.
- Email.
- Phone.
- Company.
- License number.
- Role.
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

All dealer APIs require:

```http
Authorization: Bearer {token}
```

### Auth

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
PATCH /api/auth/me
```

### Dealer Properties

```http
GET /api/properties
GET /api/properties/{id}
POST /api/properties
PATCH /api/properties/{id}
DELETE /api/properties/{id}
```

### Property Amenities

```http
GET /api/properties/{id}/amenities
PATCH /api/properties/{id}/amenities
```

### Upload

```http
POST /api/upload
DELETE /api/upload
```

### Enquiries

```http
GET /api/inquiries
GET /api/inquiries/{id}
PATCH /api/inquiries/{id}
```

### Visit Enquiries

```http
GET /api/visit-enquiries
PATCH /api/visit-enquiries/{id}
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
- `role`
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

- Authenticate dealers.
- Block dealer screens for visitor users.
- Create properties.
- Edit properties.
- Upload images/videos.
- Save amenities.
- Save preferred tenant types.
- List own properties.
- Filter and search own properties.
- Delete properties after confirmation.
- View enquiries.
- Update enquiry status.
- View analytics.
- Persist auth token securely.
- Handle loading, empty, unauthorized, upload failure, and network-error states.

## Non-Functional Requirements

- Forms must preserve unsaved state during rotation/process recreation.
- Media upload should show progress.
- Large image uploads should be compressed before upload if possible.
- API errors should show readable messages.
- Production API must use HTTPS.
- Auth tokens must not be logged.
- Dealer app should remain usable on mid-range Android devices.

## Suggested Android Architecture

```text
app/
  data/
    api/
    dto/
    repository/
    local/
  domain/
    model/
    usecase/
  ui/
    navigation/
    theme/
    screens/
      auth/
      dashboard/
      properties/
      amenities/
      enquiries/
      analytics/
      profile/
```

## Testing Requirements

- Unit tests:
  - Auth repository.
  - Property payload mapping.
  - Amenities payload mapping.
  - Preferred tenant type validation.
  - Enquiry status update.
- UI tests:
  - Dealer login.
  - Add property required fields.
  - Amenities multi-select.
  - Property edit flow.
  - Enquiry status update.
- Manual QA:
  - Register dealer.
  - Login/logout.
  - Add property.
  - Upload media.
  - Save preferred tenants.
  - Edit property.
  - View analytics.
  - Update enquiry status.

## Release Checklist

- Backend deployed with HTTPS.
- Production API URL configured.
- App icon and splash screen finalized.
- Dealer onboarding text reviewed.
- Upload limits documented.
- Privacy policy prepared.
- Crash reporting added.
- Play Store listing assets prepared.

## Open Decisions

- Separate dealer app or dealer mode inside one app.
- Whether dealers can register freely or require admin approval.
- Whether push notifications are required for new enquiries.
- Whether property drafts should be saved locally before API submission.
- Whether media compression should happen client-side.

## Suggested Milestones

### Milestone 1: Dealer Foundation

- Auth.
- Role guard.
- Navigation.
- API client.

### Milestone 2: Property Management

- My Properties.
- Add property.
- Edit property.
- Delete property.

### Milestone 3: Amenities and Uploads

- Media upload.
- Amenities form.
- Preferred tenant types.

### Milestone 4: Enquiries and Analytics

- Enquiries list.
- Enquiry detail.
- Status update.
- Analytics dashboard.

### Milestone 5: Release Polish

- Loading states.
- Empty states.
- Error handling.
- QA pass.
- Release build.
