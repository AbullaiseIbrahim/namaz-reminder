import api from './axios';
import { User } from '../../types';

interface AuthResponse {
  token: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
}

export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
  }) => api.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data),
};
