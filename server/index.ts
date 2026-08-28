import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Robust detection of static files directory (supports dist/public, dist root, and development)
  const candidatePaths = [
    path.resolve(__dirname, "public"),
    path.resolve(__dirname),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "dist"),
    path.resolve(__dirname, "..", "dist", "public"),
    path.resolve(__dirname, "..", "dist"),
  ];

  const staticPath =
    candidatePaths.find((p) => fs.existsSync(path.join(p, "index.html"))) ||
    path.resolve(__dirname, "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    const indexPath = path.join(staticPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>FinTrack Loading</title>
          </head>
          <body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #0f172a;">
            <div style="text-align: center; max-width: 480px; padding: 32px; background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
              <h2 style="margin: 0 0 8px 0; font-size: 20px;">FinTrack</h2>
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px;">Initializing application bundle. Please refresh in a moment...</p>
              <button onclick="window.location.reload()" style="background: #2563eb; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">Refresh</button>
            </div>
          </body>
        </html>
      `);
    }
  });

  return { app, staticPath };
}

const { app } = createApp();
export default app;

async function startServer() {
  const server = createServer(app);
  const port = Number(process.env.PORT) || 3000;

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

// Only launch standalone listener when run directly
startServer().catch(console.error);
