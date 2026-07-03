import api from './axios';
import { User, CalculationMethod, Madhab } from '../../types';

export const userApi = {
  getProfile: () =>
    api.get<User>('/user/profile').then(r => r.data),

  updateProfile: (data: Partial<{
    name: string;
    timezone: string;
    latitude: number;
    longitude: number;
    calculationMethod: CalculationMethod;
    madhab: Madhab;
  }>) => api.put<User>('/user/profile', data).then(r => r.data),
};
