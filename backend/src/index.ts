import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { connectDB }       from "./config/database.js";
import { seedIfEmpty }     from "./config/seed.js";
import { swaggerSpec }     from "./swagger.js";
import { errorHandler }    from "./middleware/errorHandler.js";

import authRoutes            from "./routes/auth.routes.js";
import propertyRoutes        from "./routes/properties.routes.js";
import inquiryRoutes         from "./routes/inquiries.routes.js";
import visitEnquiryRoutes    from "./routes/visitEnquiries.routes.js";
import analyticsRoutes       from "./routes/analytics.routes.js";
import uploadRoutes          from "./routes/upload.routes.js";
import publicRoutes          from "./routes/public.routes.js";

const app  = express();
const PORT = Number(process.env.PORT) || 3002;

/* ── Middleware ── */
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"], credentials: true }));
app.use(express.json());

/* ── Swagger UI ── */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Luxury Real Estate API Docs",
  customCss: ".swagger-ui .topbar { background: #5b21b6; } .swagger-ui .topbar-wrapper img { display: none; } .swagger-ui .topbar-wrapper::before { content: '🏠 Luxury Real Estate API'; color: white; font-size: 1.1rem; font-weight: 700; }",
}));
app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

/* ── Health check ── */
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Luxury Real Estate API is running", timestamp: new Date().toISOString() });
});

/* ── Routes ── */
app.use("/api/auth",             authRoutes);
app.use("/api/properties",       propertyRoutes);
app.use("/api/inquiries",        inquiryRoutes);
app.use("/api/visit-enquiries",  visitEnquiryRoutes);
app.use("/api/analytics",        analyticsRoutes);
app.use("/api/upload",     uploadRoutes);
app.use("/api/public",    publicRoutes);

/* ── 404 ── */
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

/* ── Global error handler ── */
app.use(errorHandler);

/* ── Boot ── */
(async () => {
  try {
    await connectDB();
    await seedIfEmpty();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("\n  ✗ MongoDB connection failed:", msg);
    console.error("  → Check MONGODB_URI in backend/.env and make sure your Atlas cluster is reachable.\n");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`\n🏠  Luxury Real Estate API`);
    console.log(`   Running at  → http://localhost:${PORT}`);
    console.log(`   Swagger UI  → http://localhost:${PORT}/api-docs`);
    console.log(`   Health      → http://localhost:${PORT}/api/health`);
    console.log(`   Auth        → http://localhost:${PORT}/api/auth`);
    console.log(`   Properties  → http://localhost:${PORT}/api/properties`);
    console.log(`   Inquiries   → http://localhost:${PORT}/api/inquiries`);
    console.log(`   Analytics   → http://localhost:${PORT}/api/analytics`);
    console.log(`   Upload      → http://localhost:${PORT}/api/upload\n`);
  });
})();
