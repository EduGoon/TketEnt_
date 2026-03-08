import { apiFetch } from './api';
import { User, Event } from '../utilities/types';

interface ListResponse<T> {
  data: T[];
}

// Core Admin Management
export const listAdminEvents = async (): Promise<ListResponse<Event>> => {
  return apiFetch<ListResponse<Event>>('/admin/events');
};

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

// Admin Dashboard Features
export const getFavorites = async () => {
  return apiFetch('/admin/features/favorites');
};

export const getReviews = async () => {
  return apiFetch('/admin/features/reviews');
};

export const getChats = async () => {
  return apiFetch('/admin/features/chats');
};

export const getNewsletter = async () => {
  return apiFetch('/admin/features/newsletter');
};

export const getBlogs = async () => {
  return apiFetch('/admin/features/blogs');
};

// Admin Analytics
export const getEventAnalytics = async () => {
  return apiFetch('/admin/analytics/events');
};

export const getChatAnalytics = async () => {
  return apiFetch('/admin/features/analytics/chats');
};

export const getNewsletterAnalytics = async () => {
  return apiFetch('/admin/features/analytics/newsletter');
};

// Admin Newsletter Management
export const createNewsletterEntry = async (payload: any) => {
  return apiFetch('/admin/features/newsletter', {
    method: 'POST',
    body: payload,
  });
};

export const deleteNewsletterEntry = async (id: string) => {
  return apiFetch(`/admin/features/newsletter/${id}`, {
    method: 'DELETE',
  });
};

// Admin Blog Management
export const publishBlog = async (id: string) => {
  return apiFetch(`/admin/features/blogs/${id}/publish`, { method: 'POST' });
};

export const unpublishBlog = async (id: string) => {
  return apiFetch(`/admin/features/blogs/${id}/unpublish`, { method: 'POST' });
};

// Admin User Records
export const getUserRecords = async (userId: string) => {
  return apiFetch(`/history/admin/user/${userId}`);
};

// Admin Event Management
export const createAdminEvent = async (payload: Partial<Event>) => {
  return apiFetch<Event>('/admin/events', {
    method: 'POST',
    body: payload,
  });
};

export const updateAdminEvent = async (id: string, payload: Partial<Event>) => {
  return apiFetch<Event>(`/admin/events/${id}`, {
    method: 'PUT',
    body: payload,
  });
};

export const deleteAdminEvent = async (id: string) => {
  return apiFetch<void>(`/admin/events/${id}`, {
    method: 'DELETE',
  });
};
