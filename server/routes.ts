import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { contactHandler } from "./contact";

export async function registerRoutes(app: Express): Promise<Server> {
  // POST endpoint for contact form
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      await contactHandler(req, res);
    } catch (err: any) {
      console.error('❌ [ROUTES] Unhandled error in contactHandler:', err);
      res.status(500).json({
        success: false,
        message: 'Server error occurred',
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
