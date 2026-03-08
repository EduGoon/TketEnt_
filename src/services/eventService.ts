// Favorites endpoints
export const addFavorite = async (eventId: string) => {
  return apiFetch('/favorites/add', {
    method: 'POST',
    body: { eventId },
  });
};

export const removeFavorite = async (eventId: string) => {
  return apiFetch('/favorites/remove', {
    method: 'POST',
    body: { eventId },
  });
};

export const listFavorites = async () => {
  return apiFetch('/favorites/');
};

export const getFavoritesHistory = async () => {
  return apiFetch('/history/user');
};
import { apiFetch } from './api';
import { Event } from '../utilities/types';

interface ListResponse<T> {
  data: T[];
}

export const listEvents = async (params?: {
  keyword?: string;
  category?: string;
  date?: string;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  sort?: string;
}): Promise<ListResponse<Event>> => {
  // Build query string
  const query = params
    ? '?' + Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
        .join('&')
    : '';
  return apiFetch<ListResponse<Event>>(`/events/search${query}`);
};

export const getEvent = async (id: string): Promise<Event> => {
  return apiFetch<Event>(`/events/${id}`);
};

export const createEvent = async (event: Partial<Event>): Promise<Event> => {
  return apiFetch<Event>('/events', {
    method: 'POST',
    body: event,
  });
};

export const updateEvent = async (id: string, event: Partial<Event>): Promise<Event> => {
  return apiFetch<Event>(`/events/${id}`, {
    method: 'PUT',
    body: event,
  });
};

export const deleteEvent = async (id: string): Promise<void> => {
  return apiFetch<void>(`/events/${id}`, {
    method: 'DELETE',
  });
};
