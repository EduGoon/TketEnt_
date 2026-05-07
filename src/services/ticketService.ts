import { apiFetch } from './api';
import { Ticket } from '../utilities/types';

interface ListResponse<T> {
  data: T[];
}

export const listUserTickets = async (): Promise<ListResponse<Ticket>> => {
  return apiFetch<ListResponse<Ticket>>('/user/tickets/');
};

export const getTicket = async (id: string): Promise<Ticket> => {
  return apiFetch<Ticket>(`/user/tickets/${id}`);
};

export const listTickets = async (): Promise<ListResponse<Ticket>> => {
  return apiFetch<ListResponse<Ticket>>('/user/tickets/');
};

// Initiate Paystack purchase — returns authorization_url and reference
export const purchaseTickets = async (
  eventId: string,
  ticketTypeId: string,
  quantity: number,
  email: string,
): Promise<{ authorization_url: string; reference: string }> => {
  return apiFetch('/user/tickets/purchase', {
    method: 'POST',
    body: { eventId, ticketTypeId, quantity, email },
  });
};

// Bulk purchase for multiple ticket types — returns authorization_url and reference
export const purchaseMultipleTickets = async (
  eventId: string,
  tickets: { ticketTypeId: string; quantity: number }[],
  email: string,
): Promise<{ authorization_url: string; reference: string }> => {
  return apiFetch('/user/tickets/purchase', {
    method: 'POST',
    body: { eventId, tickets, email },
  });
};

export const verifyPayment = async (
  reference: string,
): Promise<{ status: 'success' | 'pending' | 'failed'; message?: string; tickets?: any[] }> => {
  return apiFetch(`/payments/verify/${reference}`);
};

// Legacy polling helper
export const pollPaymentStatus = async (
  checkoutRequestId: string,
): Promise<{ status: 'PENDING' | 'COMPLETED' | 'FAILED'; message: string }> => {
  return apiFetch(`/user/tickets/poll/${checkoutRequestId}`);
};

export const refundTicket = async (id: string): Promise<{ message: string }> => {
  return apiFetch<{ message: string }>(`/user/tickets/${id}/refund`, {
    method: 'POST',
  });
};

export const getUserUpcomingEvents = async () => {
  return apiFetch('/user/events/');
};