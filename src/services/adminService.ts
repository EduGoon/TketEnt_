import { apiFetch } from './api';
import { User, Event, AdminAnalyticsResponse } from '../utilities/types';

interface ListResponse<T> {
  data: T[];
}

export const listUsers = async (): Promise<ListResponse<User>> => {
  return apiFetch<ListResponse<User>>('/admin/users');
};

export const changeUserRole = async (
  id: string,
  role: 'USER' | 'ADMIN'
): Promise<User> => {
  return apiFetch<User>(`/admin/users/${id}/role`, {
    method: 'PUT',
    body: { role },
  });
};

export const listAdminEvents = async (): Promise<ListResponse<Event>> => {
  return apiFetch<ListResponse<Event>>('/admin/events');
};

export const getAnalytics = async (params?: {
  months?: number;
  sortBy?: 'revenue' | 'tickets';
  since?: string;
}): Promise<AdminAnalyticsResponse> => {
  const query = new URLSearchParams();
  if (params?.months) query.set('months', String(params.months));
  if (params?.sortBy) query.set('sortBy', params.sortBy);
  if (params?.since) query.set('since', params.since);
  const queryString = query.toString();
  return apiFetch<AdminAnalyticsResponse>(
    `/admin/analytics${queryString ? `?${queryString}` : ''}`
  );
};
