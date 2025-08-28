import React from 'react';
import { X, Monitor, Smartphone, Printer, Router, HelpCircle, Wifi, Calendar, Clock, MapPin } from 'lucide-react';

const DEVICE_ICONS = {
  router: Router,
  computer: Monitor,
  phone: Smartphone,
  printer: Printer,
  iot: Wifi,
  unknown: HelpCircle
};

export function DeviceDetails({ device, onClose, isVisible = false }) {
  if (!device || !isVisible) {
    return null;
  }

  const Icon = DEVICE_ICONS[device.deviceType] || DEVICE_ICONS.unknown;

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleString();
  };

  const getDeviceTypeDisplay = (type) => {
    switch (type) {
      case 'router': return 'Router';
      case 'computer': return 'Computer';
      case 'phone': return 'Mobile Phone';
      case 'printer': return 'Printer';
      case 'iot': return 'IoT Device';
      default: return 'Unknown Device';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`
              p-2 rounded-md
              ${device.isGateway ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}
            `}>
              <Icon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {device.hostname || 'Unknown Host'}
              </h2>
              <p className="text-sm text-gray-600">{device.ip}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close device details"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Gateway Badge */}
          {device.isGateway && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <MapPin size={14} className="mr-1" />
              Network Gateway
            </div>
          )}

          {/* Device Information */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Device Type</label>
              <p className="text-sm text-gray-900">{getDeviceTypeDisplay(device.deviceType)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">IP Address</label>
              <p className="text-sm text-gray-900 font-mono">{device.ip}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">MAC Address</label>
              <p className="text-sm text-gray-900 font-mono">{device.mac}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Vendor</label>
              <p className="text-sm text-gray-900">{device.vendor || 'Unknown'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Hostname</label>
              <p className="text-sm text-gray-900">{device.hostname || 'Not available'}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-500" />
              <div>
                <label className="text-sm font-medium text-gray-700">First Seen</label>
                <p className="text-sm text-gray-900">{formatDate(device.firstSeen)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-gray-500" />
              <div>
                <label className="text-sm font-medium text-gray-700">Last Seen</label>
                <p className="text-sm text-gray-900">{formatDate(device.lastSeen)}</p>
              </div>
            </div>
          </div>

          {/* Device ID (for debugging) */}
          <div className="border-t border-gray-200 pt-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Device ID</label>
              <p className="text-xs text-gray-500 font-mono break-all">{device.id}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}