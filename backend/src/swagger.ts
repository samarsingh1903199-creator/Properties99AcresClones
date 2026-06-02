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
            id:          { type: "string", example: "1" },
            title:       { type: "string", example: "Luxury Sea-View Penthouse" },
            type:        { type: "string", enum: ["apartment", "villa", "plot", "commercial", "penthouse"] },
            listingType: { type: "string", enum: ["sale", "rent"] },
            price:       { type: "number", example: 12500000 },
            area:        { type: "number", example: 4200 },
            bedrooms:    { type: "number", example: 5 },
            bathrooms:   { type: "number", example: 6 },
            location:    { type: "string", example: "Marine Drive, Mumbai" },
            city:        { type: "string", example: "Mumbai" },
            description: { type: "string" },
            images:      { type: "array", items: { type: "string" } },
            status:      { type: "string", enum: ["active", "pending", "sold", "rented", "draft"] },
            views:       { type: "number" },
            inquiries:   { type: "number" },
            amenities:   { $ref: "#/components/schemas/PropertyAmenities" },
            createdAt:   { type: "string", format: "date" },
            ownerId:     { type: "string" },
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
                  required: ["title","type","listingType","price","area","location","city"],
                  properties: {
                    title:       { type: "string", example: "Sea-View Penthouse" },
                    type:        { type: "string", enum: ["apartment","villa","plot","commercial","penthouse"] },
                    listingType: { type: "string", enum: ["sale","rent"] },
                    price:       { type: "number", example: 12500000 },
                    area:        { type: "number", example: 4200 },
                    bedrooms:    { type: "number", example: 4 },
                    bathrooms:   { type: "number", example: 3 },
                    location:    { type: "string", example: "Marine Drive, Mumbai" },
                    city:        { type: "string", example: "Mumbai" },
                    description: { type: "string" },
                    images:      { type: "array", items: { type: "string" } },
                    status:      { type: "string", enum: ["active","pending","draft"] },
                    amenities:   { $ref: "#/components/schemas/PropertyAmenities", description: "Optional amenities to set at creation time" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Property created" },
            "400": { description: "Missing required fields" },
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
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title:       { type: "string" },
                    price:       { type: "number" },
                    status:      { type: "string", enum: ["active","pending","sold","rented","draft"] },
                    description: { type: "string" },
                    images:      { type: "array", items: { type: "string" } },
                    amenities:   { $ref: "#/components/schemas/PropertyAmenities" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Property updated" },
            "404": { description: "Not found" },
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
