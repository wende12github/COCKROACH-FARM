'use client';

import { Bell, User, Search, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useFirebaseList, useFirebaseValueEnhanced } from "@/lib/firebase";

// TYPES
interface HeaderProps {
  onSearch?: (value: string) => void;
}

interface Admin {
  name: string;
  role: string;
  email?: string;
}

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  timestamp: number;
  severity: 'critical' | 'warning' | 'info';
}

export default function Header({ onSearch }: HeaderProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [searchText, setSearchText] = useState("");
  const [notificationDropdown, setNotificationDropdown] = useState(false);

  // Real user data from Firebase Auth
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email || 'user@farm.com';
  const role = user?.email === 'admin@cockroachfarm.com' ? 'Admin' :
               user?.email === 'manager@cockroachfarm.com' ? 'Farm Manager' :
               'Operator';

  const avatarText = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Fetch recent unread notifications
  const { data: notifications, loading: notificationsLoading } = useFirebaseList<Notification>('alerts', {
    transform: (data) => data
      .filter(n => !n.isRead)
      .sort((a, b) => b.timestamp - a.timestamp) // newest first
      .slice(0, 5)
  });

  const unreadCount = notifications?.length || 0;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleNotificationsClick = () => {
    router.push('/notifications');
  };

  const handleNotificationClick = (notificationId: string) => {
    router.push(`/notifications?alert=${notificationId}`);
    setNotificationDropdown(false);
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info':
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <header className="bg-gray-950 border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* LEFT - Title */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-green-600">Dashboard</h1>
            <p className="text-sm text-gray-400 hidden md:block">Real-time monitoring and control</p>
          </div>
        </div>

        {/* RIGHT - Search, Notifications, Admin */}
        <div className="flex items-center gap-4">
          {/* Desktop Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              value={searchText}
              onChange={handleSearch}
              type="text"
              placeholder="Search sensors, logs, chambers..."
              className="pl-10 pr-4 py-2 w-64 lg:w-80 bg-gray-800 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationDropdown(!notificationDropdown)}
              className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Bell className="h-6 w-6 text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs bg-red-500 text-white rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {notificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-sm font-medium text-red-600">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="px-4 py-8 text-center text-gray-500">Loading...</div>
                  ) : notifications && notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n.id)}
                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                            n.severity === 'critical' ? 'bg-red-500' :
                            n.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                              {n.message}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(n.severity)}`}>
                                {n.severity}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(n.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No new notifications</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleNotificationsClick}
                    className="w-full flex items-center justify-center gap-2 py-2 text-green-600 hover:text-green-500 font-medium"
                  >
                    View all notifications
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                avatarText
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium text-gray-300">
                {/* {adminLoading ? 'Loading...' : admin.name} */}
                {displayName}
              </p>
              <p className="text-xs text-gray-500">
                {/* {adminLoading ? '...' : admin.role} */}
                {role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="mt-4 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            value={searchText}
            onChange={handleSearch}
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Close dropdown on outside click */}
      {notificationDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setNotificationDropdown(false)}
        />
      )}
    </header>
  );
}