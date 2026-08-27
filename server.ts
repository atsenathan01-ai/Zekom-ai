import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./api/index.ts";

const PORT = 3000;

// Vite middleware and static serving (used in local and standalone container environments)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(app._router ? app : (req, res, next) => next());
    // Static files
    import("express").then(({ default: express }) => {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ZEKROM Server] Running on http://localhost:${PORT}`);
  });
}

// Only launch standalone server if not running as a Vercel Serverless Function
if (!process.env.VERCEL) {
  startServer();
}

export default app;
