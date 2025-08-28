import MockScanner from './mockScanner.js';

/**
 * Factory function to create appropriate scanner based on configuration
 * @param {Object} config - Scanner configuration
 * @param {boolean} config.mockMode - Whether to use mock scanner
 * @param {number} config.deviceCount - Number of devices to simulate (mock mode)
 * @param {number} config.scanDuration - Duration of scan in milliseconds (mock mode)
 * @returns {Object} Scanner instance
 */
export function chooseScanner(config = {}) {
  const {
    mockMode = true,
    deviceCount = 15,
    scanDuration = 8000,
    baseIp = '192.168.1'
  } = config;

  if (mockMode) {
    return new MockScanner({
      deviceCount,
      scanDuration,
      baseIp
    });
  }

  // TODO: Add real scanner implementations
  // Example: return new NmapScanner(config);
  // Example: return new ArpScanner(config);
  
  throw new Error('Real scanning not implemented yet. Use mockMode: true');
}

export { MockScanner };