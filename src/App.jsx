import React, { useState, useCallback } from 'react';
import { ScanControls } from './components/ScanControls.jsx';
import { DeviceList } from './components/DeviceList.jsx';
import { DeviceDetails } from './components/DeviceDetails.jsx';
import { TopologyGraph } from './components/TopologyGraph.jsx';
import { StatusBar } from './components/StatusBar.jsx';
import { useScan } from './hooks/useScan.js';
import { useDevices } from './hooks/useDevices.js';
import { useWebSocket } from './hooks/useWebSocket.js';

const App = () => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDeviceDetails, setShowDeviceDetails] = useState(false);

  // Custom hooks
  const { isConnected } = useWebSocket();
  const { 
    scanStatus, 
    progress, 
    devicesFound, 
    startScan, 
    cancelScan, 
    resetScan, 
    isScanning 
  } = useScan();
  const { 
    devices, 
    isLoading: devicesLoading, 
    error: devicesError 
  } = useDevices();

  // Handlers
  const handleStartScan = useCallback(async () => {
    try {
      await startScan();
    } catch (error) {
      console.error('Failed to start scan:', error);
    }
  }, [startScan]);

  const handleCancelScan = useCallback(async () => {
    try {
      await cancelScan();
    } catch (error) {
      console.error('Failed to cancel scan:', error);
    }
  }, [cancelScan]);

  const handleResetScan = useCallback(() => {
    resetScan();
    setSelectedDevice(null);
    setShowDeviceDetails(false);
  }, [resetScan]);

  const handleSelectDevice = useCallback((device) => {
    setSelectedDevice(device);
    setShowDeviceDetails(true);
  }, []);

  const handleCloseDeviceDetails = useCallback(() => {
    setShowDeviceDetails(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Network Mapper</h1>
              <p className="text-gray-600 text-sm mt-1">
                Discover and visualize devices on your network
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className={`inline-flex items-center space-x-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Scan Controls */}
          <ScanControls
            onStartScan={handleStartScan}
            onCancelScan={handleCancelScan}
            onResetScan={handleResetScan}
            isScanning={isScanning()}
            scanStatus={scanStatus}
            disabled={!isConnected}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device List */}
            <div className="space-y-6">
              <DeviceList
                devices={devices}
                selectedDevice={selectedDevice}
                onSelectDevice={handleSelectDevice}
                isLoading={devicesLoading}
                error={devicesError}
              />
            </div>

            {/* Topology Graph */}
            <div>
              <TopologyGraph
                devices={devices}
                selectedDevice={selectedDevice}
                onSelectDevice={handleSelectDevice}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Device Details Modal */}
      <DeviceDetails
        device={selectedDevice}
        onClose={handleCloseDeviceDetails}
        isVisible={showDeviceDetails}
      />

      {/* Status Bar */}
      <StatusBar
        scanStatus={scanStatus}
        progress={progress}
        devicesFound={devicesFound}
        isConnected={isConnected}
      />
    </div>
  );
};

export default App;