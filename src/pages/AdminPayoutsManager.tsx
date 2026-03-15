import { useState, useEffect } from 'react';
import * as organizerService from '../services/organizerService';

const STATUS_COLORS: any = {
  PENDING:  { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  RELEASED: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  REJECTED: { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
};

export default function AdminPayoutsManager() {
  const [payouts, setPayouts]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('PENDING');
  const [selected, setSelected]   = useState<any>(null);
  const [adminNote, setAdminNote] = useState('');
  const [acting, setActing]       = useState(false);
  const [toast, setToast]         = useState('');

  useEffect(() => { loadPayouts(); }, [filter]);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const resp = await organizerService.getAllPayouts();
      const all = resp?.data ?? [];
      setPayouts(filter === 'ALL' ? all : all.filter((p: any) => p.status === filter));
    } catch { setPayouts([]); }
    finally { setLoading(false); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  const handleRelease = async (id: string) => {
    setActing(true);
    try {
      await organizerService.releasePayout(id, adminNote);
      showToast('Payout marked as released — email sent to organizer');
      setSelected(null); setAdminNote(''); loadPayouts();
    } catch { showToast('Failed to release payout'); }
    finally { setActing(false); }
  };

  const handleReject = async (id: string) => {
    if (!adminNote.trim()) { showToast('Please add a note explaining the rejection'); return; }
    setActing(true);
    try {
      await organizerService.rejectPayout(id, adminNote);
      showToast('Payout rejected — email sent to organizer');
      setSelected(null); setAdminNote(''); loadPayouts();
    } catch { showToast('Failed to reject payout'); }
    finally { setActing(false); }
  };

  return (
    <div>
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-xl max-w-sm leading-relaxed">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Payout Requests</h2>
          <p className="text-gray-500 text-sm mt-1">Review and release organizer payouts manually via M-Pesa</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['PENDING', 'RELEASED', 'REJECTED', 'ALL'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                filter === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : payouts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">No {filter.toLowerCase()} payout requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payouts.map(p => {
            const colors  = STATUS_COLORS[p.status];
            const profile = p.organizer?.organizerProfile;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-300 transition-all cursor-pointer" onClick={() => { setSelected(p); setAdminNote(''); }}>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-bold text-gray-900">{p.event?.title ?? 'Event'}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {profile?.organizationName ?? `${p.organizer?.firstName} ${p.organizer?.lastName}`} · {p.organizer?.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      Requested {new Date(p.requestedAt).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900">KSH {p.netAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 font-mono">Gross {p.grossAmount.toLocaleString()} · Fee {p.platformFee.toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>{p.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (() => {
        const profile = selected.organizer?.organizerProfile;
        const hasMpesa   = !!profile?.mpesaPhone;
        const hasPaybill = !!profile?.paybillNumber;
        const hasPaymentDetails = hasMpesa || hasPaybill;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative z-10 bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{selected.event?.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {profile?.organizationName ?? `${selected.organizer?.firstName} ${selected.organizer?.lastName}`}
                    </p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
                </div>

                {/* Amount breakdown */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Amount Breakdown</p>
                  {[
                    { label: 'Gross Amount',  value: `KSH ${selected.grossAmount.toLocaleString()}`,  color: 'text-gray-900' },
                    { label: 'Platform Fee (5%)', value: `- KSH ${selected.platformFee.toLocaleString()}`, color: 'text-red-500' },
                    { label: 'Net to Transfer',  value: `KSH ${selected.netAmount.toLocaleString()}`,  color: 'text-green-700 font-black text-lg' },
                  ].map(row => (
                    <div key={row.label} className={`flex justify-between py-2 border-b border-gray-200 last:border-0 text-sm`}>
                      <span className="text-gray-500 font-semibold">{row.label}</span>
                      <span className={`font-bold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* WHERE TO SEND THE MONEY — the critical section */}
                <div className={`rounded-2xl p-4 mb-5 border ${hasPaymentDetails ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                  <p className={`text-xs font-black uppercase tracking-wider mb-3 ${hasPaymentDetails ? 'text-blue-700' : 'text-red-700'}`}>
                    {hasPaymentDetails ? '📲 Send Money To' : '⚠️ No Payment Details'}
                  </p>
                  {hasPaymentDetails ? (
                    <div className="space-y-2">
                      {hasMpesa && (
                        <div className="flex justify-between items-center py-2 border-b border-blue-200 text-sm">
                          <span className="text-blue-600 font-semibold">M-Pesa Number</span>
                          <span className="font-black text-blue-900 text-base font-mono">{profile.mpesaPhone}</span>
                        </div>
                      )}
                      {hasPaybill && (
                        <>
                          <div className="flex justify-between items-center py-2 border-b border-blue-200 text-sm">
                            <span className="text-blue-600 font-semibold">Paybill Number</span>
                            <span className="font-black text-blue-900 text-base font-mono">{profile.paybillNumber}</span>
                          </div>
                          {profile.accountNumber && (
                            <div className="flex justify-between items-center py-2 text-sm">
                              <span className="text-blue-600 font-semibold">Account Number</span>
                              <span className="font-black text-blue-900 font-mono">{profile.accountNumber}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">
                      This organizer has not provided M-Pesa or Paybill details. Contact them at <strong>{selected.organizer?.email}</strong> or <strong>{selected.organizer?.phone ?? 'no phone on file'}</strong> before releasing.
                    </p>
                  )}
                </div>

                {/* Organizer contact */}
                <div className="space-y-2 mb-5">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Organizer Contact</p>
                  {[
                    { label: 'Email', value: selected.organizer?.email },
                    { label: 'Phone', value: selected.organizer?.phone ?? '—' },
                    { label: 'Requested', value: new Date(selected.requestedAt).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                      <span className="text-gray-400 font-semibold">{row.label}</span>
                      <span className="text-gray-800 font-semibold">{row.value}</span>
                    </div>
                  ))}
                </div>

                {selected.status === 'PENDING' && (
                  <>
                    <div className="mb-5 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-xs font-black text-yellow-700 uppercase tracking-wider mb-1">Before you proceed</p>
                      <p className="text-sm text-yellow-700">
                        Send <strong>KSH {selected.netAmount.toLocaleString()}</strong> manually via M-Pesa to the details above, then click <strong>"Mark as Released"</strong> below. An email will be sent to the organizer confirming the payout.
                      </p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Note <span className="font-normal text-gray-400">(required for rejection, optional for release)</span>
                      </label>
                      <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2}
                        placeholder="e.g. Sent via M-Pesa at 2:30pm..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => handleRelease(selected.id)} disabled={acting}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-all">
                        {acting ? 'Processing…' : '✓ Mark as Released'}
                      </button>
                      <button onClick={() => handleReject(selected.id)} disabled={acting}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-all border border-red-200">
                        {acting ? 'Processing…' : '✕ Reject'}
                      </button>
                    </div>
                  </>
                )}

                {selected.status !== 'PENDING' && (
                  <div className={`p-4 rounded-xl text-sm font-medium ${STATUS_COLORS[selected.status].bg} ${STATUS_COLORS[selected.status].text}`}>
                    This payout has been {selected.status.toLowerCase()}.
                    {selected.adminNote && <p className="mt-2 opacity-75">Note: {selected.adminNote}</p>}
                    {selected.releasedAt && <p className="mt-1 opacity-60">Released: {new Date(selected.releasedAt).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}