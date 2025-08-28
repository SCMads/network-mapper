import React from 'react';

export function StatusBar({ scanStatus, progress, devicesFound, isConnected }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'running': return 'Scanning...';
      case 'completed': return 'Scan Complete';
      case 'cancelled': return 'Scan Cancelled';
      case 'error': return 'Scan Error';
      default: return 'Ready';
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div 
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Scan Status */}
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${getStatusColor(scanStatus)}`}>
              {getStatusText(scanStatus)}
            </span>
            {scanStatus === 'running' && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">
                  {progress}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Devices Found */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Devices:</span>
          <span className="text-sm font-medium text-gray-900">
            {devicesFound}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {scanStatus === 'running' && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}