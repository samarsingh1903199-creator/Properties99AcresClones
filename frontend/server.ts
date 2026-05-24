import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || "0.0.0.0";
  const enableHmr = process.env.ENABLE_HMR === "true";

  app.use(express.json());

  // AI Assistant Endpoint (Example for future use)
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a helpful real estate assistant for "Neo-Prime Property Dealer". 
      A user asks: ${message}
      Provide a concise and professional response.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      res.json({ text: result.text });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to communicate with AI" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: true,
        watch: {},
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
