export const getUserUpcomingEvents = async () => {
  return apiFetch('/user/events/');
};
import { apiFetch } from './api';
import { Ticket } from '../utilities/types';

interface ListResponse<T> {
  data: T[];
}

export const listUserTickets = async (): Promise<ListResponse<Ticket>> => {
  return apiFetch<ListResponse<Ticket>>('/user/tickets/');
};

export const getTicket = async (id: string): Promise<Ticket> => {
  return apiFetch<Ticket>(`/tickets/${id}`);
};

export const listTickets = async (): Promise<ListResponse<Ticket>> => {
  return apiFetch<ListResponse<Ticket>>('/user/tickets/');
};

export const purchaseTickets = async (
  eventId: string,
  ticketTypeId: string,
  quantity: number
): Promise<ListResponse<Ticket>> => {
  return apiFetch<ListResponse<Ticket>>('/user/tickets/purchase', {
    method: 'POST',
    body: { eventId, ticketTypeId, quantity },
  });
};

export const refundTicket = async (id: string): Promise<{ message: string }> => {
  return apiFetch<{ message: string }>(`/user/tickets/${id}/refund`, {
    method: 'POST',
  });
};
