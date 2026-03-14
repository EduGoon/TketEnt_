import { apiFetch } from './api';

// ── Applications (user) ───────────────────────────────────────
export const submitApplication = async (data: {
  organizationName: string;
  bio: string;
  phone: string;
  socialLink?: string;
  experience?: string;
}) => apiFetch('/user/application', { method: 'POST', body: data });

export const getMyApplication = async () => apiFetch('/user/application');

// ── Applications (admin) ──────────────────────────────────────
export const getAllApplications = async (status?: string) => {
  const query = status ? `?status=${status}` : '';
  return apiFetch(`/admin/applications${query}`);
};

export const approveApplication = async (id: string) =>
  apiFetch(`/admin/applications/${id}/approve`, { method: 'PUT' });

export const rejectApplication = async (id: string, adminNote?: string) =>
  apiFetch(`/admin/applications/${id}/reject`, { method: 'PUT', body: { adminNote } });

// ── Organizer events ──────────────────────────────────────────
export const getOrganizerEvents = async () => apiFetch('/organizer/events');

export const createOrganizerEvent = async (data: any) =>
  apiFetch('/organizer/events', { method: 'POST', body: data });

export const updateOrganizerEvent = async (id: string, data: any) =>
  apiFetch(`/organizer/events/${id}`, { method: 'PUT', body: data });

export const deleteOrganizerEvent = async (id: string) =>
  apiFetch(`/organizer/events/${id}`, { method: 'DELETE' });

export const getEventSales = async (id: string) =>
  apiFetch(`/organizer/events/${id}/sales`);

// ── Organizer profile ─────────────────────────────────────────
export const getOrganizerProfile = async () => apiFetch('/organizer/profile');

export const updateOrganizerProfile = async (data: any) =>
  apiFetch('/organizer/profile', { method: 'PUT', body: data });

// ── Payouts ───────────────────────────────────────────────────
export const getOrganizerPayouts = async () => apiFetch('/organizer/payouts');

export const requestPayout = async (eventId: string) =>
  apiFetch('/organizer/payouts/request', { method: 'POST', body: { eventId } });

// ── Check-in ──────────────────────────────────────────────────
export const scanTicket = async (ticketId: string, eventId: string) =>
  apiFetch('/organizer/checkin/scan', { method: 'POST', body: { ticketId, eventId } });

export const getEventCheckIns = async (eventId: string) =>
  apiFetch(`/organizer/checkin/event/${eventId}`);

// ── Admin payouts ─────────────────────────────────────────────
export const getAllPayouts = async () => apiFetch('/admin/payouts');
export const releasePayout = async (id: string, adminNote?: string) =>
  apiFetch(`/admin/payouts/${id}/release`, { method: 'PUT', body: { adminNote } });
export const rejectPayout = async (id: string, adminNote: string) =>
  apiFetch(`/admin/payouts/${id}/reject`, { method: 'PUT', body: { adminNote } });


export const revokeOrganizer = async (userId: string, adminNote?: string) =>
  apiFetch(`/admin/applications/revoke/${userId}`, { method: 'PUT', body: { adminNote } });


// ── Terms ─────────────────────────────────────────────────────
export const getTerms = async (type: 'USER' | 'ORGANIZER') =>
  apiFetch(`/api/terms/${type}`);

export const updateTerms = async (type: 'USER' | 'ORGANIZER', content: string, version?: string) =>
  apiFetch(`/admin/terms/${type}`, { method: 'PUT', body: { content, version } });