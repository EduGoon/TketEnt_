import { useAuth } from './AuthContext';

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  eventName?: string;
  eventImageUrl?: string;
  eventVenue?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  ticketTypeName?: string;
  ticketPrice?: number;
  ticketNote?: string;
  qrCode?: string;
  status: 'ACTIVE' | 'USED' | 'REFUNDED';
  purchaseDate: string;
}

export const useTickets = () => {
  const { user } = useAuth();

  // For demo mode, use a fixed demo user ID
  const currentUserId = user?.id || 999; // Demo user ID

  const getUserTickets = (): Ticket[] => {
    const stored = localStorage.getItem(`tickets_${currentUserId}`);
    const tickets = stored ? JSON.parse(stored) : [];
    console.log('Getting tickets for user', currentUserId, ':', tickets);
    return tickets;
  };

  const addTicket = (ticket: Omit<Ticket, 'id' | 'purchaseDate'>) => {
    const tickets = getUserTickets();
    const newTicket: Ticket = {
      ...ticket,
      id: Date.now().toString(),
      purchaseDate: new Date().toISOString(),
    };
    tickets.push(newTicket);
    localStorage.setItem(`tickets_${currentUserId}`, JSON.stringify(tickets));
    console.log('Added ticket for user', currentUserId, ':', newTicket);
    console.log('All tickets now:', tickets);
  };

  return { getUserTickets, addTicket };
};