import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS - More permissive for preflight requests
const corsOptions: cors.CorsOptions = {
  origin: true, // Allow all origins (safe for your use case)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes

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

(async () => {
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('❌ Error:', { status, message });
      res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { error: err.stack })
      });
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = Number(process.env.PORT) || 5000;
    server.listen(
      { port, host: '0.0.0.0' },
      () => {
        log(`✅ Server running on http://0.0.0.0:${port}`);
        log(`📧 Contact API: POST /api/contact`);
        log(`🌐 CORS: All origins allowed`);
      }
    );
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
