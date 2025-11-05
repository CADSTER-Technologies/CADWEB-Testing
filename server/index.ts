import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Middleware - Order matters!
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration (allow frontend to call API)
app.use(cors({
  origin: [
    'http://localhost:5173',           // Vite dev server
    'http://localhost:3000',           // Alternative local port
    'https://cadweb-testing.onrender.com',  // Production
    'https://cadster.in',               // Your domain (when configured)
  ],
  credentials: true,
}));

// Log API requests
console.log('🚀 Server starting...');
console.log('✅ RESEND API Key:', Boolean(process.env.RESEND_API_KEY) ? 'Present' : '❌ MISSING');

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize server
(async () => {
  try {
    const server = await registerRoutes(app);

    // Error handler middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('❌ Error:', { status, message, error: err });
      res.status(status).json({ 
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { error: err.stack })
      });
    });

    // Setup Vite or serve static files
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start server
    const port = Number(process.env.PORT) || 5000;
    server.listen(
      { port, host: '0.0.0.0' },
      () => {
        log(`✅ Server running on http://0.0.0.0:${port}`);
        log(`📧 Contact API: POST /api/contact`);
        log(`🌍 CORS enabled for: localhost:5173, cadweb-testing.onrender.com`);
      }
    );
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
