import type { Express } from "express";
import { createServer, type Server } from "http";
import { contactHandler } from "./contact";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/contact", contactHandler);

  const httpServer = createServer(app);

  return httpServer;
}
