import type { Express } from "express";
import type { Server } from "http";
import path from "path";
import express from "express";
import fs from "fs";

export async function setupVite(app: Express, server: Server) {
  // Dev only - not used in production
}

export function serveStatic(app: Express) {
  const distPath = path.join(process.cwd(), 'dist', 'public');

  // Serve static files FIRST
  app.use(express.static(distPath, {
    maxAge: '1h',
    etag: false
  }));

  // API routes already registered in routes.ts before this is called!

  // SPA fallback - ONLY for non-API routes
  app.get('*', (req, res) => {
    // Don't fallback for /api routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    // Serve index.html for all other routes (React SPA)
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

export function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}
