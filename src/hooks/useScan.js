import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket.js';
import apiService from '../services/api.js';

const SCAN_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ERROR: 'error'
};

export function useScan() {
  const [scanStatus, setScanStatus] = useState(SCAN_STATUS.IDLE);
  const [progress, setProgress] = useState(0);
  const [devicesFound, setDevicesFound] = useState(0);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  
  const { addEventListener } = useWebSocket();

  // Start a new scan
  const startScan = useCallback(async () => {
    try {
      setError(null);
      setScanStatus(SCAN_STATUS.RUNNING);
      setProgress(0);
      setDevicesFound(0);
      setStartTime(new Date());
      setEndTime(null);
      
      const response = await apiService.startScan();
      setCurrentJobId(response.jobId);
      
      return response.jobId;
    } catch (error) {
      console.error('Failed to start scan:', error);
      setError(error.message);
      setScanStatus(SCAN_STATUS.ERROR);
      throw error;
    }
  }, []);

  // Cancel current scan
  const cancelScan = useCallback(async () => {
    try {
      if (scanStatus !== SCAN_STATUS.RUNNING) {
        return;
      }
      
      await apiService.cancelScan();
      // Status will be updated via WebSocket event
    } catch (error) {
      console.error('Failed to cancel scan:', error);
      setError(error.message);
    }
  }, [scanStatus]);

  // Check if scan is running
  const isScanning = useCallback(() => {
    return scanStatus === SCAN_STATUS.RUNNING;
  }, [scanStatus]);

  // Reset scan state
  const resetScan = useCallback(() => {
    setScanStatus(SCAN_STATUS.IDLE);
    setProgress(0);
    setDevicesFound(0);
    setCurrentJobId(null);
    setError(null);
    setStartTime(null);
    setEndTime(null);
  }, []);

  // Load current scan status from API
  const loadScanStatus = useCallback(async () => {
    try {
      const response = await apiService.getScanStatus();
      const scan = response.scan;
      
      if (scan && scan.status !== 'idle') {
        setScanStatus(scan.status);
        setProgress(scan.progress || 0);
        setCurrentJobId(scan.jobId);
        if (scan.startTime) setStartTime(new Date(scan.startTime));
        if (scan.endTime) setEndTime(new Date(scan.endTime));
      }
    } catch (error) {
      console.error('Failed to load scan status:', error);
    }
  }, []);

  useEffect(() => {
    // Set up WebSocket event listeners
    const removeScanStartedListener = addEventListener('scanStarted', (data) => {
      setScanStatus(SCAN_STATUS.RUNNING);
      setCurrentJobId(data.jobId);
      setProgress(0);
      setDevicesFound(0);
      setStartTime(new Date(data.timestamp));
      setEndTime(null);
      setError(null);
    });

    const removeScanProgressListener = addEventListener('scanProgress', (data) => {
      setProgress(data.progress || 0);
      setDevicesFound(data.devicesFound || 0);
    });

    const removeScanCompletedListener = addEventListener('scanCompleted', (data) => {
      setScanStatus(SCAN_STATUS.COMPLETED);
      setProgress(100);
      setDevicesFound(data.totalDevices || 0);
      setEndTime(new Date(data.timestamp));
    });

    const removeScanCancelledListener = addEventListener('scanCancelled', (data) => {
      setScanStatus(SCAN_STATUS.CANCELLED);
      setEndTime(new Date(data.timestamp));
    });

    const removeInitialStateListener = addEventListener('initialState', (data) => {
      if (data.scan) {
        const scan = data.scan;
        setScanStatus(scan.status || SCAN_STATUS.IDLE);
        setProgress(scan.progress || 0);
        setCurrentJobId(scan.jobId);
        if (scan.startTime) setStartTime(new Date(scan.startTime));
        if (scan.endTime) setEndTime(new Date(scan.endTime));
      }
    });

    return () => {
      removeScanStartedListener();
      removeScanProgressListener();
      removeScanCompletedListener();
      removeScanCancelledListener();
      removeInitialStateListener();
    };
  }, [addEventListener]);

  useEffect(() => {
    loadScanStatus();
  }, [loadScanStatus]);

  return {
    scanStatus,
    progress,
    devicesFound,
    currentJobId,
    error,
    startTime,
    endTime,
    startScan,
    cancelScan,
    isScanning,
    resetScan,
    loadScanStatus,
    SCAN_STATUS
  };
}