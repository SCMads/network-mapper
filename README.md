# Network Mapper

A modern React + Node.js application for discovering and visualizing devices on your network. Features real-time scanning, interactive topology graphs, and comprehensive device information.

![Network Mapper Screenshot](https://github.com/user-attachments/assets/08f1b3c6-a15a-437f-8727-d38d379d8d82)

## Features

- 🔍 **Real-time Network Scanning** - Discover devices on your network with live progress updates
- 🌐 **Interactive Topology Graph** - Visualize network connections with cytoscape.js
- 📱 **Device Management** - View detailed device information including IP, MAC, vendor, and more
- 🔄 **Live Updates** - WebSocket-powered real-time updates as devices are discovered
- 📊 **Mock Mode** - Built-in simulation for development and testing
- 🎨 **Modern UI** - Clean, responsive interface built with React and Tailwind CSS
- ♿ **Accessible** - Keyboard navigation and screen reader support
- 🧪 **Well Tested** - Comprehensive test suite with Vitest and React Testing Library

## Architecture Overview

### Frontend (React + Vite)
- **Components**: ScanControls, DeviceList, DeviceDetails, TopologyGraph, StatusBar
- **Hooks**: Custom hooks for WebSocket, devices, and scan management
- **Services**: API client and WebSocket service with auto-reconnection
- **Styling**: Tailwind CSS with CSS variables for theming

### Backend (Node.js + Express)
- **REST API**: Health checks, scan control, device retrieval
- **WebSocket Server**: Real-time event broadcasting
- **Mock Scanner**: Simulates network discovery with realistic device data
- **Extensible Architecture**: Plugin system ready for real scanning implementations

### Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Cytoscape.js
- **Backend**: Node.js, Express, WebSocket (ws)
- **Testing**: Vitest, React Testing Library, Jest DOM
- **Development**: ESLint, Concurrently, Hot reload

## How to Run

### Prerequisites
- Node.js (v16 or higher)
- npm

### Frontend Only (Mock Mode)
For frontend development with simulated data:

```bash
npm install
npm run dev
```

Visit http://localhost:3000

### Full Stack Development
To run both frontend and backend with WebSocket support:

```bash
npm install
npm run dev:full
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3001/ws

### Individual Services

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## Environment Configuration

Copy `.env.example` to `.env` and customize:

```bash
# Server Configuration
PORT=3001

# Mock Mode (set to false to use real scanning when implemented)
MOCK_MODE=true

# Mock Scanner Configuration
SCAN_DEVICE_COUNT=15
SCAN_DURATION_MS=8000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Testing

Run the test suite:

```bash
npm test
```

**Included Tests:**
- `DeviceList.test.jsx` - Component rendering, interaction, and state management
- `mockScanner.test.js` - Scanner event emission, device generation, and timing

**Test Coverage:**
- Component rendering with mock data
- User interactions (device selection, keyboard navigation)
- WebSocket event handling
- Mock scanner behavior and event sequencing
- Error handling and loading states

## Adding a Real Scanner

The application is designed to easily integrate real network scanning tools. To add a new scanner:

1. **Create Scanner Implementation:**
   ```javascript
   // server/scanner/nmapScanner.js
   export default class NmapScanner {
     startScan(onEvent) {
       // Implement real scanning logic
       // Emit events: SCAN_STARTED, DEVICE_FOUND, SCAN_PROGRESS, SCAN_COMPLETED
     }
   }
   ```

2. **Register Scanner:**
   ```javascript
   // server/scanner/index.js
   import NmapScanner from './nmapScanner.js';
   
   export function chooseScanner(config) {
     if (config.mockMode) {
       return new MockScanner(config);
     }
     return new NmapScanner(config); // Use real scanner
   }
   ```

3. **Update Configuration:**
   ```bash
   MOCK_MODE=false
   ```

**Scanner Interface:**
- `startScan(onEvent)` - Begin scanning, return controller with `cancel()` method
- `isScanning()` - Return current scanning state
- Events must follow the schema defined in `server/events.js`

## Event Schema

All WebSocket events follow this structure:

```javascript
{
  type: 'scanStarted' | 'deviceFound' | 'scanProgress' | 'scanCompleted' | 'scanCancelled',
  // Event-specific data...
  timestamp: Date
}
```

See [API.md](./API.md) for complete event documentation.

## Development Scripts

- `npm run dev` - Start frontend development server
- `npm run server` - Start backend server
- `npm run dev:full` - Start both frontend and backend concurrently
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run test suite
- `npm run lint` - Run ESLint

## Project Structure

```
├── server/                 # Backend application
│   ├── index.js           # Express server + WebSocket
│   ├── deviceStore.js     # In-memory device cache
│   ├── events.js          # Event type constants
│   └── scanner/           # Scanner implementations
│       ├── index.js       # Scanner factory
│       └── mockScanner.js # Mock network scanner
├── src/                   # Frontend application
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API and WebSocket clients
│   ├── types/            # Type definitions (JSDoc)
│   ├── App.jsx           # Main application component
│   └── index.css         # Global styles + CSS variables
├── tests/                # Test files
├── API.md               # API documentation
└── README.md           # This file
```

## Browser Compatibility

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with WebSocket support

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and add tests
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add new feature'`
6. Push to branch: `git push origin feature/new-feature`
7. Create a Pull Request

## License

MIT License - see LICENSE file for details.

## Roadmap

- [ ] Real network scanner implementations (nmap, arp)
- [ ] Device fingerprinting and OS detection
- [ ] Historical device tracking and analytics
- [ ] Network performance monitoring
- [ ] Export/import functionality
- [ ] Advanced topology layouts and filtering
- [ ] Multi-network support
- [ ] Authentication and user management