import { apiFetch } from './api';
import { Event } from '../utilities/types';
import { Sponsor } from '../utilities/types';

interface ListResponse<T> {
  data: T[];
}

// Analytics Endpoints
export const getEventAnalytics = async () => {
  return apiFetch('/admin/analytics/events');
};

// Features Endpoints
// Events
export const listEvents = async (): Promise<ListResponse<Event>> => {
  return apiFetch<ListResponse<Event>>('/admin/events/');
};
export const createEvent = async (payload: Partial<Event>) => {
  return apiFetch<Event>('/admin/events/', {
    method: 'POST',
    body: payload,
  });
};
export const updateEvent = async (id: string, payload: Partial<Event>) => {
  return apiFetch<Event>(`/admin/events/${id}`, {
    method: 'PUT',
    body: payload,
  });
};
export const deleteEvent = async (id: string) => {
  return apiFetch<void>(`/admin/events/${id}`, {
    method: 'DELETE',
  });
};

//sponsors
export const listSponsors = async (): Promise<Sponsor[]> => {
  const res = await apiFetch<any>('/admin/features/sponsors');
  // If backend returns { data: [...] } return res.data, else if it's just [...] return res
  if (res && Array.isArray(res.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
};
export const createSponsor = async (sponsor: Partial<Sponsor>): Promise<Sponsor> => {
  return apiFetch<Sponsor>('/admin/features/sponsors', {
    method: 'POST',
    body: sponsor,
  });
};
export const updateSponsor = async (id: string, sponsor: Partial<Sponsor>): Promise<Sponsor> => {
  return apiFetch<Sponsor>(`/admin/features/sponsors/${id}`, {
    method: 'PUT',
    body: sponsor,
  });
};
export const deleteSponsor = async (id: string): Promise<void> => {
  return apiFetch<void>(`/admin/features/sponsors/${id}`, {
    method: 'DELETE',
  });
};


// Reviews
export const getReviews = async () => {
  const res = await apiFetch('/admin/features/reviews');
  return res?.data || [];
};
export const createReview = async (payload: any) => {
  return apiFetch('/admin/features/reviews', {
    method: 'POST',
    body: payload,
  });
};

// Favorites
export const getFavorites = async () => {
  const res = await apiFetch('/admin/features/favorites');
  return res?.data || [];
};
export const addFavorite = async (payload: any) => {
  return apiFetch('/admin/features/favorites/add', {
    method: 'POST',
    body: payload,
  });
};
export const removeFavorite = async (payload: any) => {
  return apiFetch('/admin/features/favorites/remove', {
    method: 'POST',
    body: payload,
  });
};

// Tickets
export const getTickets = async () => {
  const res = await apiFetch('/admin/features/tickets');
  return res?.data || [];
};
export const purchaseTickets = async (payload: any) => {
  return apiFetch('/admin/features/tickets/purchase', {
    method: 'POST',
    body: payload,
  });
};
export const refundTicket = async (id: string) => {
  return apiFetch(`/admin/features/tickets/${id}/refund`, {
    method: 'POST',
  });
};

// Blogs by admins-for blog management in AdminBlogManager
export const getBlogs = async () => {
  const res = await apiFetch('/admin/blogs/');
  return res?.data || [];
};
export const createBlog = async (payload: any) => {
  return apiFetch('/admin/blogs/', {
    method: 'POST',
    body: payload,
  });
};
export const updateBlog = async (id: string, payload: any) => {
  return apiFetch(`/admin/blogs/${id}`, {
    method: 'PUT',
    body: payload,
  });
};
export const deleteBlog = async (id: string) => {
  return apiFetch(`/admin/blogs/${id}`, {
    method: 'DELETE',
  });
};
export const publishBlog = async (id: string) => {
  return apiFetch(`/admin/blogs/${id}/publish`, { method: 'PUT' });
};
export const unpublishBlog = async (id: string) => {
  return apiFetch(`/admin/blogs/${id}/unpublish`, { method: 'PUT' });
};

// Chats
export const getChats = async (userId?: string) => {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const res = await apiFetch(`/admin/features/chats${query}`);
  return res?.data || [];
};

// Users management
export const getUsers = async () => {
  const res = await apiFetch('/admin/users/');
  // Returns the data array or an empty list if undefined
  return res?.data || [];
};
