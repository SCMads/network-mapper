import { SCAN_STATUS } from './events.js';

class DeviceStore {
  constructor() {
    this.devices = new Map();
    this.currentScan = null;
  }

  addDevice(device) {
    this.devices.set(device.id, device);
    return device;
  }

  updateDevice(deviceId, updates) {
    const device = this.devices.get(deviceId);
    if (device) {
      const updatedDevice = { ...device, ...updates, lastSeen: new Date() };
      this.devices.set(deviceId, updatedDevice);
      return updatedDevice;
    }
    return null;
  }

  getDevice(deviceId) {
    return this.devices.get(deviceId);
  }

  getAllDevices() {
    return Array.from(this.devices.values());
  }

  removeDevice(deviceId) {
    return this.devices.delete(deviceId);
  }

  clear() {
    this.devices.clear();
  }

  getDeviceCount() {
    return this.devices.size;
  }

  // Scan job management
  startScan(jobId) {
    this.currentScan = {
      jobId,
      status: SCAN_STATUS.RUNNING,
      progress: 0,
      startTime: new Date(),
      endTime: null
    };
    return this.currentScan;
  }

  updateScanProgress(progress) {
    if (this.currentScan) {
      this.currentScan.progress = progress;
    }
  }

  completeScan() {
    if (this.currentScan) {
      this.currentScan.status = SCAN_STATUS.COMPLETED;
      this.currentScan.progress = 100;
      this.currentScan.endTime = new Date();
    }
  }

  cancelScan() {
    if (this.currentScan) {
      this.currentScan.status = SCAN_STATUS.CANCELLED;
      this.currentScan.endTime = new Date();
    }
  }

  getCurrentScan() {
    return this.currentScan;
  }
}

export default new DeviceStore();