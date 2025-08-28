import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';

export function TopologyGraph({ 
  devices = [], 
  selectedDevice, 
  onSelectDevice,
  className = ""
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Convert devices to cytoscape nodes and edges
  const generateGraphData = (devices) => {
    if (!devices || devices.length === 0) {
      return { nodes: [], edges: [] };
    }

    const nodes = devices.map(device => ({
      data: {
        id: device.id,
        label: device.hostname || device.ip,
        type: device.deviceType,
        isGateway: device.isGateway,
        ip: device.ip,
        vendor: device.vendor,
        device: device
      }
    }));

    // Create edges - simple heuristic: all devices connect to gateway
    const gateway = devices.find(d => d.isGateway);
    const edges = [];

    if (gateway) {
      devices.forEach(device => {
        if (!device.isGateway) {
          edges.push({
            data: {
              id: `${gateway.id}-${device.id}`,
              source: gateway.id,
              target: device.id
            }
          });
        }
      });
    } else if (devices.length > 1) {
      // If no gateway, connect all devices to the first device
      const firstDevice = devices[0];
      devices.slice(1).forEach(device => {
        edges.push({
          data: {
            id: `${firstDevice.id}-${device.id}`,
            source: firstDevice.id,
            target: device.id
          }
        });
      });
    }

    return { nodes, edges };
  };

  // Get node color based on device type
  const getNodeColor = (deviceType, isGateway) => {
    if (isGateway) return '#10b981'; // green for gateway
    
    switch (deviceType) {
      case 'router': return '#3b82f6'; // blue
      case 'computer': return '#6b7280'; // gray
      case 'phone': return '#8b5cf6'; // purple
      case 'printer': return '#f59e0b'; // amber
      case 'iot': return '#06b6d4'; // cyan
      default: return '#9ca3af'; // gray
    }
  };

  // Initialize or update cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // Destroy existing instance
      if (cyRef.current) {
        cyRef.current.destroy();
      }

      const { nodes, edges } = generateGraphData(devices);

      // Create new cytoscape instance
      cyRef.current = cytoscape({
        container: containerRef.current,
        elements: [...nodes, ...edges],
        style: [
          {
            selector: 'node',
            style: {
              'background-color': (ele) => getNodeColor(ele.data('type'), ele.data('isGateway')),
              'label': 'data(label)',
              'width': (_ele) => _ele.data('isGateway') ? 40 : 30,
              'height': (_ele) => _ele.data('isGateway') ? 40 : 30,
              'color': '#374151',
              'font-size': '12px',
              'text-valign': 'bottom',
              'text-margin-y': 5,
              'text-wrap': 'wrap',
              'text-max-width': '80px',
              'border-width': 2,
              'border-color': '#e5e7eb',
              'text-outline-width': 2,
              'text-outline-color': '#ffffff'
            }
          },
          {
            selector: 'node:selected',
            style: {
              'border-color': '#3b82f6',
              'border-width': 3
            }
          },
          {
            selector: 'node:hover',
            style: {
              'border-color': '#6b7280',
              'border-width': 3
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#d1d5db',
              'target-arrow-color': '#d1d5db',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier'
            }
          },
          {
            selector: 'edge:selected',
            style: {
              'line-color': '#3b82f6',
              'target-arrow-color': '#3b82f6',
              'width': 3
            }
          }
        ],
        layout: {
          name: 'cose',
          idealEdgeLength: 100,
          nodeOverlap: 20,
          refresh: 20,
          fit: true,
          padding: 30,
          randomize: false,
          componentSpacing: 100,
          nodeRepulsion: (_node) => 400000,
          edgeElasticity: (_edge) => 100,
          nestingFactor: 5,
          gravity: 80,
          numIter: 1000,
          initialTemp: 200,
          coolingFactor: 0.95,
          minTemp: 1.0
        },
        minZoom: 0.5,
        maxZoom: 3,
        wheelSensitivity: 0.2
      });

      // Add event listeners
      cyRef.current.on('tap', 'node', (event) => {
        const device = event.target.data('device');
        if (device && onSelectDevice) {
          onSelectDevice(device);
        }
      });

      // Handle resize
      const handleResize = () => {
        if (cyRef.current) {
          cyRef.current.resize();
          cyRef.current.fit();
        }
      };

      window.addEventListener('resize', handleResize);

      setIsLoading(false);

      return () => {
        window.removeEventListener('resize', handleResize);
      };

    } catch (err) {
      console.error('Error initializing topology graph:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [devices, onSelectDevice]);

  // Update selected node
  useEffect(() => {
    if (!cyRef.current || !selectedDevice) return;

    // Unselect all nodes
    cyRef.current.nodes().unselect();
    
    // Select the current device
    const node = cyRef.current.getElementById(selectedDevice.id);
    if (node.length > 0) {
      node.select();
    }
  }, [selectedDevice]);

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Network Topology</h2>
        <div className="text-center py-8">
          <p className="text-red-600">❌ Error loading topology: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Network Topology ({devices.length} devices)
      </h2>
      
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading topology...</p>
            </div>
          </div>
        )}
        
        {devices.length === 0 && !isLoading ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 mb-2">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-600">No devices to display</p>
            <p className="text-gray-500 text-sm mt-1">Start a scan to visualize the network</p>
          </div>
        ) : (
          <div 
            ref={containerRef}
            className="w-full h-96 bg-gray-50 rounded-lg border border-gray-100"
            style={{ minHeight: '384px' }}
          />
        )}
      </div>

      {/* Legend */}
      {devices.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Gateway</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">Router</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-gray-600">Computer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-600">Phone</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-gray-600">Printer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span className="text-gray-600">IoT</span>
          </div>
        </div>
      )}
    </div>
  );
}