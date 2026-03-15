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

// Initiate M-Pesa purchase — returns checkoutRequestId for polling
export const purchaseTickets = async (
  eventId: string,
  ticketTypeId: string,
  quantity: number,
  phoneNumber: string,
): Promise<{ checkoutRequestId: string; paymentId: string; ticketIds: string[]; amount: number; message: string }> => {
  return apiFetch('/user/tickets/purchase', {
    method: 'POST',
    body: { eventId, ticketTypeId, quantity, phoneNumber },
  });
};

// Poll payment status
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