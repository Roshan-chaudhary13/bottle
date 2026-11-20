import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes/api.js';
import { setupSockets } from './sockets/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  maxHttpBufferSize: 1e8 // 100MB for base64 screenshot uploads
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root & Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRouter);

// Serve the parent dashboard (built React app) from ./public when
// present. One service, one URL: open the server URL and the
// dashboard loads, talking to this same origin's Socket.IO — no
// extra env config. The dashboard build lives in backend/public
// (copied from parent-dashboard/dist by the Dockerfile).
// Works from dist/ (public next to it) and from src/ in dev.
const publicDir = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '..', 'public'),
  path.join(process.cwd(), 'public'),
].find((dir) => fs.existsSync(path.join(dir, 'index.html')));
if (publicDir) {
  app.use(express.static(publicDir));
  // SPA fallback: any non-API route serves the dashboard.
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'FamilyShield Parental Control API',
      endpoints: {
        devices: '/api/devices',
        health: '/health'
      }
    });
  });
}

// Setup Sockets & WebRTC signaling
setupSockets(io);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🛡️  Parental Control Backend Server Running`);
  console.log(`📍 API Base: http://localhost:${PORT}/api`);
  console.log(`⚡ WebSocket / WebRTC Signaling: ws://localhost:${PORT}`);
  console.log(`=========================================`);
});
