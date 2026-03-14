import React, { useEffect, useMemo, useState } from 'react';
import * as adminService from '../services/adminService';
import { AdminAnalyticsResponse } from '../utilities/types';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const fmt = (v: number) => v.toLocaleString();

function StatCard({ label, value, sub, color = 'text-gray-900', blur = false }: {
  label: string; value: string; sub?: string; color?: string; blur?: boolean;
}) {
  const [visible, setVisible] = useState(!blur);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{label}</p>
      <div className="flex items-start justify-between">
        <p className={`text-2xl font-black ${color} ${!visible ? 'blur-sm select-none' : ''} transition-all`}>{value}</p>
        {blur && (
          <button onClick={() => setVisible(v => !v)} className="text-gray-300 hover:text-gray-500 transition-colors ml-2 flex-shrink-0">
            {visible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        )}
      </div>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function BarChart({ data, valueKey, labelKey, color, label }: {
  data: any[]; valueKey: string; labelKey: string; color: string; label: string;
}) {
  const max = useMemo(() => Math.max(...data.map(d => d[valueKey] ?? 0), 1), [data, valueKey]);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-base font-bold text-gray-800 mb-5">{label}</h3>
      <div className="flex items-end gap-1 h-48 border-b border-gray-100">
        {data.map((d, i) => {
          const pct = max > 0 ? (d[valueKey] / max) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {d[labelKey]}: {fmt(d[valueKey] ?? 0)}
              </div>
              <div className={`${color} w-full rounded-t transition-all duration-500`} style={{ height: `${pct}%`, minHeight: d[valueKey] > 0 ? 3 : 0 }} />
              <span className="text-[9px] text-gray-400 mt-1 uppercase font-bold truncate w-full text-center">{String(d[labelKey]).substring(0, 3)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const AdminAnalyticsManager: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'revenue' | 'tickets'>('revenue');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = async () => {
    try {
      setError(null);
      const res = await adminService.getEventAnalytics();
      setAnalytics(res?.data ?? null);
    } catch {
      setError('Failed to load analytics.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { loadAnalytics(); }, []);

  const totals    = analytics?.totals        ?? { totalRevenue: 0, totalTickets: 0 };
  const users     = analytics?.users         ?? { total: 0, organizers: 0, admins: 0, newThisMonth: 0, repeatCustomers: 0, repeatCustomerRate: 0 };
  const events    = analytics?.events        ?? { total: 0, byStatus: { PUBLISHED: 0, DRAFT: 0, ENDED: 0, CANCELLED: 0 } };
  const content   = analytics?.content       ?? { totalBlogs: 0, publishedBlogs: 0 };
  const engage    = analytics?.engagement    ?? { totalReviews: 0, avgPlatformRating: 0, totalCheckIns: 0 };
  const apps      = analytics?.applications  ?? { pending: 0, total: 0 };
  const payouts   = analytics?.payouts       ?? { pendingCount: 0, pendingValue: 0, totalPlatformFeeEarned: 0, totalReleasedToOrganizers: 0 };
  const topOrgs   = analytics?.topOrganizers ?? [];
  const topEvents = analytics?.topEvents     ?? [];
  const avgPrice  = totals.totalTickets ? Math.round(totals.totalRevenue / totals.totalTickets) : 0;

  const sortedTopEvents = useMemo(() => {
    return [...topEvents].sort((a, b) => sortBy === 'tickets' ? (b.ticketsSold - a.ticketsSold) : (b.revenue - a.revenue));
  }, [sortBy, topEvents]);

  if (error) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center"><p className="text-red-500 font-semibold mb-2">Failed to load analytics</p><button onClick={() => { setLoading(true); loadAnalytics(); }} className="text-sm text-green-600 underline">Retry</button></div>
    </div>
  );

  if (loading && !analytics) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center"><div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-400 text-sm">Loading analytics…</p></div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Analytics</h2>
          <p className="text-sm text-gray-400 mt-1">Updated: {analytics?.lastUpdated ? new Date(analytics.lastUpdated).toLocaleString() : '—'}</p>
        </div>
        <button onClick={() => { setLoading(true); setIsRefreshing(true); loadAnalytics(); }} disabled={isRefreshing}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          {isRefreshing ? <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : '↻'} Refresh
        </button>
      </div>

      {/* ── Section 1: Revenue & Tickets ── */}
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Revenue & Tickets</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value={`KSH ${fmt(totals.totalRevenue)}`} sub="All time ticket sales" color="text-green-600" blur />
        <StatCard label="Total Tickets Sold" value={fmt(totals.totalTickets)} sub="All time" color="text-blue-600" />
        <StatCard label="Avg Ticket Price" value={`KSH ${fmt(avgPrice)}`} color="text-yellow-600" blur />
        <StatCard label="Platform Fees Earned" value={`KSH ${fmt(payouts.totalPlatformFeeEarned)}`} sub="From released payouts" color="text-purple-600" blur />
      </div>

      {/* ── Section 2: Users ── */}
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Users</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={fmt(users.total)} sub={`+${users.newThisMonth} this month`} color="text-gray-900" />
        <StatCard label="Organizers" value={fmt(users.organizers)} sub={`${apps.pending} application${apps.pending !== 1 ? 's' : ''} pending`} color="text-orange-600" />
        <StatCard label="Repeat Customers" value={`${users.repeatCustomerRate}%`} sub={`${fmt(users.repeatCustomers)} users bought 2+ events`} color="text-indigo-600" />
        <StatCard label="Total Admins" value={fmt(users.admins)} color="text-gray-600" />
      </div>

      {/* ── Section 3: Events ── */}
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Events</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Events" value={fmt(events.total)} color="text-gray-900" />
        <StatCard label="Published" value={fmt(events.byStatus.PUBLISHED)} color="text-green-600" />
        <StatCard label="Ended" value={fmt(events.byStatus.ENDED)} color="text-gray-500" />
        <StatCard label="Cancelled / Draft" value={`${fmt(events.byStatus.CANCELLED)} / ${fmt(events.byStatus.DRAFT)}`} color="text-red-400" />
      </div>

      {/* ── Section 4: Engagement ── */}
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Engagement & Content</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Avg Platform Rating" value={`${engage.avgPlatformRating}/5`} sub={`${fmt(engage.totalReviews)} total reviews`} color="text-orange-500" />
        <StatCard label="Total Check-Ins" value={fmt(engage.totalCheckIns)} sub="QR scans at events" color="text-teal-600" />
        <StatCard label="Blog Posts" value={fmt(content.publishedBlogs)} sub={`${fmt(content.totalBlogs)} total incl. drafts`} color="text-blue-500" />
        <StatCard label="Pending Payouts" value={fmt(payouts.pendingCount)} sub={`KSH ${fmt(payouts.pendingValue)} awaiting release`} color="text-yellow-600" />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <BarChart data={analytics?.monthlyRevenue ?? []} valueKey="revenue" labelKey="label" color="bg-green-500" label="Monthly Revenue (KSH)" />
        <BarChart data={analytics?.monthlyTicketsSold ?? []} valueKey="ticketsSold" labelKey="label" color="bg-blue-500" label="Monthly Tickets Sold" />
        <BarChart data={analytics?.newUsersPerMonth ?? []} valueKey="count" labelKey="label" color="bg-indigo-400" label="New Users per Month" />
      </div>

      {/* ── Top Events Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-base font-bold text-gray-800">Top Events</h3>
          <div className="flex gap-2">
            {(['revenue', 'tickets'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Event', 'Status', 'Tickets Sold', 'Revenue', 'Check-ins', 'Fill Rate'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedTopEvents.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400 italic">No event data yet</td></tr>
              ) : sortedTopEvents.map((ev) => {
const pct = (ev.totalTicketQuantity ?? 0) > 0 ? Math.round(((ev.ticketsSold ?? 0) / (ev.totalTicketQuantity ?? 1)) * 100) : 0;                const statusColors: any = { PUBLISHED: 'bg-green-100 text-green-700', DRAFT: 'bg-yellow-100 text-yellow-700', ENDED: 'bg-gray-100 text-gray-500', CANCELLED: 'bg-red-100 text-red-600' };
                return (
                  <tr key={ev.eventId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800 max-w-[200px] truncate">{ev.title}</td>
                    <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[ev.status] ?? 'bg-gray-100 text-gray-500'}`}>{ev.status}</span></td>
<td className="px-5 py-4 text-sm text-gray-600">{fmt(ev.ticketsSold ?? 0)} / {fmt(ev.totalTicketQuantity ?? 0)}</td>                    <td className="px-5 py-4 text-sm font-semibold text-green-700">KSH {fmt(ev.revenue)}</td>
<td className="px-5 py-4 text-sm text-gray-600">{fmt((ev as any).checkIns ?? 0)}</td>                    <td className="px-5 py-4 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 font-mono w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Top Organizers Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800">Top Organizers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Organizer', 'Events', 'Tickets Sold', 'Gross Revenue', 'Projected Cut'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topOrgs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400 italic">No organizer data yet</td></tr>
              ) : topOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-gray-800">{org.name || `Organizer ${org.id.substring(0,6)}`}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{org.events}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{fmt(org.ticketsSold)}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-green-700">KSH {fmt(org.revenue)}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">KSH {fmt(Math.round(org.revenue * 0.05))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsManager;