/**
 * @typedef {Object} Device
 * @property {string} id - Unique device identifier
 * @property {string} ip - IP address
 * @property {string} hostname - Device hostname
 * @property {string} mac - MAC address
 * @property {string} vendor - Device vendor (derived from OUI)
 * @property {string} deviceType - Type of device (router, computer, etc.)
 * @property {Date} firstSeen - When device was first discovered
 * @property {Date} lastSeen - When device was last seen
 * @property {boolean} isGateway - Whether this device is the gateway
 */

/**
 * @typedef {Object} ScanJob
 * @property {string} jobId - Unique job identifier
 * @property {string} status - Job status (running, completed, cancelled)
 * @property {number} progress - Progress percentage (0-100)
 * @property {Date} startTime - When scan started
 * @property {Date} endTime - When scan ended (if completed)
 */

/**
 * @typedef {Object} TopologyNode
 * @property {string} id - Device ID
 * @property {string} label - Display label
 * @property {string} type - Node type (router, computer, etc.)
 * @property {boolean} isGateway - Whether this is the gateway node
 */

/**
 * @typedef {Object} TopologyEdge
 * @property {string} id - Edge identifier
 * @property {string} source - Source device ID
 * @property {string} target - Target device ID
 */