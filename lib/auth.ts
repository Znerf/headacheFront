import api from './api';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};
