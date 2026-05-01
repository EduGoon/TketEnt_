import { useState, useEffect } from 'react';
import * as adminService from '../services/adminService';
import { ListingPayment } from '../utilities/types';

const STATUS_COLORS: any = {
  PENDING:  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200' },
  APPROVED: { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200'  },
  REJECTED: { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'    },
};

export default function AdminListingManager() {
  const [payments, setPayments] = useState<ListingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [note, setNote] = useState('');
  const [acting, setActing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await adminService.getListingPayments();
      setPayments(resp?.data ?? []);
    } catch { setPayments([]); }
    finally { setLoading(false); }
  };

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    if (action === 'REJECT' && !note.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setActing(true);
    try {
      await adminService.reviewListingPayment(id, action, note);
      setNote('');
      load();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const filtered = payments.filter(p => filter === 'ALL' || p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Listing Requests</h2>
          <p className="text-gray-500 text-sm mt-1">Review organizer payments to publish events.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-gray-100">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filter === s ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-3xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No listing requests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map(p => {
            const colors = STATUS_COLORS[p.status];
            const projected = p.event?.ticketTypes?.reduce((s, t) => s + (t.price * t.quantity), 0) || 0;
            return (
              <div key={p.id} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-black text-gray-900">{p.event?.title}</h3>
                    <span className="bg-yellow-50 text-yellow-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">{p.event?.category}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Organizer</p>
                      <p className="text-sm font-bold">{p.organizer?.organizerProfile?.organizationName}</p>
                      <p className="text-xs text-gray-500">{p.organizer?.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Revenue Projection</p>
                      <p className="text-sm font-bold text-green-600">KSH {projected.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 flex flex-wrap gap-4 text-xs font-medium">
                    {p.event?.ticketTypes?.map(tt => (
                      <span key={tt.id} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg">{tt.name}: {tt.quantity} @ {tt.price}</span>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-72 bg-gray-50 rounded-3xl p-6 flex flex-col justify-between border border-gray-100">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-3 text-center">Submitted Payment</p>
                    <div className="text-center mb-4">
                      <p className="text-3xl font-black text-yellow-600">KSH {p.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Listing Fee (5%)</p>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-bold">Code:</span>
                        <button onClick={() => navigator.clipboard.writeText(p.transactionCode)} className="font-mono font-black text-gray-900 bg-white px-2 py-1 rounded border border-gray-200 hover:border-gray-400 transition-all">{p.transactionCode}</button>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-bold">Phone:</span>
                        <span className="font-bold text-gray-700">{p.phoneUsed}</span>
                      </div>
                    </div>
                  </div>

                  {p.status === 'PENDING' ? (
                    <div className="space-y-3">
                      <textarea 
                        placeholder="Admin note (required for rejection)" 
                        className="w-full text-xs p-3 rounded-xl outline-none border border-gray-200 focus:border-gray-400 resize-none"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button disabled={acting} onClick={() => handleAction(p.id, 'APPROVE')} className="flex-1 bg-green-600 text-white py-3 rounded-xl text-xs font-black uppercase hover:bg-green-700 transition-all">Approve</button>
                        <button disabled={acting} onClick={() => handleAction(p.id, 'REJECT')} className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl text-xs font-black uppercase hover:bg-red-100 transition-all border border-red-100">Reject</button>
                      </div>
                    </div>
                  ) : (
                    <div className={`text-center p-3 rounded-2xl border ${colors.bg} ${colors.text} ${colors.border}`}>
                      <p className="text-[10px] font-black uppercase tracking-widest">{p.status}</p>
                      {p.adminNote && <p className="text-[10px] mt-1 italic">"{p.adminNote}"</p>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}