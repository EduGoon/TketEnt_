import React from 'react';
import { Ticket } from '../utilities/types';

interface TicketCardProps {
  ticket: Ticket;
  // When set, only the ticket with the matching isPrintTargetId will be visible in print.
  isPrintTarget?: boolean;
  printMode?: boolean;
  onRequestPrint?: (ticketId: string) => void;
}

const formatDateTime = (iso?: string) => {
  if (!iso) return 'TBD';
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  USED: 'bg-yellow-100 text-yellow-800',
  REFUNDED: 'bg-red-100 text-red-800',
};

const TicketCard: React.FC<TicketCardProps> = ({ ticket, isPrintTarget, printMode, onRequestPrint }) => {
  const ticketStatusClass = statusStyles[ticket.status] ?? 'bg-gray-100 text-gray-800';
  const eventTitle = ticket.eventName ?? 'Event';
  const venue = ticket.eventVenue ?? ticket.venue ?? ticket.eventName ?? 'Venue TBD';
  const startTime = formatDateTime(ticket.eventStartTime ?? ticket.startTime);
  const endTime = formatDateTime(ticket.eventEndTime ?? ticket.endTime);
  const purchaseDate = formatDateTime(ticket.purchaseDate);

  const handlePrint = () => {
    if (onRequestPrint) {
      onRequestPrint(ticket.id);
    }
  };

  const printClass = printMode ? (isPrintTarget ? 'print:block' : 'print:hidden') : '';

  const backgroundImageStyle = ticket.eventImageUrl
    ? { backgroundImage: `url('${ticket.eventImageUrl}')` }
    : undefined;

  return (
    <article
      className={`relative overflow-hidden rounded-xl shadow-lg border border-gray-200 print:border-black print:text-black print:shadow-none max-w-lg mx-auto print:max-w-[7in] print:h-[4.5in] print:mx-auto ${printClass}`}
      style={{
        ...backgroundImageStyle,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative p-6 print:p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white drop-shadow">{eventTitle}</h2>
            <p className="text-sm text-white/90 drop-shadow">{venue}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ticketStatusClass}`}>
            {ticket.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-white/90">
          <div>
            <p className="font-medium">Ticket</p>
            <p>{ticket.ticketTypeName ?? 'General Admission'}</p>
          </div>
          <div>
            <p className="font-medium">Price</p>
            <p>
              {typeof ticket.ticketPrice === 'number'
                ? `KSH ${ticket.ticketPrice.toLocaleString()}`
                : 'TBD'}
            </p>
          </div>
          <div>
            <p className="font-medium">Starts</p>
            <p>{startTime}</p>
          </div>
          <div>
            <p className="font-medium">Ends</p>
            <p>{endTime}</p>
          </div>
        </div>

        {ticket.ticketNote && (
          <div className="mt-4 text-sm text-white/90">
            <p className="font-medium">Note</p>
            <p>{ticket.ticketNote}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-white/80">Purchased</p>
            <p className="text-sm font-medium text-white">{purchaseDate}</p>
          </div>

          <div className="flex items-center gap-3">
            {ticket.qrCode ? (
              <img
                src={ticket.qrCode}
                alt="Ticket QR code"
                className="w-24 h-24 object-cover rounded-lg border border-white/30"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center rounded-lg border border-white/30 bg-white/20 text-xs text-white/80">
                No QR available
              </div>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Download / Print
            </button>
          </div>
        </div>
      </div>

      <div className="hidden print:block print:mt-8 print:border-t print:border-white/30 print:pt-4">
        <p className="text-xs text-white/80">Ticket ID: {ticket.id}</p>
      </div>
    </article>
  );
};

export default TicketCard;
