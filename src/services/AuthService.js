import { authApiService as authHttpClient } from './ApiService';

class AuthService {
  setAuthToken(token) {
    authHttpClient.setAuthToken(token);
  }

  async login(email, password) {
    return authHttpClient.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email, password, name) {
    return authHttpClient.request('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async getProfile(token) {
    return authHttpClient.request('/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const authApiService = new AuthService();
