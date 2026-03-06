// Types reflecting the backend API contract

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description?: string;
}

export interface EventAnalytics {
  totalTicketsSold: number;
  totalRevenue: number;
  // Optional extra fields that backend may include
  monthlyRevenue?: { month: string; revenue: number }[];
  topEvents?: { name: string; tickets: number; revenue: number }[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  imageUrl: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  organizerId: string;
  createdAt: string;
  updatedAt: string;
  ticketTypes: TicketType[];
  analytics?: EventAnalytics[];
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  ticketTypeId: string;
  purchaseDate: string;
  qrCode: string | null;
  status: 'ACTIVE' | 'USED' | 'REFUNDED';
  paymentId: string | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
  tier: 'GOLD' | 'SILVER' | 'BRONZE';
  contactEmail: string;
}

export interface Analytics {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  eventsByCategory: { [key: string]: number };
  monthlyRevenue: { month: string; revenue: number }[];
  topEvents?: { name: string; tickets: number; revenue: number }[];
}