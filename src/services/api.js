const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

class ApiService {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async post(endpoint, data = null) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : null,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Health check
  async checkHealth() {
    return this.get('/api/health');
  }

  // Scan operations
  async startScan() {
    return this.post('/api/scan');
  }

  async cancelScan() {
    return this.post('/api/scan/cancel');
  }

  async getScanStatus() {
    return this.get('/api/scan/status');
  }

  // Device operations
  async getDevices() {
    return this.get('/api/devices');
  }
}

export default new ApiService();