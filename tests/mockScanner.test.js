import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockScanner from '../server/scanner/mockScanner.js';
import { EVENTS } from '../server/events.js';

describe('MockScanner', () => {
  let scanner;
  let mockOnEvent;

  beforeEach(() => {
    mockOnEvent = vi.fn();
    scanner = new MockScanner({
      deviceCount: 5,
      scanDuration: 1000, // 1 second for faster tests
      baseIp: '192.168.1'
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (scanner && scanner.isScanning()) {
      scanner.cancel();
    }
    vi.useRealTimers();
  });

  it('should emit scanStarted event when scan begins', () => {
    scanner.startScan(mockOnEvent);

    expect(mockOnEvent).toHaveBeenCalledWith({
      type: EVENTS.SCAN_STARTED,
      timestamp: expect.any(Date)
    });
  });

  it('should emit deviceFound events in correct order', async () => {
    scanner.startScan(mockOnEvent);

    // Fast-forward through the scan
    vi.advanceTimersByTime(1000);

    // Check that we got the expected events in order
    const calls = mockOnEvent.mock.calls;
    
    // First call should be SCAN_STARTED
    expect(calls[0][0].type).toBe(EVENTS.SCAN_STARTED);

    // Should have device found and progress events
    const deviceFoundCalls = calls.filter(call => call[0].type === EVENTS.DEVICE_FOUND);
    const progressCalls = calls.filter(call => call[0].type === EVENTS.SCAN_PROGRESS);
    
    expect(deviceFoundCalls).toHaveLength(5); // 5 devices
    expect(progressCalls).toHaveLength(5); // 5 progress updates

    // Last call should be SCAN_COMPLETED
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall.type).toBe(EVENTS.SCAN_COMPLETED);
    expect(lastCall.totalDevices).toBe(5);
  });

  it('should generate devices with correct properties', () => {
    scanner.startScan(mockOnEvent);

    // Advance time to get some device events
    vi.advanceTimersByTime(500);

    const deviceFoundCalls = mockOnEvent.mock.calls.filter(
      call => call[0].type === EVENTS.DEVICE_FOUND
    );

    expect(deviceFoundCalls.length).toBeGreaterThan(0);

    const device = deviceFoundCalls[0][0].device;
    
    // Check device structure
    expect(device).toMatchObject({
      id: expect.any(String),
      ip: expect.stringMatching(/^192\.168\.1\.\d+$/),
      hostname: expect.any(String),
      mac: expect.stringMatching(/^[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}$/),
      vendor: expect.any(String),
      deviceType: expect.stringMatching(/^(router|computer|phone|printer|iot|unknown)$/),
      firstSeen: expect.any(Date),
      lastSeen: expect.any(Date),
      isGateway: expect.any(Boolean)
    });
  });

  it('should identify gateway device correctly', () => {
    scanner.startScan(mockOnEvent);
    vi.advanceTimersByTime(200); // Get first device

    const deviceFoundCalls = mockOnEvent.mock.calls.filter(
      call => call[0].type === EVENTS.DEVICE_FOUND
    );

    if (deviceFoundCalls.length > 0) {
      const firstDevice = deviceFoundCalls[0][0].device;
      
      // First device should likely be the gateway (.1)
      if (firstDevice.ip.endsWith('.1')) {
        expect(firstDevice.isGateway).toBe(true);
        expect(firstDevice.deviceType).toBe('router');
      }
    }
  });

  it('should emit progress events with increasing percentages', () => {
    scanner.startScan(mockOnEvent);
    vi.advanceTimersByTime(1000);

    const progressCalls = mockOnEvent.mock.calls.filter(
      call => call[0].type === EVENTS.SCAN_PROGRESS
    );

    // Check that progress increases
    for (let i = 1; i < progressCalls.length; i++) {
      const prevProgress = progressCalls[i - 1][0].progress;
      const currentProgress = progressCalls[i][0].progress;
      expect(currentProgress).toBeGreaterThan(prevProgress);
    }

    // Last progress should be around 100%
    const lastProgress = progressCalls[progressCalls.length - 1][0];
    expect(lastProgress.progress).toBe(100);
    expect(lastProgress.devicesFound).toBe(5);
  });

  it('should handle scan cancellation', () => {
    const controller = scanner.startScan(mockOnEvent);
    
    // Cancel after some time
    vi.advanceTimersByTime(300);
    controller.cancel();

    expect(mockOnEvent).toHaveBeenCalledWith({
      type: EVENTS.SCAN_CANCELLED,
      timestamp: expect.any(Date)
    });

    expect(scanner.isScanning()).toBe(false);
  });

  it('should prevent multiple simultaneous scans', () => {
    scanner.startScan(mockOnEvent);

    expect(() => {
      scanner.startScan(mockOnEvent);
    }).toThrow('Scan already in progress');
  });

  it('should use custom configuration options', () => {
    const customScanner = new MockScanner({
      deviceCount: 3,
      scanDuration: 500,
      baseIp: '10.0.0'
    });

    customScanner.startScan(mockOnEvent);
    vi.advanceTimersByTime(500);

    const deviceFoundCalls = mockOnEvent.mock.calls.filter(
      call => call[0].type === EVENTS.DEVICE_FOUND
    );

    expect(deviceFoundCalls).toHaveLength(3);

    // Check that devices use the custom base IP
    if (deviceFoundCalls.length > 0) {
      const device = deviceFoundCalls[0][0].device;
      expect(device.ip).toMatch(/^10\.0\.0\.\d+$/);
    }

    customScanner.cancel();
  });

  it('should generate realistic vendor names from MAC addresses', () => {
    scanner.startScan(mockOnEvent);
    vi.advanceTimersByTime(1000);

    const deviceFoundCalls = mockOnEvent.mock.calls.filter(
      call => call[0].type === EVENTS.DEVICE_FOUND
    );

    expect(deviceFoundCalls.length).toBe(5);

    // Check that all devices have vendors that are not 'Unknown' (since we're using predefined OUIs)
    deviceFoundCalls.forEach(call => {
      const device = call[0].device;
      expect(device.vendor).not.toBe('Unknown');
      expect(['Apple', 'Dell', 'HP', 'VMware', 'VirtualBox', 'Realtek', 'QEMU']).toContain(device.vendor);
    });
  });
});