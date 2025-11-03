import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, company, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ 
          success: false,
          message: 'Name, email, and message are required' 
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid email format' 
        });
      }

      console.log('Contact form submission:');
      console.log({
        name,
        email,
        company: company || 'Not provided',
        message,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.'
      });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing your request'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
