import { apiFetch } from './api';

interface ListResponse<T> {
  data: T[];
}

// Events
export const listAllevents = async (params: Record<string, any> = {}): Promise<ListResponse<any>> => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/events${query ? `?${query}` : ''}`);
};

export const getEvent = async (id: string) => {
  return apiFetch(`/api/events/${id}`);
};

export const getEventShareMeta = async (id: string) => {
  return apiFetch(`/api/events/${id}/share`);
};

// Favorites
export const addFavorite = async (eventId: string) => {
  return apiFetch('/user/favorites/add', {
    method: 'POST',
    body: { eventId },
  });
};

export const removeFavorite = async (eventId: string) => {
  return apiFetch('/user/favorites/remove', {
    method: 'POST',
    body: { eventId },
  });
};

export const listFavorites = async () => {
  return apiFetch('/user/favorites/');
};

// Reviews
export const getEventReviews = async (eventId: string) => {
  return apiFetch(`/user/reviews/event/${eventId}`);
};

export const createReview = async (reviewData: { eventId: string; rating: number; comment: string }) => {
  return apiFetch('/user/reviews/create', {
    method: 'POST',
    body: reviewData,
  });
};

// Geo Search
export const searchGeoEvents = async (lat: string, lng: string, rad: string) => {
  return apiFetch(`/geo/search?latitude=${lat}&longitude=${lng}&radius=${rad}`);
};
