'use client';

import { FileText, Activity, Calendar, TrendingUp } from 'lucide-react';
import { useFirebaseValueEnhanced, useFirebaseList } from '@/lib/firebase';

interface DailyReport {
  avgTemperature: number;
  avgHumidity: number;
  avgCo2: number;
  totalAlerts: number;
  resolvedAlerts: number;
  generatedAt: number;
}

interface ReportsData {
  daily?: Record<string, DailyReport>;
  weekly?: Record<string, any>;
  monthly?: Record<string, any>;
}

interface Log {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: number;
  source: string;
  user?: string;
  chamber?: string;
}

export default function ReportsPage() {
  // Fetch reports summary
  const { data: reports, loading: reportsLoading } = useFirebaseValueEnhanced<ReportsData>('/reports');

  // Fetch recent logs
  const { data: logs, loading: logsLoading } = useFirebaseList<Log>('logs', {
    orderBy: 'timestamp',
    reverse: true,
    limit: 20
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info':
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const latestDaily = reports?.daily ? Object.values(reports.daily)[0] : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Latest Daily Report */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Latest Daily Report</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          {reportsLoading ? (
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          ) : latestDaily ? (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {formatDate(latestDaily.generatedAt)}
              </p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Temperature</span>
                  <span className="font-medium">{latestDaily.avgTemperature.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Humidity</span>
                  <span className="font-medium">{latestDaily.avgHumidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Alerts</span>
                  <span className="font-medium">{latestDaily.totalAlerts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Resolved</span>
                  <span className="font-medium text-green-600">{latestDaily.resolvedAlerts}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm">No daily report available</p>
          )}
        </div>

        {/* Weekly Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Overview</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          {reports?.weekly && Object.keys(reports.weekly).length > 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-green-600">+12%</div>
              <p className="text-sm text-gray-600 mt-2">Growth this week</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No weekly data yet</p>
          )}
        </div>

        {/* Monthly Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Summary</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          {reports?.monthly && Object.keys(reports.monthly).length > 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-blue-600">87%</div>
              <p className="text-sm text-gray-600 mt-2">System uptime</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No monthly data yet</p>
          )}
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity Logs</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User/Chamber</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logsLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Loading logs...
                  </td>
                </tr>
              ) : logs && logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.source}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.user || log.chamber || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No logs available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}