import swaggerJsdoc from "swagger-jsdoc";
import { PREFERRED_TENANT_TYPES } from "./constants/tenants.js";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Luxury Real Estate API",
      version: "1.0.0",
      description: "REST API for the Luxury Real Estate platform — manages properties, inquiries, analytics and dealer/owner authentication.",
    },
    servers: [{ url: "http://localhost:3002", description: "Development server" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste the JWT token returned by /api/auth/login",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id:            { type: "string", example: "user-1" },
            name:          { type: "string", example: "Ravi Sharma" },
            email:         { type: "string", example: "ravi@vexrealty.com" },
            role:          { type: "string", enum: ["dealer", "owner"] },
            phone:         { type: "string", example: "+91 98765 43210" },
            company:       { type: "string", example: "VEX Realty" },
            licenseNumber: { type: "string", example: "DL-MH-2024-001" },
            verified:      { type: "boolean" },
            createdAt:     { type: "string", format: "date" },
          },
        },
        PropertyAmenities: {
          type: "object",
          description: "Amenities and features attached to a property listing",
          properties: {
            parking:                  { type: "integer", enum: [0, 1, 2, 3], default: 0, description: "Number of parking spots available" },
            powerBackup:              { type: "boolean", default: false, description: "Full/partial power backup available" },
            security24x7:             { type: "boolean", default: false, description: "Round-the-clock security" },
            separateElectricityMeter: { type: "boolean", default: false, description: "Dedicated electricity meter for the unit" },
            waterSupply:              { type: "string", enum: ["municipal", "borewell", "both", "none"], default: "none", description: "Source of water supply" },
            highSpeedWifi:            { type: "boolean", default: false, description: "High-speed internet/WiFi connectivity" },
            gymnasium:                { type: "boolean", default: false, description: "Gymnasium / fitness centre on premises" },
            swimmingPool:             { type: "boolean", default: false, description: "Swimming pool on premises" },
            clubHouse:                { type: "boolean", default: false, description: "Club house / community hall" },
            airConditioning:          { type: "boolean", default: false, description: "Air conditioning installed" },
            acCount:                  { type: "integer", minimum: 0, default: 0, description: "Number of AC units installed" },
            furnishingStatus:         { type: "string", enum: ["unfurnished", "semi-furnished", "fully-furnished"], default: "unfurnished", description: "Furnishing level of the property" },
            bedsCount:                { type: "integer", minimum: 0, default: 0, description: "Total number of beds across all rooms" },
            almirah:                  { type: "boolean", default: false, description: "Built-in wardrobes / almirahs provided" },
            storage:                  { type: "boolean", default: false, description: "Dedicated storage space available" },
            securityDeposit:          { type: "number", minimum: 0, default: 0, description: "Refundable security deposit amount (₹)" },
            distanceFromLocation:     { type: "number", minimum: 0, default: 0, description: "Distance from the nearest landmark/metro (km)" },
            preferred_tenants: {
              type: "array",
              items: { type: "string", enum: [...PREFERRED_TENANT_TYPES] },
              default: [],
              description: "Tenant types suitable for this property — multiple selections allowed, duplicates ignored",
              example: ["Girls", "Family", "Working Professionals"],
            },
          },
        },
        Property: {
          type: "object",
          properties: {
            _id:         { type: "string", example: "64a1b2c3d4e5f6789abcdef0" },
            title:       { type: "string", example: "Luxury Sea-View Penthouse" },
            type:        { type: "string", example: "penthouse" },
            listingType: { type: "string", enum: ["sale", "rent"], example: "sale" },
            price:       { type: "number", example: 12500000 },
            area:        { type: "number", example: 4200 },
            bedrooms:    { type: "number", example: 5 },
            bathrooms:   { type: "number", example: 6 },
            location:    { type: "string", example: "Marine Drive, Plot No. 8", description: "Derived from address.street — kept for search/filter compatibility" },
            city:        { type: "string", example: "Mumbai", description: "Derived from address.city — kept for search/filter compatibility" },
            address:     { $ref: "#/components/schemas/Address" },
            description: { type: "string" },
            images:      { type: "array", items: { type: "string" } },
            status:      { type: "string", enum: ["active", "pending", "sold", "rented", "draft"] },
            views:       { type: "number" },
            inquiries:   { type: "number" },
            amenities:   { $ref: "#/components/schemas/PropertyAmenities" },
            saleDetails: { $ref: "#/components/schemas/SaleDetails" },
            createdAt:   { type: "string", format: "date-time" },
            updatedAt:   { type: "string", format: "date-time" },
            ownerId:     { type: "string" },
            isHighlighted: { type: "boolean", example: false, description: "Featured on the public homepage when true" },
            highlightedAt: { type: "string", format: "date-time", description: "When the property was last marked highlighted" },
          },
        },
        Inquiry: {
          type: "object",
          properties: {
            id:            { type: "string" },
            name:          { type: "string", example: "Priya Mehta" },
            phone:         { type: "string", example: "+91 98765 11111" },
            email:         { type: "string", example: "priya@example.com" },
            propertyId:    { type: "string" },
            propertyTitle: { type: "string" },
            message:       { type: "string" },
            status:        { type: "string", enum: ["new", "responded", "closed"] },
            createdAt:     { type: "string", format: "date" },
            ownerId:       { type: "string" },
          },
        },
        Analytics: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                totalViews:      { type: "number" },
                totalInquiries:  { type: "number" },
                activeListings:  { type: "number" },
                portfolioValue:  { type: "number" },
                totalProperties: { type: "number" },
              },
            },
            byStatus:   { type: "object" },
            byListing:  { type: "object" },
            topProperties:     { type: "array", items: { type: "object" } },
            inquiryBreakdown:  { type: "object" },
          },
        },
        UploadedMedia: {
          type: "object",
          properties: {
            url:          { type: "string", example: "https://res.cloudinary.com/donfevmiy/image/upload/v1/luxury-real-estate/abc123.jpg" },
            publicId:     { type: "string", example: "luxury-real-estate/abc123" },
            resourceType: { type: "string", enum: ["image", "video"], example: "image" },
            width:        { type: "number", example: 1920 },
            height:       { type: "number", example: 1080 },
            bytes:        { type: "number", example: 204800 },
            format:       { type: "string", example: "jpg" },
          },
        },
        GenerateDescriptionRequest: {
          type: "object",
          required: ["listingType", "title", "city"],
          properties: {
            listingType:  { type: "string", example: "rent", description: "rent, sale, or lease" },
            propertyType: { type: "string", example: "Independent Flat" },
            title:        { type: "string", example: "2 BHK Independent Flat for Rent" },
            city:         { type: "string", example: "Mohali" },
            location:     { type: "string", example: "Sector 70" },
            bedrooms:     { type: "number", example: 2 },
            bathrooms:    { type: "number", example: 2 },
            area:         { oneOf: [{ type: "number" }, { type: "string" }], example: 1250 },
            furnishing:   { type: "string", example: "semi-furnished" },
            parking:      { type: "number", example: 1 },
            price:        { oneOf: [{ type: "number" }, { type: "string" }], example: 18000 },
            amenities:    { type: "array", items: { type: "string" }, example: ["Lift", "Power Backup", "Gym"] },
            style:        { type: "string", enum: ["professional","luxury","family","investment","student","commercial","premium"], default: "professional" },
            length:       { type: "string", enum: ["short","medium","long"], default: "medium" },
            regenerate:   { type: "boolean", default: false, description: "Request alternate wording" },
          },
        },
        GenerateDescriptionResponse: {
          type: "object",
          properties: {
            description: { type: "string", example: "Discover this spacious 2 BHK independent flat available for rent in Mohali..." },
            model:       { type: "string", example: "llama-3.3-70b-versatile" },
            wordCount:   { type: "number", example: 142 },
          },
        },
        PropertyView: {
          type: "object",
          properties: {
            _id:           { type: "string" },
            propertyId:    { type: "string" },
            propertyTitle: { type: "string" },
            ownerId:       { type: "string" },
            userId:        { type: "string", example: "" },
            userName:      { type: "string", example: "Priya Mehta" },
            userEmail:     { type: "string", example: "priya@example.com" },
            userPhone:     { type: "string", example: "+91 98765 43210" },
            source:        { type: "string", enum: ["view", "book"] },
            viewedAt:      { type: "string", format: "date-time" },
          },
        },
        Address: {
          type: "object",
          description: "Structured address of the property. `city` and `street` are required on creation — they are also stored as the flat `city` and `location` fields on the property document for search compatibility.",
          required: ["city", "street"],
          properties: {
            country:    { type: "string", example: "India" },
            state:      { type: "string", example: "Haryana" },
            city:       { type: "string", example: "Gurugram", description: "Required. Mapped to the top-level city field." },
            locality:   { type: "string", example: "Sector 54, DLF Phase 2", description: "Neighbourhood / sector / sub-locality" },
            street:     { type: "string", example: "Golf Course Road, Plot No. 12", description: "Required. Mapped to the top-level location field." },
            landmark:   { type: "string", example: "Near Ambience Mall" },
            postalCode: { type: "string", example: "122002" },
            lat:        { type: "number", example: 28.4595, description: "Latitude — auto-filled by Google Places Autocomplete on the frontend" },
            lng:        { type: "number", example: 77.0266, description: "Longitude — auto-filled by Google Places Autocomplete on the frontend" },
          },
        },
        SaleDetails: {
          type: "object",
          description: "Additional details applicable only to sale listings. Ignored for rent listings.",
          properties: {
            pricePerSqft:       { type: "number", minimum: 0, example: 8500, description: "Price per sq. ft (₹)" },
            bookingAmount:      { type: "number", minimum: 0, example: 500000, description: "Token / booking amount (₹)" },
            maintenanceCharges: { type: "number", minimum: 0, example: 5000, description: "Monthly maintenance charges (₹)" },
            negotiable:         { type: "boolean", example: true },
            loanAvailable:      { type: "boolean", example: true },
            ownershipType:      { type: "string", enum: ["freehold","leasehold","builder-owned","resale"], example: "freehold" },
            propertyAge:        { type: "number", minimum: 0, example: 5, description: "Age of the property in years" },
            possessionStatus:   { type: "string", enum: ["ready-to-move","under-construction"], example: "ready-to-move" },
            possessionDate:     { type: "string", example: "2025-12-31", description: "Expected possession date (ISO date string)" },
            floorNumber:        { type: "string", example: "4" },
            totalFloors:        { type: "number", minimum: 1, example: 12 },
            facing:             { type: "string", enum: ["north","south","east","west","north-east","north-west","south-east","south-west"], example: "east" },
            vastuCompliant:     { type: "boolean", example: true },
            carpetArea:         { type: "number", minimum: 0, example: 1800, description: "Carpet area (sq. ft)" },
            builtUpArea:        { type: "number", minimum: 0, example: 2000, description: "Built-up area (sq. ft)" },
            superBuiltUpArea:   { type: "number", minimum: 0, example: 2400, description: "Super built-up area (sq. ft)" },
            reraNumber:         { type: "string", example: "RERA/GGM/2024/XXXXX" },
            registryStatus:     { type: "string", enum: ["clear","pending","disputed"], example: "clear" },
            legalApprovals:     { type: "string", enum: ["approved","pending","disputed"], example: "approved" },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id:          { type: "string" },
            name:         { type: "string", example: "For Rent" },
            slug:         { type: "string", example: "rent", description: "Unique key stored on Property documents as listingType or type" },
            categoryType: { type: "string", enum: ["listing", "property"], example: "listing" },
            icon:         { type: "string", example: "key" },
            order:        { type: "integer", example: 1 },
            isActive:     { type: "boolean", example: true },
            createdAt:    { type: "string", format: "date-time" },
            updatedAt:    { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
    },
    paths: {
      /* ── Health ── */
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            "200": { description: "API is running" },
          },
        },
      },

      /* ── Auth ── */
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login and receive a JWT",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email:    { type: "string", example: "ravi@vexrealty.com" },
                    password: { type: "string", example: "password" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      token:   { type: "string" },
                      user:    { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            "401": { description: "Invalid credentials" },
          },
        },
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new dealer or owner account",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password", "role"],
                  properties: {
                    name:          { type: "string", example: "Aisha Khan" },
                    email:         { type: "string", example: "aisha@realty.com" },
                    password:      { type: "string", example: "secret123" },
                    role:          { type: "string", enum: ["dealer", "owner"] },
                    phone:         { type: "string" },
                    company:       { type: "string" },
                    licenseNumber: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Registration successful, JWT returned" },
            "409": { description: "Email already registered" },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current logged-in user",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Current user profile", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
            "401": { description: "Unauthorized" },
          },
        },
        patch: {
          tags: ["Auth"],
          summary: "Update current user profile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name:          { type: "string" },
                    phone:         { type: "string" },
                    company:       { type: "string" },
                    licenseNumber: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Profile updated" },
            "401": { description: "Unauthorized" },
          },
        },
      },

      /* ── Properties ── */
      "/api/properties": {
        get: {
          tags: ["Properties"],
          summary: "List all properties for the authenticated user",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "status",      in: "query", schema: { type: "string", enum: ["active","pending","sold","rented","draft"] } },
            { name: "listingType", in: "query", schema: { type: "string", enum: ["sale","rent"] } },
            { name: "city",        in: "query", schema: { type: "string" } },
            { name: "type",        in: "query", schema: { type: "string", enum: ["apartment","villa","plot","commercial","penthouse"] } },
            { name: "minPrice",    in: "query", schema: { type: "number" } },
            { name: "maxPrice",    in: "query", schema: { type: "number" } },
            { name: "search",      in: "query", schema: { type: "string" }, description: "Search by title, location or city" },
          ],
          responses: {
            "200": {
              description: "List of properties",
              content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, count: { type: "number" }, data: { type: "array", items: { $ref: "#/components/schemas/Property" } } } } } },
            },
          },
        },
        post: {
          tags: ["Properties"],
          summary: "Create a new property listing",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title","type","listingType","price","area","address"],
                  properties: {
                    title:       { type: "string", example: "Luxury Sea-View Penthouse" },
                    type:        { type: "string", example: "penthouse", description: "Property category slug (e.g. apartment, villa, penthouse)" },
                    listingType: { type: "string", enum: ["sale","rent"], example: "sale" },
                    price:       { type: "number", example: 12500000 },
                    area:        { type: "number", example: 4200, description: "Total area in sq. ft" },
                    bedrooms:    { type: "number", example: 4, default: 1 },
                    bathrooms:   { type: "number", example: 3, default: 1 },
                    address: {
                      allOf: [{ $ref: "#/components/schemas/Address" }],
                      description: "Full structured address. `address.city` and `address.street` are required.",
                    },
                    description: { type: "string", example: "Sprawling penthouse with panoramic sea views and private terrace." },
                    images:      { type: "array", items: { type: "string" }, description: "Array of Cloudinary URLs returned by POST /api/upload" },
                    status:      { type: "string", enum: ["active","pending","draft"], default: "draft" },
                    amenities:   { allOf: [{ $ref: "#/components/schemas/PropertyAmenities" }], description: "Optional amenities — can also be set later via PATCH /api/properties/{id}/amenities" },
                    saleDetails: { allOf: [{ $ref: "#/components/schemas/SaleDetails" }], description: "Required only when listingType is sale" },
                  },
                  example: {
                    title: "Golf Course Penthouse",
                    type: "penthouse",
                    listingType: "sale",
                    price: 45000000,
                    area: 4200,
                    bedrooms: 4,
                    bathrooms: 4,
                    address: {
                      country: "India",
                      state: "Haryana",
                      city: "Gurugram",
                      locality: "DLF Phase 5",
                      street: "Golf Course Road, Plot No. 12",
                      landmark: "Near Ambience Mall",
                      postalCode: "122002",
                      lat: 28.4595,
                      lng: 77.0266,
                    },
                    description: "Sprawling penthouse with panoramic views of the Golf Course.",
                    images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"],
                    status: "active",
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Property created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data:    { $ref: "#/components/schemas/Property" },
                    },
                  },
                },
              },
            },
            "400": { description: "Missing required fields — title, type, listingType, price, area, address (with city and street) are all required" },
            "401": { description: "Unauthorized — JWT required" },
          },
        },
      },
      "/api/properties/generate-description": {
        post: {
          tags: ["Properties", "AI"],
          summary: "Generate a property listing description with Groq AI",
          description: "Uses property details from the request body to generate a professional listing description. Requires GROQ_API_KEY in server environment.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GenerateDescriptionRequest" },
                example: {
                  listingType: "rent",
                  propertyType: "Independent Flat",
                  title: "2 BHK Independent Flat for Rent",
                  city: "Mohali",
                  location: "Sector 70",
                  bedrooms: 2,
                  bathrooms: 2,
                  area: 1250,
                  furnishing: "semi-furnished",
                  parking: 1,
                  price: 18000,
                  amenities: ["Lift", "Power Backup", "Gym"],
                  style: "professional",
                  length: "medium",
                  regenerate: false,
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Generated description",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/GenerateDescriptionResponse" },
                    },
                  },
                },
              },
            },
            "400": { description: "Missing or invalid request fields" },
            "401": { description: "Unauthorized — JWT required" },
            "503": { description: "AI service not configured (GROQ_API_KEY missing)" },
          },
        },
      },
      "/api/properties/highlighted": {
        get: {
          tags: ["Properties"],
          summary: "List highlighted properties for the authenticated dealer",
          description: "Returns properties marked as highlighted by the logged-in dealer (or all highlighted for admins), newest first.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "limit", in: "query", schema: { type: "integer", default: 50, maximum: 100 } },
          ],
          responses: {
            "200": {
              description: "Highlighted properties",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      count: { type: "number" },
                      data: { type: "array", items: { $ref: "#/components/schemas/Property" } },
                    },
                  },
                },
              },
            },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/api/properties/{id}/highlight": {
        patch: {
          tags: ["Properties"],
          summary: "Mark or unmark a property as highlighted",
          description: "Dealers can highlight their own active/pending listings. Admins can highlight any property.",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["highlighted"],
                  properties: {
                    highlighted: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Highlight status updated" },
            "400": { description: "Invalid body or property not eligible" },
            "401": { description: "Unauthorized" },
            "404": { description: "Property not found" },
          },
        },
      },
      "/api/properties/{id}": {
        get: {
          tags: ["Properties"],
          summary: "Get a single property by ID (increments view count)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Property details", content: { "application/json": { schema: { $ref: "#/components/schemas/Property" } } } },
            "404": { description: "Not found" },
          },
        },
        patch: {
          tags: ["Properties"],
          summary: "Update a property",
          description: "Partial update — send only the fields you want to change. When `address` is provided, `location` and `city` are automatically re-derived from `address.street` and `address.city`.",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title:       { type: "string", example: "Updated Penthouse Title" },
                    type:        { type: "string", example: "penthouse", description: "Property category slug" },
                    listingType: { type: "string", enum: ["sale","rent"] },
                    price:       { type: "number", example: 48000000 },
                    area:        { type: "number", example: 4500 },
                    bedrooms:    { type: "number", example: 5 },
                    bathrooms:   { type: "number", example: 5 },
                    address:     { allOf: [{ $ref: "#/components/schemas/Address" }], description: "Partial address update — only provided sub-fields are merged. city and street are synced to the flat fields automatically." },
                    description: { type: "string" },
                    images:      { type: "array", items: { type: "string" }, description: "Full replacement array of Cloudinary URLs" },
                    status:      { type: "string", enum: ["active","pending","sold","rented","draft"] },
                    amenities:   { allOf: [{ $ref: "#/components/schemas/PropertyAmenities" }] },
                    saleDetails: { allOf: [{ $ref: "#/components/schemas/SaleDetails" }] },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Property updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data:    { $ref: "#/components/schemas/Property" },
                    },
                  },
                },
              },
            },
            "401": { description: "Unauthorized" },
            "404": { description: "Property not found or does not belong to the caller" },
          },
        },
        delete: {
          tags: ["Properties"],
          summary: "Delete a property",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Deleted successfully" },
            "404": { description: "Not found" },
          },
        },
      },

      /* ── Property Amenities ── */
      "/api/properties/{id}/amenities": {
        get: {
          tags: ["Amenities"],
          summary: "Get amenities for a property",
          description: "Returns only the amenities object for the specified property. Requires the caller to be the property owner.",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Property _id" }],
          responses: {
            "200": {
              description: "Amenities object for the property",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success:    { type: "boolean", example: true },
                      propertyId: { type: "string" },
                      data:       { $ref: "#/components/schemas/PropertyAmenities" },
                    },
                  },
                },
              },
            },
            "401": { description: "Unauthorized" },
            "404": { description: "Property not found" },
          },
        },
        patch: {
          tags: ["Amenities"],
          summary: "Add or update amenities for a property",
          description: "Partial merge-update — send only the amenity fields you want to change. Unspecified fields retain their current values. Requires the caller to be the property owner.",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Property _id" }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PropertyAmenities",
                  example: {
                    parking: 2,
                    powerBackup: true,
                    security24x7: true,
                    separateElectricityMeter: true,
                    waterSupply: "municipal",
                    highSpeedWifi: true,
                    gymnasium: true,
                    swimmingPool: false,
                    clubHouse: true,
                    airConditioning: true,
                    acCount: 3,
                    furnishingStatus: "fully-furnished",
                    bedsCount: 3,
                    almirah: true,
                    storage: true,
                    securityDeposit: 150000,
                    distanceFromLocation: 0.8,
                    preferred_tenants: ["Girls", "Family", "Working Professionals"],
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated amenities object",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success:    { type: "boolean", example: true },
                      propertyId: { type: "string" },
                      data:       { $ref: "#/components/schemas/PropertyAmenities" },
                    },
                  },
                },
              },
            },
            "400": { description: "No valid amenity fields provided" },
            "401": { description: "Unauthorized" },
            "404": { description: "Property not found" },
          },
        },
      },

      /* ── Inquiries ── */
      "/api/inquiries": {
        get: {
          tags: ["Inquiries"],
          summary: "List inquiries for the authenticated user's properties",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "status",     in: "query", schema: { type: "string", enum: ["new","responded","closed"] } },
            { name: "propertyId", in: "query", schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "List of inquiries", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, count: { type: "number" }, data: { type: "array", items: { $ref: "#/components/schemas/Inquiry" } } } } } } },
          },
        },
        post: {
          tags: ["Inquiries"],
          summary: "Submit a new inquiry for a property (public — no auth required)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name","email","propertyId","message"],
                  properties: {
                    name:       { type: "string", example: "Priya Mehta" },
                    phone:      { type: "string", example: "+91 98765 11111" },
                    email:      { type: "string", example: "priya@example.com" },
                    propertyId: { type: "string", example: "1" },
                    message:    { type: "string", example: "I'd like to schedule a visit." },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Inquiry submitted" },
            "400": { description: "Missing required fields" },
            "404": { description: "Property not found" },
          },
        },
      },
      "/api/inquiries/{id}": {
        get: {
          tags: ["Inquiries"],
          summary: "Get a single inquiry by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Inquiry details" },
            "404": { description: "Not found" },
          },
        },
        patch: {
          tags: ["Inquiries"],
          summary: "Update inquiry status",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: { type: "string", enum: ["new","responded","closed"] },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Status updated" },
            "400": { description: "Invalid status" },
            "404": { description: "Not found" },
          },
        },
      },

      /* ── Analytics ── */
      "/api/analytics": {
        get: {
          tags: ["Analytics"],
          summary: "Get portfolio analytics for the authenticated user",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Analytics data",
              content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Analytics" } } } } },
            },
          },
        },
      },

      /* ── Property Views (public) ── */
      "/api/public/properties/highlighted": {
        get: {
          tags: ["Public"],
          summary: "Get highlighted / featured properties",
          description: "Returns active listings marked as highlighted, newest highlights first. No auth required.",
          parameters: [
            { name: "limit", in: "query", schema: { type: "integer", default: 12, maximum: 50 }, description: "Max results (default 12)" },
          ],
          responses: {
            "200": {
              description: "Highlighted properties",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      count:   { type: "number", example: 3 },
                      data:    { type: "array", items: { $ref: "#/components/schemas/Property" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/public/properties/{id}/view": {
        post: {
          tags: ["Property Views"],
          summary: "Record a property view or book-click (public — no auth needed)",
          description: "Call this when a visitor opens a property detail page (`source: view`) or clicks the Book button (`source: book`). Pass logged-in user details if available.",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Property _id" }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    userId:    { type: "string", description: "Logged-in user's _id (optional)" },
                    userName:  { type: "string", example: "Priya Mehta" },
                    userEmail: { type: "string", example: "priya@example.com" },
                    userPhone: { type: "string", example: "+91 98765 43210" },
                    source:    { type: "string", enum: ["view", "book"], default: "view" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "View recorded, returns updated view count", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, views: { type: "number" } } } } } },
            "404": { description: "Property not found or not active" },
          },
        },
      },

      /* ── Property Views (dealer) ── */
      "/api/properties/{id}/views": {
        get: {
          tags: ["Property Views"],
          summary: "Get viewer list for a specific property (dealer only)",
          description: "Returns every visitor who viewed or book-clicked this property. Only accessible by the property owner.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id",     in: "path",  required: true, schema: { type: "string" } },
            { name: "source", in: "query", schema: { type: "string", enum: ["view", "book"] }, description: "Filter by interaction type" },
            { name: "page",   in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit",  in: "query", schema: { type: "integer", default: 50 } },
          ],
          responses: {
            "200": {
              description: "Viewer records with summary stats",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success:  { type: "boolean" },
                      property: { type: "object", properties: { id: { type: "string" }, title: { type: "string" }, views: { type: "number" }, inquiries: { type: "number" } } },
                      summary:  { type: "object", properties: { totalViews: { type: "number" }, bookClicks: { type: "number" }, uniqueVisitors: { type: "number" } } },
                      pagination: { type: "object" },
                      data: { type: "array", items: { $ref: "#/components/schemas/PropertyView" } },
                    },
                  },
                },
              },
            },
            "404": { description: "Property not found" },
          },
        },
      },

      /* ── Analytics views (all properties) ── */
      "/api/analytics/views": {
        get: {
          tags: ["Property Views"],
          summary: "Get all viewer activity across all dealer properties",
          description: "Returns recent view/book events across all properties owned by the authenticated dealer.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "source", in: "query", schema: { type: "string", enum: ["view", "book"] } },
            { name: "page",   in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit",  in: "query", schema: { type: "integer", default: 50 } },
          ],
          responses: {
            "200": {
              description: "All viewer records with summary",
              content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, summary: { type: "object" }, pagination: { type: "object" }, data: { type: "array", items: { $ref: "#/components/schemas/PropertyView" } } } } } },
            },
          },
        },
      },

      /* ── Liked / Saved Properties ── */
      "/api/liked": {
        get: {
          tags: ["Liked Properties"],
          summary: "Get liked property IDs for the authenticated user",
          description: "Returns an array of property IDs that the user has saved/liked.",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Array of liked property IDs",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { type: "string" },
                        example: ["64a1b2c3d4e5f6789abcdef0"],
                      },
                    },
                  },
                },
              },
            },
            "401": { description: "Unauthorized — JWT required" },
            "404": { description: "User not found" },
          },
        },
      },
      "/api/liked/properties": {
        get: {
          tags: ["Liked Properties"],
          summary: "Get full property objects for all liked properties",
          description: "Returns the full property documents for every property the user has saved/liked.",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "List of liked property objects",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      count: { type: "number" },
                      data: { type: "array", items: { $ref: "#/components/schemas/Property" } },
                    },
                  },
                },
              },
            },
            "401": { description: "Unauthorized — JWT required" },
            "404": { description: "User not found" },
          },
        },
      },
      "/api/liked/{propertyId}": {
        post: {
          tags: ["Liked Properties"],
          summary: "Toggle like/save for a property",
          description: "If the property is not yet liked it gets added; if it is already liked it gets removed. Returns the updated list of liked IDs and a `liked` boolean.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "propertyId", in: "path", required: true, schema: { type: "string" }, description: "Property _id to toggle" },
          ],
          responses: {
            "200": {
              description: "Like toggled successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      liked:   { type: "boolean", description: "true = property was just liked, false = property was just unliked" },
                      data:    { type: "array", items: { type: "string" }, description: "Updated full list of liked property IDs" },
                    },
                  },
                },
              },
            },
            "400": { description: "Invalid property ID" },
            "401": { description: "Unauthorized — JWT required" },
            "404": { description: "Property or user not found" },
          },
        },
      },

      /* ── Categories ── */
      "/api/categories": {
        get: {
          tags: ["Categories"],
          summary: "List all active categories (public)",
          description: "Returns listing-type and property-type categories used to populate the frontend tabs and property forms. Pass `?type=listing` or `?type=property` to filter.",
          parameters: [
            { name: "type", in: "query", schema: { type: "string", enum: ["listing", "property"] }, description: "Filter by category type" },
          ],
          responses: {
            "200": {
              description: "List of categories",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      count:   { type: "number" },
                      data:    { type: "array", items: { $ref: "#/components/schemas/Category" } },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Categories"],
          summary: "Create a new category",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "slug", "categoryType"],
                  properties: {
                    name:         { type: "string", example: "Lease" },
                    slug:         { type: "string", example: "lease", description: "Unique lowercase identifier stored on Property documents" },
                    categoryType: { type: "string", enum: ["listing", "property"], example: "listing" },
                    icon:         { type: "string", example: "layers", description: "Lucide icon name" },
                    order:        { type: "integer", example: 3, description: "Sort order in UI tabs" },
                    isActive:     { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Category created" },
            "400": { description: "Missing required fields or invalid categoryType" },
            "409": { description: "Slug already exists" },
          },
        },
      },
      "/api/categories/{id}": {
        patch: {
          tags: ["Categories"],
          summary: "Update a category",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name:         { type: "string" },
                    slug:         { type: "string" },
                    categoryType: { type: "string", enum: ["listing", "property"] },
                    icon:         { type: "string" },
                    order:        { type: "integer" },
                    isActive:     { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Category updated" },
            "404": { description: "Category not found" },
            "409": { description: "Slug conflict" },
          },
        },
        delete: {
          tags: ["Categories"],
          summary: "Delete a category",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Category deleted" },
            "404": { description: "Category not found" },
          },
        },
      },

      /* ── Upload ── */
      "/api/upload": {
        post: {
          tags: ["Upload"],
          summary: "Upload images or videos to Cloudinary",
          description: "Accepts up to 10 files (images: JPG/PNG/WEBP/GIF, videos: MP4/MOV/WebM). Files are stored in the `luxury-real-estate/` Cloudinary folder. Images are auto-optimized. Returns permanent Cloudinary URLs.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["files"],
                  properties: {
                    files: {
                      type: "array",
                      items: { type: "string", format: "binary" },
                      description: "One or more image / video files (max 10, 100 MB each)",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Files uploaded successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/UploadedMedia" },
                      },
                    },
                  },
                },
              },
            },
            "400": { description: "No files provided, unsupported file type, or file too large" },
            "401": { description: "Unauthorized — JWT required" },
          },
        },
        delete: {
          tags: ["Upload"],
          summary: "Delete a Cloudinary asset by publicId",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["publicId"],
                  properties: {
                    publicId:     { type: "string", example: "luxury-real-estate/abc123" },
                    resourceType: { type: "string", enum: ["image", "video"], default: "image" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Asset deleted from Cloudinary" },
            "400": { description: "publicId is required" },
            "401": { description: "Unauthorized" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
