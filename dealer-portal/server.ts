import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.DEALER_PORT) || 3001;
  const HOST = process.env.HOST || "0.0.0.0";

  app.use(express.json());

  // ── Dev: Vite middleware ──────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { port: 24680 },
        watch: {},
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // ── Prod: serve built assets ──────────────────────────────────
    const distPath = path.join(process.cwd(), "dist", "client");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Dealer Portal running on http://localhost:${PORT}`);
  });
}

startServer();
