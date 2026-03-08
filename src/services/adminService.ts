import { apiFetch } from './api';
import { Event } from '../utilities/types';

interface ListResponse<T> {
  data: T[];
}

// Analytics Endpoints
export const getEventAnalytics = async () => {
  return apiFetch('/analytics/events');
};

// Features Endpoints
// Events
export const listEvents = async (): Promise<ListResponse<Event>> => {
  return apiFetch<ListResponse<Event>>('/features/events');
};
export const createEvent = async (payload: Partial<Event>) => {
  return apiFetch<Event>('/features/events', {
    method: 'POST',
    body: payload,
  });
};
export const updateEvent = async (id: string, payload: Partial<Event>) => {
  return apiFetch<Event>(`/features/events/${id}`, {
    method: 'PUT',
    body: payload,
  });
};
export const deleteEvent = async (id: string) => {
  return apiFetch<void>(`/features/events/${id}`, {
    method: 'DELETE',
  });
};

// Reviews
export const getReviews = async () => {
  return apiFetch('/features/reviews');
};
export const createReview = async (payload: any) => {
  return apiFetch('/features/reviews', {
    method: 'POST',
    body: payload,
  });
};

// Favorites
export const getFavorites = async () => {
  return apiFetch('/features/favorites');
};
export const addFavorite = async (payload: any) => {
  return apiFetch('/features/favorites/add', {
    method: 'POST',
    body: payload,
  });
};
export const removeFavorite = async (payload: any) => {
  return apiFetch('/features/favorites/remove', {
    method: 'POST',
    body: payload,
  });
};

// Tickets
export const getTickets = async () => {
  return apiFetch('/features/tickets');
};
export const purchaseTickets = async (payload: any) => {
  return apiFetch('/features/tickets/purchase', {
    method: 'POST',
    body: payload,
  });
};
export const refundTicket = async (id: string) => {
  return apiFetch(`/features/tickets/${id}/refund`, {
    method: 'POST',
  });
};

// Blogs
export const getBlogs = async () => {
  return apiFetch('/features/blogs');
};
export const createBlog = async (payload: any) => {
  return apiFetch('/features/blogs', {
    method: 'POST',
    body: payload,
  });
};
export const updateBlog = async (id: string, payload: any) => {
  return apiFetch(`/features/blogs/${id}`, {
    method: 'PUT',
    body: payload,
  });
};
export const deleteBlog = async (id: string) => {
  return apiFetch(`/features/blogs/${id}`, {
    method: 'DELETE',
  });
};
export const publishBlog = async (id: string) => {
  return apiFetch(`/features/blogs/${id}/publish`, { method: 'PUT' });
};
export const unpublishBlog = async (id: string) => {
  return apiFetch(`/features/blogs/${id}/unpublish`, { method: 'PUT' });
};

// Newsletter
export const getNewsletterSubscribers = async () => {
  return apiFetch('/features/newsletter');
};

// Chats
export const getChats = async () => {
  return apiFetch('/features/chats');
};
