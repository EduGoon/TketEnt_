import { apiFetch } from './api';
import { User, Event, EventAnalytics } from '../utilities/types';

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

export const getAnalytics = async (): Promise<ListResponse<EventAnalytics>> => {
  return apiFetch<ListResponse<EventAnalytics>>('/admin/analytics');
};
