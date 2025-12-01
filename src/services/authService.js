import { apiService } from './api';

class AuthService {
  async register(email, password) {
    const data = await apiService.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      apiService.setToken(data.token);
    }

    return data;
  }

  async login(email, password) {
    const data = await apiService.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      apiService.setToken(data.token);
    }

    return data;
  }

  async logout() {
    try {
      await apiService.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiService.logout();
    }
  }

  async requestPasswordReset(email) {
    return await apiService.request('/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  isAuthenticated() {
    return !!apiService.getToken();
  }

  getToken() {
    return apiService.getToken();
  }
}

export const authService = new AuthService();