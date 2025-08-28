import React from 'react';
import { Monitor, Smartphone, Printer, Router, HelpCircle, Wifi } from 'lucide-react';

const DEVICE_ICONS = {
  router: Router,
  computer: Monitor,
  phone: Smartphone,
  printer: Printer,
  iot: Wifi,
  unknown: HelpCircle
};

export function DeviceList({ 
  devices = [], 
  selectedDevice, 
  onSelectDevice, 
  isLoading = false,
  error = null 
}) {
  const getDeviceIcon = (deviceType) => {
    const Icon = DEVICE_ICONS[deviceType] || DEVICE_ICONS.unknown;
    return Icon;
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Unknown';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Devices</h2>
        <div className="text-center py-8">
          <p className="text-red-600">❌ Error loading devices: {error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Devices</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading devices...</p>
        </div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Devices ({devices.length})
        </h2>
        <div className="text-center py-8">
          <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No devices found</p>
          <p className="text-gray-500 text-sm mt-1">Start a scan to discover devices</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Devices ({devices.length})
      </h2>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {devices.map((device) => {
          const Icon = getDeviceIcon(device.deviceType);
          const isSelected = selectedDevice?.id === device.id;
          
          return (
            <div
              key={device.id}
              onClick={() => onSelectDevice(device)}
              className={`
                p-3 rounded-lg border cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              role="button"
              tabIndex={0}
              aria-label={`Select device ${device.hostname || device.ip}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectDevice(device);
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  flex-shrink-0 p-2 rounded-md
                  ${device.isGateway ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}
                `}>
                  <Icon size={16} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {device.hostname || 'Unknown Host'}
                    </p>
                    {device.isGateway && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Gateway
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{device.ip}</p>
                  <p className="text-xs text-gray-500">
                    {device.vendor} • {formatLastSeen(device.lastSeen)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}