import { apiFetch, getToken } from './api';

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
  return apiFetch('/user/favorites/mine');
};

// Reviews
export const getEventReviews = async (eventId: string) => {
  const token = getToken();
  if (!token) return { data: [] };
  return apiFetch(`/user/reviews/event/${eventId}`);
};

export const createReview = async (reviewData: { eventId: string; rating: number; comment: string }) => {
  return apiFetch('/user/reviews/create', {
    method: 'POST',
    body: reviewData,
  });
};

// Blogs (Public)
export const getBlogs = async () => {
  return apiFetch('/api/blogs/');
};

export const getBlogById = async (id: string) => {
  return apiFetch(`/api/blogs/${id}`);
};


//history
export const getUserHistory = async (id: string | undefined) => {
  return apiFetch(`/user/history/${id}`);
};

//preferences
export interface UserPreferences {
  emailTicketConfirmation: boolean;
  emailReminders:          boolean;
  emailNewEvents:          boolean;
  emailBlogs:              boolean;
  emailPromotions:         boolean;
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const data = await apiFetch('/user/preferences/');
  return data?.data ?? data;
}

export async function updateUserPreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
  const data = await apiFetch('/user/preferences/update', {
    method: 'PATCH',
    body: prefs,
  });
  return data?.data ?? data;
}


// Trending events
export const getTrendingEvents = async () => {
  return apiFetch('/api/events/trending');
};

// Nearby events — accepts user coordinates
export const getNearbyEvents = async (lat: number, lng: number, radius = 50) => {
  return apiFetch(`/api/events/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
};

// Related events for a given event
export const getRelatedEvents = async (id: string) => {
  return apiFetch(`/api/events/${id}/related`);
};

// Increment view count — fire and forget
export const incrementEventView = async (id: string) => {
  return apiFetch(`/api/events/${id}/view`, { method: 'POST' });
};

// Organizer public profile
export const getOrganizerPublicProfile = async (id: string) => {
  return apiFetch(`/api/events/organizers/${id}`);
};