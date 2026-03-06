import { apiFetch, setToken } from './api';
import { User } from '../utilities/types';

interface SignupPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface SigninPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  id: string;
  email: string;
  role?: string;
  token: string;
}

export const signup = async (data: SignupPayload): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: data,
  });
};

export const signin = async (data: SigninPayload): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>('/auth/signin', {
    method: 'POST',
    body: data,
  });
};

export const refreshToken = async (): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>('/auth/refresh', {
    method: 'POST',
  });
};

export const getCurrentUser = async (): Promise<User> => {
  return apiFetch<User>('/auth/me');
};

export const storeToken = (token: string) => {
  setToken(token);
};

export const clearToken = () => {
  setToken(null);
};
