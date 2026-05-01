import { useState, useEffect } from 'react';
import * as adminService from '../services/adminService';
import { ListingPayment } from '../utilities/types';

const S = {
  card: { background: 'linear-gradient(160deg,#141927,#0f1521)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: 32 } as React.CSSProperties,
  label: { fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' as const, fontFamily: "'DM Mono',monospace", marginBottom: 6 },
  mono: { fontFamily: "'DM Mono',monospace", color: '#f0c040' },
};

const STATUS_COLORS: any = {
  PENDING:  { color: '#f0c040', bg: 'rgba(240,192,64,0.1)' },
  APPROVED: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  REJECTED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
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
    <div style={{ color: '#fff' }} className="space-y-8">
      <div className="flex justify-between items-end flex-wrap gap-6">
        <div>
          <h2 style={{ fontFamily: "'Playfair Display',serif" }} className="text-4xl font-black text-white">Listing Requests</h2>
          <p className="text-gray-400 text-sm mt-2">Review organizer payments to manually publish events.</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }} className="flex p-1 rounded-2xl">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${filter === s ? 'bg-[#f0c040] text-[#0a0d14]' : 'text-gray-500 hover:text-white'}`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-3xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...S.card, borderStyle: 'dashed', textAlign: 'center' }} className="py-24">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No listing requests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map(p => {
            const colors = STATUS_COLORS[p.status];
            const projected = p.event?.ticketTypes?.reduce((s, t) => s + (t.price * t.quantity), 0) || 0;
            return (
              <div key={p.id} style={S.card} className="flex flex-col md:flex-row gap-10">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <h3 style={{ fontFamily: "'Playfair Display',serif" }} className="text-2xl font-bold text-white">{p.event?.title}</h3>
                    <span style={{ background: 'rgba(240,192,64,0.1)', color: '#f0c040', border: '1px solid rgba(240,192,64,0.2)' }} className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{p.event?.category}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p style={S.label}>Organizer</p>
                      <p className="text-sm font-bold text-white">{p.organizer?.organizerProfile?.organizationName}</p>
                      <p className="text-xs text-gray-400 mt-1">{p.organizer?.email}</p>
                    </div>
                    <div>
                      <p style={S.label}>Revenue Projection</p>
                      <p style={{ color: '#22c55e' }} className="text-sm font-bold">KSH {projected.toLocaleString()}</p>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16 }} className="p-4 flex flex-wrap gap-4 text-xs font-medium">
                    {p.event?.ticketTypes?.map(tt => (
                      <span key={tt.id} style={{ border: '1px solid rgba(255,255,255,0.08)' }} className="bg-[#141927] px-3 py-2 rounded-xl text-gray-400">
                        <span className="text-white">{tt.name}</span>: {tt.quantity} @ KSH {tt.price}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }} className="w-full md:w-72 md:pl-10 flex flex-col justify-between">
                  <div>
                    <p style={{ ...S.label, textAlign: 'center' }}>Submitted Proof</p>
                    <div className="text-center mb-6">
                      <p style={{ color: '#f0c040' }} className="text-4xl font-black font-mono">KSH {p.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-2 tracking-widest">Listing Fee (5%)</p>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold">Code:</span>
                        <button onClick={() => navigator.clipboard.writeText(p.transactionCode)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} className="font-mono font-bold text-white px-3 py-1.5 rounded-lg hover:border-[#f0c040] transition-all">{p.transactionCode}</button>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-bold">Phone:</span>
                        <span className="font-bold text-white">{p.phoneUsed}</span>
                      </div>
                    </div>
                  </div>

                  {p.status === 'PENDING' ? (
                    <div className="space-y-3">
                      <textarea 
                        placeholder="Admin note (required for rejection)" 
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                        className="w-full text-xs p-4 rounded-2xl outline-none text-white focus:border-[#f0c040] resize-none"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button disabled={acting} onClick={() => handleAction(p.id, 'APPROVE')} style={{ background: '#22c55e', color: '#0a0d14' }} className="flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all">Approve</button>
                        <button disabled={acting} onClick={() => handleAction(p.id, 'REJECT')} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }} className="flex-1 text-[#ef4444] py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Reject</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: colors.bg, border: `1px solid ${colors.color}44`, color: colors.color }} className="text-center p-4 rounded-2xl">
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