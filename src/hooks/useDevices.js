import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket.js';
import apiService from '../services/api.js';

export function useDevices() {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const { addEventListener } = useWebSocket();

  // Load initial devices
  const loadDevices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getDevices();
      setDevices(response.devices || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load devices:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update device in the list
  const updateDevice = useCallback((updatedDevice) => {
    setDevices(currentDevices => {
      const index = currentDevices.findIndex(d => d.id === updatedDevice.id);
      if (index >= 0) {
        const newDevices = [...currentDevices];
        newDevices[index] = updatedDevice;
        return newDevices;
      } else {
        return [...currentDevices, updatedDevice];
      }
    });
    setLastUpdated(new Date());
  }, []);

  // Add new device
  const addDevice = useCallback((device) => {
    setDevices(currentDevices => {
      // Check if device already exists
      const exists = currentDevices.some(d => d.id === device.id);
      if (exists) {
        return currentDevices;
      }
      return [...currentDevices, device];
    });
    setLastUpdated(new Date());
  }, []);

  // Clear all devices
  const clearDevices = useCallback(() => {
    setDevices([]);
    setLastUpdated(new Date());
  }, []);

  // Get device by ID
  const getDevice = useCallback((deviceId) => {
    return devices.find(d => d.id === deviceId);
  }, [devices]);

  // Get devices by type
  const getDevicesByType = useCallback((deviceType) => {
    return devices.filter(d => d.deviceType === deviceType);
  }, [devices]);

  // Get gateway device
  const getGateway = useCallback(() => {
    return devices.find(d => d.isGateway);
  }, [devices]);

  useEffect(() => {
    // Set up WebSocket event listeners
    const removeDeviceFoundListener = addEventListener('deviceFound', (data) => {
      addDevice(data.device);
    });

    const removeDeviceUpdatedListener = addEventListener('deviceUpdated', (data) => {
      updateDevice(data.device);
    });

    const removeInitialStateListener = addEventListener('initialState', (data) => {
      if (data.devices) {
        setDevices(data.devices);
        setLastUpdated(new Date());
      }
    });

    const removeScanStartedListener = addEventListener('scanStarted', () => {
      clearDevices();
    });

    return () => {
      removeDeviceFoundListener();
      removeDeviceUpdatedListener();
      removeInitialStateListener();
      removeScanStartedListener();
    };
  }, [addEventListener, addDevice, updateDevice, clearDevices]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  return {
    devices,
    isLoading,
    error,
    lastUpdated,
    loadDevices,
    addDevice,
    updateDevice,
    clearDevices,
    getDevice,
    getDevicesByType,
    getGateway,
    deviceCount: devices.length
  };
}