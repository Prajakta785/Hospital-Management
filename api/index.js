import app from '../server/index.js';
import { initDatabase } from '../server/config/db.js';

let isReady = false;

export default async function handler(req, res) {
  if (!isReady) {
    try {
      await initDatabase();
      isReady = true;
    } catch (err) {
      console.error('[Vercel Serverless] DB init error:', err);
    }
  }

  // Ensure request URL starts with /api if rewritten
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }

  return app(req, res);
}
