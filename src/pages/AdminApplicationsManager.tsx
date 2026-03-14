import { useState, useEffect } from 'react';
import * as organizerService from '../services/organizerService';
import { OrganizerApplication } from '../utilities/types';

const STATUS_COLORS = {
  PENDING:  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200' },
  APPROVED: { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200'  },
  REJECTED: { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'    },
};

export default function AdminApplicationsManager() {
  const [applications, setApplications] = useState<OrganizerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('PENDING');
  const [selected, setSelected] = useState<OrganizerApplication | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadApplications();
  }, [filter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const resp = await organizerService.getAllApplications(filter);
      setApplications(resp?.data ?? []);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleApprove = async (id: string) => {
    setActing(true);
    try {
      await organizerService.approveApplication(id);
      showToast('Application approved — user is now an organizer');
      setSelected(null);
      loadApplications();
    } catch {
      showToast('Failed to approve');
    } finally {
      setActing(false);
    }
  };

  const handleReject = async (id: string) => {
    setActing(true);
    try {
      await organizerService.rejectApplication(id, adminNote);
      showToast('Application rejected');
      setSelected(null);
      setAdminNote('');
      loadApplications();
    } catch {
      showToast('Failed to reject');
    } finally {
      setActing(false);
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Organizer Applications</h2>
          <p className="text-gray-500 text-sm mt-1">Review and manage organizer applications</p>
        </div>
        <div className="flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                filter === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">No {filter.toLowerCase()} applications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => {
            const colors = STATUS_COLORS[app.status];
            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-300 transition-all cursor-pointer"
                onClick={() => { setSelected(app); setAdminNote(''); }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-lg font-black text-green-600 flex-shrink-0">
                      {app.user?.firstName?.[0]}{app.user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{app.user?.firstName} {app.user?.lastName}</p>
                      <p className="text-sm text-gray-500">{app.user?.email}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-1">{app.organizationName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {app.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4 line-clamp-2">{app.bio}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{selected.organizationName}</h3>
                  <p className="text-gray-500 text-sm mt-1">{selected.user?.firstName} {selected.user?.lastName} · {selected.user?.email}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-light">✕</button>
              </div>

              <div className="space-y-4 mb-6">
                {[
                  { label: 'Phone',       value: selected.phone },
                  { label: 'Social Link', value: selected.socialLink || '—' },
                  { label: 'Applied',     value: new Date(selected.createdAt).toLocaleDateString('default', { day: 'numeric', month: 'long', year: 'numeric' }) },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-3 border-b border-gray-100 text-sm">
                    <span className="text-gray-400 font-medium">{row.label}</span>
                    <span className="text-gray-800 font-semibold">{row.value}</span>
                  </div>
                ))}

                <div className="py-3 border-b border-gray-100">
                  <p className="text-gray-400 text-sm font-medium mb-2">Bio</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{selected.bio}</p>
                </div>

                {selected.experience && (
                  <div className="py-3 border-b border-gray-100">
                    <p className="text-gray-400 text-sm font-medium mb-2">Past Experience</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{selected.experience}</p>
                  </div>
                )}
              </div>

              {selected.status === 'PENDING' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Rejection Note <span className="font-normal text-gray-400">(optional — only needed if rejecting)</span>
                    </label>
                    <textarea
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      rows={3}
                      placeholder="Reason for rejection..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selected.id)}
                      disabled={acting}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                    >
                      {acting ? 'Processing…' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(selected.id)}
                      disabled={acting}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                    >
                      {acting ? 'Processing…' : '✕ Reject'}
                    </button>
                  </div>
                </>
              )}

             {selected.status !== 'PENDING' && (
  <div>
    <div className={`p-4 rounded-xl text-sm font-medium mb-4 ${STATUS_COLORS[selected.status].bg} ${STATUS_COLORS[selected.status].text}`}>
      This application has been {selected.status.toLowerCase()}.
      {selected.adminNote && <p className="mt-2 opacity-75">Note: {selected.adminNote}</p>}
    </div>

    <div className="mb-4">
      <label className="block text-sm font-bold text-gray-700 mb-2">
        Admin Note <span className="font-normal text-gray-400">(optional)</span>
      </label>
      <textarea
        value={adminNote}
        onChange={e => setAdminNote(e.target.value)}
        rows={3}
        placeholder="Add a note…"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
      />
    </div>

    <div className="flex flex-col gap-3">
      {/* Re-approve — always available */}
      <button
        disabled={acting}
        onClick={() => handleApprove(selected.id)}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-all"
      >
        {acting ? 'Processing…' : '✓ Approve / Re-approve'}
      </button>

      {/* Revoke — only shown for APPROVED */}
      {selected.status === 'APPROVED' && (
        <button
          disabled={acting}
          onClick={async () => {
            setActing(true);
            try {
              await organizerService.revokeOrganizer(selected.userId, adminNote);
              showToast('Organizer access revoked — email sent');
              setSelected(null); setAdminNote(''); loadApplications();
            } catch { showToast('Failed to revoke'); }
            finally { setActing(false); }
          }}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-all"
        >
          {acting ? 'Processing…' : '🔒 Revoke Organizer Access'}
        </button>
      )}
    </div>
  </div>
)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}