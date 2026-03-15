import { useState, useEffect } from 'react';
import * as adminService from '../services/adminService';

const STATUS_COLORS: any = {
  COMPLETED: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  PENDING:   { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  FAILED:    { bg: 'bg-gray-100',  text: 'text-gray-500',   border: 'border-gray-200'  },
  REFUNDED:  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
};

export default function AdminPaymentsManager() {
  const [payments, setPayments]   = useState<any[]>([]);
  const [stats, setStats]         = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('ALL');
  const [selected, setSelected]   = useState<any>(null);
  const [note, setNote]           = useState('');
  const [acting, setActing]       = useState(false);
  const [toast, setToast]         = useState('');

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        adminService.getAllPayments(filter === 'ALL' ? undefined : filter),
        adminService.getPaymentStats(),
      ]);
      setPayments(p?.data ?? []);
      setStats(s?.data ?? null);
    } catch { setPayments([]); }
    finally { setLoading(false); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleConfirm = async (id: string) => {
    setActing(true);
    try {
      await adminService.confirmPayment(id, note);
      showToast('Payment confirmed — ticket activated');
      setSelected(null); setNote(''); loadData();
    } catch (err: any) { showToast(err.message || 'Failed to confirm'); }
    finally { setActing(false); }
  };

  const handleRefund = async (id: string) => {
    setActing(true);
    try {
      const resp = await adminService.refundPayment(id, note);
      const info = resp?.refundTo;
      showToast(`Refunded — send KSH ${info?.amount?.toLocaleString()} to ${info?.phone} (${info?.name})`);
      setSelected(null); setNote(''); loadData();
    } catch (err: any) { showToast(err.message || 'Failed to refund'); }
    finally { setActing(false); }
  };

  return (
    <div>
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-xl max-w-sm">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Payments</h2>
          <p className="text-gray-400 text-sm mt-1">Monitor transactions and manage refunds</p>
        </div>
        <button onClick={loadData} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Completed', count: stats.completed.count, amount: stats.completed.total, color: 'text-green-600' },
            { label: 'Pending',   count: stats.pending.count,   amount: stats.pending.total,   color: 'text-yellow-600' },
            { label: 'Failed',    count: stats.failed.count,    amount: stats.failed.total,    color: 'text-gray-400' },
            { label: 'Refunded',  count: stats.refunded.count,  amount: stats.refunded.total,  color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
              <p className="text-xs text-gray-400 mt-1">KSH {s.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
              filter === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {/* Payments list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">No {filter.toLowerCase()} payments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map(p => {
            const colors = STATUS_COLORS[p.status] ?? STATUS_COLORS.FAILED;
            const user   = p.ticket?.user;
            const event  = p.ticket?.event;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-300 transition-all cursor-pointer" onClick={() => { setSelected(p); setNote(''); }}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-black text-gray-600 flex-shrink-0">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{event?.title ?? 'Unknown event'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-black text-gray-900">KSH {p.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 font-mono">{new Date(p.createdAt).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Payment Details</h3>
                  <p className="text-gray-400 text-xs font-mono mt-1">{selected.id}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
              </div>

              {/* User info */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Customer</p>
                {[
                  { label: 'Name',   value: `${selected.ticket?.user?.firstName} ${selected.ticket?.user?.lastName}` },
                  { label: 'Email',  value: selected.ticket?.user?.email },
                  { label: 'Phone',  value: selected.ticket?.user?.phone ?? selected.phoneNumber ?? '—' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2 border-b border-gray-200 last:border-0 text-sm">
                    <span className="text-gray-400 font-semibold">{row.label}</span>
                    <span className="text-gray-800 font-semibold">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Payment info */}
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Amount',       value: `KSH ${selected.amount.toLocaleString()}` },
                  { label: 'Status',       value: selected.status },
                  { label: 'Event',        value: selected.ticket?.event?.title ?? '—' },
                  { label: 'Ticket Type',  value: selected.ticket?.ticketType?.name ?? '—' },
                  { label: 'M-Pesa Ref',   value: selected.transactionId ?? '—' },
                  { label: 'Checkout ID',  value: selected.checkoutRequestId ?? '—' },
                  { label: 'Result Code',  value: selected.resultCode !== null ? String(selected.resultCode) : '—' },
                  { label: 'Result',       value: selected.resultDesc ?? '—' },
                  { label: 'Date',         value: new Date(selected.createdAt).toLocaleString() },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                    <span className="text-gray-400 font-semibold">{row.label}</span>
                    <span className="text-gray-700 font-semibold text-right max-w-[240px] break-all">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Admin note */}
              <div className="mb-4">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  Admin Note <span className="font-normal text-gray-400 normal-case">(optional)</span>
                </label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Reason for action..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>

              {/* Action buttons based on status */}
              <div className="flex flex-col gap-3">
                {/* Confirm — for payments stuck PENDING where money was actually received */}
                {(selected.status === 'PENDING' || selected.status === 'FAILED') && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-green-700 mb-1">Manually Confirm</p>
                    <p className="text-xs text-green-600 mb-3">Use this ONLY if you can confirm money was received in your M-Pesa paybill but the ticket is still pending. This activates the ticket.</p>
                    <button onClick={() => handleConfirm(selected.id)} disabled={acting}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-all">
                      {acting ? 'Processing…' : '✓ Confirm & Activate Ticket'}
                    </button>
                  </div>
                )}

                {/* Refund — for completed payments that need to be reversed */}
                {selected.status !== 'REFUNDED' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-700 mb-1">Issue Refund</p>
                    <p className="text-xs text-blue-600 mb-3">
                      This marks the payment as refunded and deactivates the ticket. You will need to manually send{' '}
                      <strong>KSH {selected.amount.toLocaleString()}</strong> to{' '}
                      <strong>{selected.ticket?.user?.phone ?? selected.phoneNumber ?? 'customer phone'}</strong> via M-Pesa.
                    </p>
                    <button onClick={() => handleRefund(selected.id)} disabled={acting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-all">
                      {acting ? 'Processing…' : '↩ Mark as Refunded'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}