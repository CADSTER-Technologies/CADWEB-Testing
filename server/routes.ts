import type { Express } from "express";
import { createServer, type Server } from "http";
import { contactHandler } from "./contact";

/**
 * Registers all API routes on the provided Express app and
 * returns the underlying HTTP server instance.
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Contact endpoint — uses your Resend-backed handler
  app.post("/api/contact", contactHandler);

  const httpServer = createServer(app);
  return httpServer;
}
