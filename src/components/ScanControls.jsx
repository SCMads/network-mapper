import React from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';

export function ScanControls({ 
  onStartScan, 
  onCancelScan, 
  onResetScan,
  isScanning, 
  scanStatus,
  disabled = false 
}) {
  const canStart = !isScanning && scanStatus !== 'running';
  const canCancel = isScanning || scanStatus === 'running';
  const canReset = scanStatus !== 'idle' && !isScanning;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Scan Controls</h2>
      
      <div className="flex items-center space-x-3">
        {/* Start Scan Button */}
        <button
          onClick={onStartScan}
          disabled={!canStart || disabled}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors
            ${canStart && !disabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
          aria-label="Start network scan"
        >
          <Play size={16} />
          <span>Start Scan</span>
        </button>

        {/* Cancel Scan Button */}
        <button
          onClick={onCancelScan}
          disabled={!canCancel || disabled}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors
            ${canCancel && !disabled
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
          aria-label="Cancel current scan"
        >
          <Square size={16} />
          <span>Cancel</span>
        </button>

        {/* Reset Button */}
        <button
          onClick={onResetScan}
          disabled={!canReset || disabled}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors
            ${canReset && !disabled
              ? 'bg-gray-600 hover:bg-gray-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
          aria-label="Reset scan results"
        >
          <RefreshCw size={16} />
          <span>Reset</span>
        </button>
      </div>

      {/* Status Text */}
      <div className="mt-3 text-sm text-gray-600">
        {isScanning && (
          <p>🔍 Scanning network for devices...</p>
        )}
        {scanStatus === 'completed' && (
          <p>✅ Scan completed successfully</p>
        )}
        {scanStatus === 'cancelled' && (
          <p>⏹️ Scan was cancelled</p>
        )}
        {scanStatus === 'error' && (
          <p>❌ Scan failed - please try again</p>
        )}
        {scanStatus === 'idle' && (
          <p>🚀 Ready to start scanning</p>
        )}
      </div>
    </div>
  );
}