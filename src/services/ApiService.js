const BUDGET_API_URL = 'http://158.160.206.124:8081/api/v1';
const TRANSACTION_API_URL = 'http://158.160.206.124:8083/api/v1';

class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(url);
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      console.error(response);
      
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

export const budgetApiService = new ApiService(BUDGET_API_URL);
export const transactionApiService = new ApiService(TRANSACTION_API_URL);