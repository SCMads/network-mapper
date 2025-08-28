# API Documentation

This document describes the REST API endpoints and WebSocket events for the Network Mapper application.

## Base URL

- Development: `http://localhost:3001`
- Production: (Configure via `PORT` environment variable)

## REST API Endpoints

### Health Check

**GET** `/api/health`

Returns the current health status of the server.

**Response:**
```json
{
  "ok": true,
  "timestamp": "2023-01-01T12:00:00.000Z",
  "mockMode": true,
  "connectedClients": 2,
  "deviceCount": 15
}
```

### Start Scan

**POST** `/api/scan`

Starts a new network scan. Only one scan can be active at a time.

**Response:**
```json
{
  "jobId": "abc123"
}
```

**Error Response (409 - Scan in progress):**
```json
{
  "error": "Scan already in progress",
  "jobId": "existing-job-id"
}
```

### Cancel Scan

**POST** `/api/scan/cancel`

Cancels the currently running scan.

**Response:**
```json
{
  "message": "Scan cancelled"
}
```

**Error Response (404 - No active scan):**
```json
{
  "error": "No active scan to cancel"
}
```

### Get Scan Status

**GET** `/api/scan/status`

Returns the current scan status.

**Response:**
```json
{
  "scan": {
    "jobId": "abc123",
    "status": "running",
    "progress": 75,
    "startTime": "2023-01-01T12:00:00.000Z",
    "endTime": null
  },
  "timestamp": "2023-01-01T12:05:00.000Z"
}
```

### Get Devices

**GET** `/api/devices`

Returns all discovered devices.

**Response:**
```json
{
  "devices": [
    {
      "id": "device-1",
      "ip": "192.168.1.1",
      "hostname": "router-1",
      "mac": "00:1A:2B:3C:4D:5E",
      "vendor": "Apple",
      "deviceType": "router",
      "firstSeen": "2023-01-01T12:00:00.000Z",
      "lastSeen": "2023-01-01T12:05:00.000Z",
      "isGateway": true
    }
  ],
  "count": 1,
  "timestamp": "2023-01-01T12:05:00.000Z"
}
```

## WebSocket Events

WebSocket endpoint: `ws://localhost:3001/ws`

### Connection Events

#### Initial State
Sent immediately upon WebSocket connection.

```json
{
  "type": "initialState",
  "devices": [...],
  "scan": {...},
  "timestamp": "2023-01-01T12:00:00.000Z"
}
```

### Scan Events

#### Scan Started
```json
{
  "type": "scanStarted",
  "jobId": "abc123",
  "timestamp": "2023-01-01T12:00:00.000Z"
}
```

#### Scan Progress
```json
{
  "type": "scanProgress",
  "progress": 50,
  "devicesFound": 7,
  "timestamp": "2023-01-01T12:02:30.000Z"
}
```

#### Scan Completed
```json
{
  "type": "scanCompleted",
  "totalDevices": 15,
  "timestamp": "2023-01-01T12:05:00.000Z"
}
```

#### Scan Cancelled
```json
{
  "type": "scanCancelled",
  "timestamp": "2023-01-01T12:03:00.000Z"
}
```

### Device Events

#### Device Found
```json
{
  "type": "deviceFound",
  "device": {
    "id": "device-1",
    "ip": "192.168.1.100",
    "hostname": "laptop-1",
    "mac": "00:1A:2B:3C:4D:5F",
    "vendor": "Dell",
    "deviceType": "computer",
    "firstSeen": "2023-01-01T12:01:00.000Z",
    "lastSeen": "2023-01-01T12:01:00.000Z",
    "isGateway": false
  },
  "timestamp": "2023-01-01T12:01:00.000Z"
}
```

#### Device Updated
```json
{
  "type": "deviceUpdated",
  "device": {
    "id": "device-1",
    "lastSeen": "2023-01-01T12:10:00.000Z"
  },
  "timestamp": "2023-01-01T12:10:00.000Z"
}
```

### Error Events

#### Error
```json
{
  "type": "error",
  "message": "Scan failed",
  "code": "SCAN_ERROR",
  "timestamp": "2023-01-01T12:00:00.000Z"
}
```

## Device Types

- `router` - Network routers and gateways
- `computer` - Desktop computers, laptops, workstations
- `phone` - Mobile phones and tablets
- `printer` - Network printers
- `iot` - IoT devices and sensors
- `unknown` - Unidentified devices

## Scan Statuses

- `idle` - No scan in progress
- `running` - Scan currently in progress
- `completed` - Scan finished successfully
- `cancelled` - Scan was cancelled by user
- `error` - Scan failed due to error

## CORS Configuration

The API supports CORS and can be configured via the `CORS_ORIGIN` environment variable (default: `http://localhost:3000`).