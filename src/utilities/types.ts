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

export interface AdminAnalyticsMonthlyRevenueItem {
  month: string;
  label: string;
  revenue: number;
  ticketsSold: number;
}

export interface AdminAnalyticsMonthlyTicketsSoldItem {
  month: string;
  ticketsSold: number;
}

export interface AdminAnalyticsPerEventMonthly {
  eventId: string;
  title: string;
  status: string;
  monthly?: Record<string, number>;
  monthlySeries?: AdminAnalyticsMonthlyTicketsSoldItem[];
}

export interface AdminAnalyticsTopEvent {
  eventId: string;
  title: string;
  status: string;
  ticketsSold: number;
  revenue: number;
  percentageOfTotalRevenue?: number;
  percentageOfTotalTickets?: number;
  monthly?: Record<string, number>;
}

export interface AdminAnalyticsResponse {
  lastUpdated: string;
  since: string | null;
  monthlyRevenue: AdminAnalyticsMonthlyRevenueItem[];
  monthlyTicketsSold: AdminAnalyticsMonthlyTicketsSoldItem[];
  perEventMonthly: AdminAnalyticsPerEventMonthly[];
  topEvents: AdminAnalyticsTopEvent[];
  totals: { totalRevenue: number; totalTickets: number };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  // Legacy date field; modern backend provides start/end times.
  date?: string;
  // New enriched event scheduling fields.
  startTime?: string;
  endTime?: string;
  location?: string;
  venue?: string;
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
  // Enriched ticket payload from backend.
  eventName?: string;
  eventVenue?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  eventImageUrl?: string;
  ticketTypeName?: string;
  ticketPrice?: number;
  ticketNote?: string;
  // Legacy / alternate fields (kept for backwards compatibility).
  venue?: string;
  startTime?: string;
  endTime?: string;
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