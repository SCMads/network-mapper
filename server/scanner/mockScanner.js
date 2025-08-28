import { nanoid } from 'nanoid';
import { EVENTS, DEVICE_TYPES } from '../events.js';

// Simple OUI mapping for vendor detection
const OUI_MAPPING = {
  '00:50:56': 'VMware',
  '08:00:27': 'VirtualBox',
  '00:1B:63': 'Apple',
  '00:21:CC': 'Apple', 
  '00:26:08': 'Apple',
  '00:1C:B3': 'Apple',
  '28:CF:E9': 'Apple',
  '3C:07:54': 'Apple',
  '40:A6:D9': 'Apple',
  '44:D8:84': 'Apple',
  '48:A1:95': 'Apple',
  '4C:32:75': 'Apple',
  '54:72:4F': 'Apple',
  '58:55:CA': 'Apple',
  '5C:95:AE': 'Apple',
  '60:F4:45': 'Apple',
  '64:B0:A6': 'Apple',
  '68:AB:BC': 'Apple',
  '6C:40:08': 'Apple',
  '6C:72:20': 'Apple',
  '70:56:81': 'Apple',
  '74:E2:F5': 'Apple',
  '78:31:C1': 'Apple',
  '78:7B:8A': 'Apple',
  '78:CA:39': 'Apple',
  '7C:11:BE': 'Apple',
  '7C:6D:62': 'Apple',
  '80:E6:50': 'Apple',
  '84:38:35': 'Apple',
  '88:1F:A1': 'Apple',
  '8C:2D:AA': 'Apple',
  '8C:7C:92': 'Apple',
  '90:84:0D': 'Apple',
  '90:FD:61': 'Apple',
  '94:E6:F7': 'Apple',
  '98:01:A7': 'Apple',
  '9C:FC:E8': 'Apple',
  'A0:99:9B': 'Apple',
  'A4:83:E7': 'Apple',
  'A4:C3:61': 'Apple',
  'A8:20:66': 'Apple',
  'A8:96:75': 'Apple',
  'AC:87:A3': 'Apple',
  'B0:65:BD': 'Apple',
  'B4:18:D1': 'Apple',
  'B8:09:8A': 'Apple',
  'B8:C7:5D': 'Apple',
  'BC:52:B7': 'Apple',
  'BC:67:1C': 'Apple',
  'C0:9A:D0': 'Apple',
  'C4:B3:01': 'Apple',
  'C8:BC:C8': 'Apple',
  'CC:08:8D': 'Apple',
  'D0:23:DB': 'Apple',
  'D4:61:9D': 'Apple',
  'D8:30:62': 'Apple',
  'D8:96:85': 'Apple',
  'DC:2B:2A': 'Apple',
  'E0:B5:2D': 'Apple',
  'E4:8B:7F': 'Apple',
  'E8:80:2E': 'Apple',
  'EC:35:86': 'Apple',
  'F0:18:98': 'Apple',
  'F0:DB:E2': 'Apple',
  'F4:0F:24': 'Apple',
  'F4:F1:5A': 'Apple',
  'F8:1E:DF': 'Apple',
  'FC:25:3F': 'Apple',
  '00:E0:4C': 'Realtek',
  '52:54:00': 'QEMU',
  '00:23:54': 'Dell',
  '00:1A:A0': 'Dell',
  '00:14:22': 'Dell',
  '00:15:C5': 'Dell',
  '00:19:B9': 'Dell',
  '00:21:9B': 'Dell',
  '00:24:E8': 'Dell',
  '18:03:73': 'Dell',
  '34:17:EB': 'Dell',
  '50:9A:4C': 'Dell',
  '84:8F:69': 'Dell',
  'B0:83:FE': 'Dell',
  'D0:67:E5': 'Dell',
  'E0:DB:55': 'Dell',
  'F0:1F:AF': 'Dell',
  'F4:8E:38': 'Dell',
  '00:14:2A': 'HP',
  '00:1B:78': 'HP',
  '00:1E:0B': 'HP',
  '00:21:5A': 'HP',
  '00:23:7D': 'HP',
  '00:25:B3': 'HP',
  '10:60:4B': 'HP',
  '2C:27:D7': 'HP',
  '34:64:A9': 'HP',
  '38:EA:A7': 'HP',
  '3C:52:82': 'HP',
  '44:31:92': 'HP',
  '48:0F:CF': 'HP',
  '4C:39:09': 'HP',
  '64:51:06': 'HP',
  '70:5A:0F': 'HP',
  '78:E3:B5': 'HP',
  '9C:8E:99': 'HP',
  'A0:B3:CC': 'HP',
  'A4:5D:36': 'HP',
  'B4:39:D6': 'HP',
  'C8:CB:B8': 'HP',
  'D0:7E:35': 'HP',
  'D4:85:64': 'HP',
  'E8:39:35': 'HP',
  'EC:B1:D7': 'HP',
  'F0:92:1C': 'HP',
  'F4:CE:46': 'HP'
};

function generateMacAddress() {
  const ouis = Object.keys(OUI_MAPPING);
  const selectedOui = ouis[Math.floor(Math.random() * ouis.length)];
  const suffix = Array.from({ length: 3 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join(':');
  return `${selectedOui}:${suffix}`;
}

function getVendorFromMac(mac) {
  const oui = mac.substring(0, 8);
  return OUI_MAPPING[oui] || 'Unknown';
}

function generateHostname(vendor, deviceType) {
  const prefixes = {
    [DEVICE_TYPES.ROUTER]: ['router', 'gateway', 'rt'],
    [DEVICE_TYPES.COMPUTER]: ['pc', 'laptop', 'desktop', 'workstation'],
    [DEVICE_TYPES.PHONE]: ['phone', 'mobile', 'iphone', 'android'],
    [DEVICE_TYPES.PRINTER]: ['printer', 'print', 'hp', 'canon'],
    [DEVICE_TYPES.IOT]: ['iot', 'sensor', 'smart', 'device'],
    [DEVICE_TYPES.UNKNOWN]: ['device', 'unknown', 'host']
  };

  const prefix = prefixes[deviceType][Math.floor(Math.random() * prefixes[deviceType].length)];
  const suffix = Math.floor(Math.random() * 99) + 1;
  return `${prefix}-${suffix}`;
}

function generateDeviceType(ip, vendor) {
  // Gateway detection (usually .1)
  if (ip.endsWith('.1')) {
    return DEVICE_TYPES.ROUTER;
  }

  // Vendor-based heuristics
  if (vendor === 'Apple') {
    return Math.random() < 0.6 ? DEVICE_TYPES.PHONE : DEVICE_TYPES.COMPUTER;
  }
  
  if (vendor === 'HP') {
    return Math.random() < 0.4 ? DEVICE_TYPES.PRINTER : DEVICE_TYPES.COMPUTER;
  }

  // Random distribution for others
  const types = [DEVICE_TYPES.COMPUTER, DEVICE_TYPES.PHONE, DEVICE_TYPES.IOT];
  return types[Math.floor(Math.random() * types.length)];
}

function generateDevice(baseIp, index) {
  const ip = `${baseIp}.${index}`;
  const mac = generateMacAddress();
  const vendor = getVendorFromMac(mac);
  const deviceType = generateDeviceType(ip, vendor);
  const hostname = generateHostname(vendor, deviceType);
  const now = new Date();

  return {
    id: nanoid(),
    ip,
    hostname,
    mac,
    vendor,
    deviceType,
    firstSeen: now,
    lastSeen: now,
    isGateway: ip.endsWith('.1')
  };
}

class MockScanner {
  constructor(options = {}) {
    this.options = {
      deviceCount: options.deviceCount || 15,
      scanDuration: options.scanDuration || 8000,
      baseIp: options.baseIp || '192.168.1',
      ...options
    };
    this.isRunning = false;
    this.controller = null;
  }

  startScan(onEvent) {
    if (this.isRunning) {
      throw new Error('Scan already in progress');
    }

    this.isRunning = true;
    let deviceCount = 0;
    const totalDevices = this.options.deviceCount;
    const interval = this.options.scanDuration / totalDevices;

    // Start scan event
    onEvent({ type: EVENTS.SCAN_STARTED, timestamp: new Date() });

    const scanInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(scanInterval);
        return;
      }

      // Generate a device
      const device = generateDevice(this.options.baseIp, deviceCount === 0 ? 1 : Math.floor(Math.random() * 254) + 2);
      
      // Emit device found event
      onEvent({ 
        type: EVENTS.DEVICE_FOUND, 
        device,
        timestamp: new Date()
      });

      deviceCount++;
      const progress = Math.round((deviceCount / totalDevices) * 100);

      // Emit progress event
      onEvent({
        type: EVENTS.SCAN_PROGRESS,
        progress,
        devicesFound: deviceCount,
        timestamp: new Date()
      });

      // Check if scan is complete
      if (deviceCount >= totalDevices) {
        this.isRunning = false;
        clearInterval(scanInterval);
        
        onEvent({
          type: EVENTS.SCAN_COMPLETED,
          totalDevices: deviceCount,
          timestamp: new Date()
        });
      }
    }, interval);

    // Create controller for cancellation
    this.controller = {
      cancel: () => {
        this.isRunning = false;
        clearInterval(scanInterval);
        onEvent({
          type: EVENTS.SCAN_CANCELLED,
          timestamp: new Date()
        });
      }
    };

    return this.controller;
  }

  cancel() {
    if (this.controller) {
      this.controller.cancel();
    }
  }

  isScanning() {
    return this.isRunning;
  }
}

export default MockScanner;