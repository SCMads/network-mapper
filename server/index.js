import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { nanoid } from 'nanoid';
import chalk from 'chalk';
import deviceStore from './deviceStore.js';
import { chooseScanner } from './scanner/index.js';
import { EVENTS } from './events.js';

// Load environment variables
const PORT = process.env.PORT || 3001;
const MOCK_MODE = process.env.MOCK_MODE !== 'false';
const SCAN_DEVICE_COUNT = parseInt(process.env.SCAN_DEVICE_COUNT) || 15;
const SCAN_DURATION_MS = parseInt(process.env.SCAN_DURATION_MS) || 8000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

console.log(chalk.blue('🚀 Starting Network Mapper Server'));
console.log(chalk.gray(`   Port: ${PORT}`));
console.log(chalk.gray(`   Mock Mode: ${MOCK_MODE}`));
console.log(chalk.gray(`   CORS Origin: ${CORS_ORIGIN}`));

// Create Express app
const app = express();
const server = createServer(app);

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// Track connected clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws, _req) => {
  const clientId = nanoid();
  clients.add(ws);
  
  console.log(chalk.green(`📱 Client connected: ${clientId} (${clients.size} total)`));
  
  // Send current state to new client
  ws.send(JSON.stringify({
    type: 'initialState',
    devices: deviceStore.getAllDevices(),
    scan: deviceStore.getCurrentScan(),
    timestamp: new Date()
  }));

  ws.on('close', () => {
    clients.delete(ws);
    console.log(chalk.yellow(`📱 Client disconnected: ${clientId} (${clients.size} total)`));
  });

  ws.on('error', (error) => {
    console.error(chalk.red(`❌ WebSocket error for client ${clientId}:`), error);
    clients.delete(ws);
  });
});

// Broadcast message to all connected clients
function broadcast(message) {
  const messageStr = JSON.stringify(message);
  clients.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(messageStr);
      } catch (error) {
        console.error(chalk.red('❌ Error broadcasting to client:'), error);
        clients.delete(ws);
      }
    }
  });
}

// Current scanner instance
let currentScanner = null;

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date(),
    mockMode: MOCK_MODE,
    connectedClients: clients.size,
    deviceCount: deviceStore.getDeviceCount()
  });
});

// Start scan
app.post('/api/scan', (req, res) => {
  try {
    // Check if scan is already running
    const currentScan = deviceStore.getCurrentScan();
    if (currentScan && currentScan.status === 'running') {
      return res.status(409).json({ 
        error: 'Scan already in progress',
        jobId: currentScan.jobId
      });
    }

    // Generate new job ID
    const jobId = nanoid();
    
    // Clear previous devices for new scan
    deviceStore.clear();
    
    // Start scan in device store
    deviceStore.startScan(jobId);
    
    // Create scanner
    currentScanner = chooseScanner({
      mockMode: MOCK_MODE,
      deviceCount: SCAN_DEVICE_COUNT,
      scanDuration: SCAN_DURATION_MS
    });

    console.log(chalk.blue(`🔍 Starting scan job: ${jobId}`));

    // Start scanning with event handlers
    currentScanner.startScan((event) => {
      console.log(chalk.gray(`📡 Scan event: ${event.type}`));
      
      switch (event.type) {
        case EVENTS.DEVICE_FOUND:
          deviceStore.addDevice(event.device);
          broadcast({
            type: EVENTS.DEVICE_FOUND,
            device: event.device,
            timestamp: event.timestamp
          });
          break;
          
        case EVENTS.SCAN_PROGRESS:
          deviceStore.updateScanProgress(event.progress);
          broadcast({
            type: EVENTS.SCAN_PROGRESS,
            progress: event.progress,
            devicesFound: event.devicesFound,
            timestamp: event.timestamp
          });
          break;
          
        case EVENTS.SCAN_COMPLETED:
          deviceStore.completeScan();
          broadcast({
            type: EVENTS.SCAN_COMPLETED,
            totalDevices: event.totalDevices,
            timestamp: event.timestamp
          });
          currentScanner = null;
          console.log(chalk.green(`✅ Scan completed: ${event.totalDevices} devices found`));
          break;
          
        case EVENTS.SCAN_CANCELLED:
          deviceStore.cancelScan();
          broadcast({
            type: EVENTS.SCAN_CANCELLED,
            timestamp: event.timestamp
          });
          currentScanner = null;
          console.log(chalk.yellow(`⏹️  Scan cancelled`));
          break;
          
        case EVENTS.SCAN_STARTED:
          broadcast({
            type: EVENTS.SCAN_STARTED,
            jobId,
            timestamp: event.timestamp
          });
          break;
      }
    });

    res.json({ jobId });
    
  } catch (error) {
    console.error(chalk.red('❌ Error starting scan:'), error);
    res.status(500).json({ error: 'Failed to start scan' });
  }
});

// Cancel scan
app.post('/api/scan/cancel', (req, res) => {
  try {
    if (currentScanner) {
      currentScanner.cancel();
      res.json({ message: 'Scan cancelled' });
    } else {
      res.status(404).json({ error: 'No active scan to cancel' });
    }
  } catch (error) {
    console.error(chalk.red('❌ Error cancelling scan:'), error);
    res.status(500).json({ error: 'Failed to cancel scan' });
  }
});

// Get devices
app.get('/api/devices', (req, res) => {
  try {
    const devices = deviceStore.getAllDevices();
    res.json({ 
      devices,
      count: devices.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error(chalk.red('❌ Error getting devices:'), error);
    res.status(500).json({ error: 'Failed to get devices' });
  }
});

// Get scan status
app.get('/api/scan/status', (req, res) => {
  try {
    const scan = deviceStore.getCurrentScan();
    res.json({ 
      scan: scan || { status: 'idle' },
      timestamp: new Date()
    });
  } catch (error) {
    console.error(chalk.red('❌ Error getting scan status:'), error);
    res.status(500).json({ error: 'Failed to get scan status' });
  }
});

// Error handling middleware
app.use((error, req, res, _next) => {
  console.error(chalk.red('❌ Unhandled error:'), error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(chalk.green(`🌐 Server running on http://localhost:${PORT}`));
  console.log(chalk.green(`🔌 WebSocket server running on ws://localhost:${PORT}/ws`));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(chalk.yellow('📴 Shutting down server...'));
  
  if (currentScanner) {
    currentScanner.cancel();
  }
  
  server.close(() => {
    console.log(chalk.green('✅ Server shut down gracefully'));
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(chalk.yellow('📴 Shutting down server...'));
  
  if (currentScanner) {
    currentScanner.cancel();
  }
  
  server.close(() => {
    console.log(chalk.green('✅ Server shut down gracefully'));
    process.exit(0);
  });
});