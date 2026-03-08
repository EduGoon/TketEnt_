import React, { useEffect, useMemo, useState } from 'react';
import * as adminService from '../../services/adminService';
import { AdminAnalyticsResponse } from '../../utilities/types';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const formatNumber = (value: number) => value.toLocaleString();

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'revenue' | 'tickets'>('revenue');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [revenueVisible, setRevenueVisible] = useState(false);
  const [avgPriceVisible, setAvgPriceVisible] = useState(false);

  const loadAnalytics = async () => {
    try {
      setError(null);
      setLoading(true);
      // Use getEventAnalytics for event analytics
      const res = await adminService.getEventAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.error('Failed to load analytics', err);
      const status = (err as any)?.status;
      if (status === 403) {
        setError('Admin access required. Please ensure your account has admin privileges.');
      } else {
        setError('Failed to load analytics. Please try again later.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = analytics?.totals ?? { totalRevenue: 0, totalTickets: 0 };
  const avgTicketPrice = totals.totalTickets ? Math.round(totals.totalRevenue / totals.totalTickets) : 0;
  const monthlyRevenue = analytics?.monthlyRevenue ?? [];
  const monthlyTickets = analytics?.monthlyTicketsSold ?? [];
  const topEvents = analytics?.topEvents ?? [];

  const maxRevenue = useMemo(() => {
    if (!monthlyRevenue.length) return 1;
    return Math.max(...monthlyRevenue.map((m) => m.revenue ?? 0), 1);
  }, [monthlyRevenue]);

  const maxTickets = useMemo(() => {
    if (!monthlyTickets.length) return 1;
    return Math.max(...monthlyTickets.map((m) => m.ticketsSold ?? 0), 1);
  }, [monthlyTickets]);

  const sortedTopEvents = useMemo(() => {
    const copy = [...topEvents];
    return copy.sort((a, b) => {
      if (sortBy === 'tickets') {
        return (b.ticketsSold ?? 0) - (a.ticketsSold ?? 0);
      }
      return (b.revenue ?? 0) - (a.revenue ?? 0);
    });
  }, [sortBy, topEvents]);

  const onRefresh = () => {
    setLoading(true);
    setIsRefreshing(true);
    loadAnalytics();
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (loading && !analytics) {
    return <div className="min-h-screen flex items-center justify-center">Loading analytics...</div>;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">
            Updated: {analytics?.lastUpdated ? new Date(analytics.lastUpdated).toLocaleString() : '—'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading || isRefreshing}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isRefreshing ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
            ) : (
              'Refresh'
            )}
          </button>
          <div className="inline-flex items-center gap-1 text-sm text-gray-600">
            <span>Sort:</span>
            <button
              onClick={() => setSortBy('revenue')}
              className={`px-3 py-1 rounded-md ${
                sortBy === 'revenue' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setSortBy('tickets')}
              className={`px-3 py-1 rounded-md ${
                sortBy === 'tickets' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Tickets
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Events</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics?.perEventMonthly?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Tickets Sold</h3>
          <p className="text-3xl font-bold text-blue-600">{formatNumber(totals.totalTickets)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
          <div className="relative">
            <p className={`text-3xl font-bold text-green-600 ${!revenueVisible ? 'blur-sm' : ''}`}>KSH {formatNumber(totals.totalRevenue)}</p>
            <button
              className="absolute top-0 right-0 p-2 bg-transparent"
              onClick={() => setRevenueVisible(v => !v)}
              aria-label={revenueVisible ? 'Hide' : 'Show'}
            >
              {revenueVisible ? <EyeSlashIcon className="w-6 h-6 text-green-600" /> : <EyeIcon className="w-6 h-6 text-green-600" />}
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Ticket Price</h3>
          <div className="relative">
            <p className={`text-3xl font-bold text-yellow-600 ${!avgPriceVisible ? 'blur-sm' : ''}`}>KSH {formatNumber(avgTicketPrice)}</p>
            <button
              className="absolute top-0 right-0 p-2 bg-transparent"
              onClick={() => setAvgPriceVisible(v => !v)}
              aria-label={avgPriceVisible ? 'Hide' : 'Show'}
            >
              {avgPriceVisible ? <EyeSlashIcon className="w-6 h-6 text-yellow-600" /> : <EyeIcon className="w-6 h-6 text-yellow-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Revenue</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {monthlyRevenue.length > 0 ? (
              monthlyRevenue.map((data) => (
                <div key={data.month} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-green-500 w-full rounded-t"
                    style={{ height: `${Math.min(200, ((data.revenue ?? 0) / maxRevenue) * 200)}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                  <span className="text-xs text-gray-700">KSH {(data.revenue ?? 0).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No monthly revenue data available.</div>
            )}
          </div>
        </div>

        {/* Monthly Tickets Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Tickets Sold</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {monthlyTickets.length > 0 ? (
              monthlyTickets.map((data) => (
                <div key={data.month} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-blue-500 w-full rounded-t"
                    style={{ height: `${Math.min(200, ((data.ticketsSold ?? 0) / maxTickets) * 200)}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                  <span className="text-xs text-gray-700">{formatNumber(data.ticketsSold ?? 0)}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No ticket sales data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Events Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Top Performing Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance(Ticket-Based)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTopEvents.map((event) => {
                const totalTickets = event.totalTicketQuantity ?? 0;
                const sold = event.ticketsSold ?? 0;
                const percent = totalTickets > 0 ? Math.round((sold / totalTickets) * 100) : 0;

                return (
                  <tr key={event.eventId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {event.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(sold)} / {formatNumber(totalTickets)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      KSH {formatNumber(event.revenue ?? 0)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Conversion Rate</h3>
          <p className="text-2xl font-bold text-purple-600">3.2%</p>
          <p className="text-sm text-gray-500">Visitors to ticket purchases</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Average Event Rating</h3>
          <p className="text-2xl font-bold text-orange-600">4.7/5</p>
          <p className="text-sm text-gray-500">Based on user feedback</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Repeat Customers</h3>
          <p className="text-2xl font-bold text-indigo-600">28%</p>
          <p className="text-sm text-gray-500">Customers who bought multiple events</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;