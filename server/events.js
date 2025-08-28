// Event types for WebSocket communication
export const EVENTS = {
  SCAN_STARTED: 'scanStarted',
  SCAN_PROGRESS: 'scanProgress', 
  SCAN_COMPLETED: 'scanCompleted',
  SCAN_CANCELLED: 'scanCancelled',
  DEVICE_FOUND: 'deviceFound',
  DEVICE_UPDATED: 'deviceUpdated',
  ERROR: 'error'
};

// Scan statuses
export const SCAN_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running', 
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ERROR: 'error'
};

// Device types
export const DEVICE_TYPES = {
  ROUTER: 'router',
  COMPUTER: 'computer',
  PHONE: 'phone',
  PRINTER: 'printer',
  IOT: 'iot',
  UNKNOWN: 'unknown'
};