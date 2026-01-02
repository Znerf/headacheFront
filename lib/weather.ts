import api from './api';

export interface LatestWeather {
  recordedAt?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  weather?: Record<string, any>;
  provider?: string;
  message?: string;
}

export const weatherService = {
  async getLatest(): Promise<LatestWeather> {
    const response = await api.get('/weather/latest');
    return response.data;
  },
};
