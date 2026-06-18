class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {};
  }

  setAuthToken(token) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          status: response.status,
          message: `HTTP error! status: ${response.status}`
        }));
        throw errorData;
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const budgetApiService = new ApiService(API_BASE_URL);
export const transactionApiService = new ApiService(API_BASE_URL);
export const authApiService = new ApiService(`${API_BASE_URL}/auth`);
export const goalApiService = new ApiService(API_BASE_URL);
export const dashboardApiService = new ApiService(`${API_BASE_URL}/dashboard`);

export { ApiService };
