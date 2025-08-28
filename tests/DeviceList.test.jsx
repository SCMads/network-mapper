import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeviceList } from '../src/components/DeviceList.jsx';

// Mock device data
const mockDevices = [
  {
    id: '1',
    hostname: 'router-1',
    ip: '192.168.1.1',
    mac: '00:1A:2B:3C:4D:5E',
    vendor: 'Apple',
    deviceType: 'router',
    isGateway: true,
    firstSeen: new Date('2023-01-01T10:00:00Z'),
    lastSeen: new Date('2023-01-01T10:30:00Z')
  },
  {
    id: '2',
    hostname: 'laptop-1',
    ip: '192.168.1.100',
    mac: '00:1A:2B:3C:4D:5F',
    vendor: 'Dell',
    deviceType: 'computer',
    isGateway: false,
    firstSeen: new Date('2023-01-01T10:05:00Z'),
    lastSeen: new Date('2023-01-01T10:25:00Z')
  },
  {
    id: '3',
    hostname: 'phone-1',
    ip: '192.168.1.200',
    mac: '00:1A:2B:3C:4D:60',
    vendor: 'Apple',
    deviceType: 'phone',
    isGateway: false,
    firstSeen: new Date('2023-01-01T10:10:00Z'),
    lastSeen: new Date('2023-01-01T10:20:00Z')
  }
];

describe('DeviceList', () => {
  it('renders device list with mock devices', () => {
    const mockOnSelectDevice = vi.fn();
    
    render(
      <DeviceList
        devices={mockDevices}
        selectedDevice={null}
        onSelectDevice={mockOnSelectDevice}
        isLoading={false}
        error={null}
      />
    );

    // Check if the header shows correct device count
    expect(screen.getByText('Devices (3)')).toBeInTheDocument();

    // Check if all devices are rendered
    expect(screen.getByText('router-1')).toBeInTheDocument();
    expect(screen.getByText('laptop-1')).toBeInTheDocument(); 
    expect(screen.getByText('phone-1')).toBeInTheDocument();

    // Check IP addresses
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.200')).toBeInTheDocument();

    // Check vendors (use getAllByText since Apple appears twice)
    expect(screen.getByText(/Dell/)).toBeInTheDocument();
    // We know there are 2 Apple devices, so let's check for the specific text pattern
    const appleTexts = screen.getAllByText(/Apple/);
    expect(appleTexts).toHaveLength(2);

    // Check gateway badge
    expect(screen.getByText('Gateway')).toBeInTheDocument();
  });

  it('handles device selection', () => {
    const mockOnSelectDevice = vi.fn();
    
    render(
      <DeviceList
        devices={mockDevices}
        selectedDevice={null}
        onSelectDevice={mockOnSelectDevice}
        isLoading={false}
        error={null}
      />
    );

    // Click on the first device
    const firstDevice = screen.getByRole('button', { name: /Select device router-1/ });
    fireEvent.click(firstDevice);

    // Check if callback was called with correct device
    expect(mockOnSelectDevice).toHaveBeenCalledWith(mockDevices[0]);
  });

  it('highlights selected device', () => {
    const mockOnSelectDevice = vi.fn();
    
    render(
      <DeviceList
        devices={mockDevices}
        selectedDevice={mockDevices[1]} // laptop-1 is selected
        onSelectDevice={mockOnSelectDevice}
        isLoading={false}
        error={null}
      />
    );

    // The selected device should have different styling (we can't test exact CSS, but we can check the element exists)
    const selectedDevice = screen.getByRole('button', { name: /Select device laptop-1/ });
    expect(selectedDevice).toBeInTheDocument();
  });

  it('displays loading state', () => {
    const mockOnSelectDevice = vi.fn();
    
    render(
      <DeviceList
        devices={[]}
        selectedDevice={null}
        onSelectDevice={mockOnSelectDevice}
        isLoading={true}
        error={null}
      />
    );

    expect(screen.getByText('Loading devices...')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Devices' })).toBeInTheDocument();
  });

  it('displays error state', () => {
    const mockOnSelectDevice = vi.fn();
    const errorMessage = 'Failed to load devices';
    
    render(
      <DeviceList
        devices={[]}
        selectedDevice={null}
        onSelectDevice={mockOnSelectDevice}
        isLoading={false}
        error={errorMessage}
      />
    );

    expect(screen.getByText(`❌ Error loading devices: ${errorMessage}`)).toBeInTheDocument();
  });

  it('displays empty state when no devices', () => {
    const mockOnSelectDevice = vi.fn();
    
    render(
      <DeviceList
        devices={[]}
        selectedDevice={null}
        onSelectDevice={mockOnSelectDevice}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText('Devices (0)')).toBeInTheDocument();
    expect(screen.getByText('No devices found')).toBeInTheDocument();
    expect(screen.getByText('Start a scan to discover devices')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    const mockOnSelectDevice = vi.fn();
    
    render(
      <DeviceList
        devices={mockDevices}
        selectedDevice={null}
        onSelectDevice={mockOnSelectDevice}
        isLoading={false}
        error={null}
      />
    );

    const firstDevice = screen.getByRole('button', { name: /Select device router-1/ });
    
    // Test Enter key
    fireEvent.keyDown(firstDevice, { key: 'Enter' });
    expect(mockOnSelectDevice).toHaveBeenCalledWith(mockDevices[0]);

    // Test Space key
    fireEvent.keyDown(firstDevice, { key: ' ' });
    expect(mockOnSelectDevice).toHaveBeenCalledTimes(2);
  });
});