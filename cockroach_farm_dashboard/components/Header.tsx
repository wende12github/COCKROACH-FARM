'use client';

import { Bell, User, Search, Menu, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseList } from "@/lib/firebase";

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
  icon?: string;
}

export default function Header({ onSearch }: HeaderProps) {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [searchText, setSearchText] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notificationDropdown, setNotificationDropdown] = useState(false);

  // Fetch unread notifications from Firebase
  const { data: notifications, loading: notificationsLoading } = useFirebaseList<Notification>('alerts', {
    transform: (data) => data.filter(n => !n.isRead).slice(0, 5)
  });

  // Fetch admin data
  useEffect(() => {
    setAdmin({
      name: "Admin User",
      role: "Farm Manager",
      email: "admin@smartroach.com"
    });
  }, []);

  /* SEARCH HANDLER */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    onSearch?.(e.target.value);
  };

  /* NAVIGATE TO NOTIFICATIONS PAGE */
  const handleNotificationsClick = () => {
    router.push('/notifications');
  };

  /* MARK NOTIFICATION AS READ */
  const handleNotificationClick = (notificationId: string) => {
    // Navigate to notifications page with the specific notification
    router.push(`/notifications?alert=${notificationId}`);
    setNotificationDropdown(false);
  };

  /* FORMAT TIME */
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  /* GET SEVERITY COLOR */
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': 
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const unreadCount = notifications?.length || 0;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        
        {/* LEFT SIDE - Mobile menu and title */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>

          <div>
            <h1 className="text-xl font-bold text-green-600"> Dashboard</h1>
            <p className="text-sm text-gray-600 hidden md:block">Real-time monitoring and control</p>
          </div>
        </div>

        {/* RIGHT SIDE - Search, notifications, admin */}
        <div className="flex items-center gap-4">

          {/* SEARCH - Desktop only */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              value={searchText}
              onChange={handleSearch}
              type="text"
              placeholder="Search sensors, logs, chambers..."
              className="pl-10 pr-4 py-2 w-64 lg:w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* NOTIFICATIONS DROPDOWN */}
          <div className="relative">
            <button 
              onClick={() => setNotificationDropdown(!notificationDropdown)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs bg-red-500 text-white rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION DROPDOWN MENU */}
            {notificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-sm font-medium text-red-600">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="px-4 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading notifications...</p>
                    </div>
                  ) : notifications && notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                            notification.severity === 'critical' ? 'bg-red-500' :
                            notification.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(notification.severity)}`}>
                                {notification.severity}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600">No new notifications</p>
                      <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                    </div>
                  )}
                </div>

                {/* VIEW ALL BUTTON */}
                <div className="px-4 py-3 border-t border-gray-200">
                  <button
                    onClick={handleNotificationsClick}
                    className="w-full flex items-center justify-center gap-2 py-2 text-green-600 hover:text-green-700 font-medium"
                  >
                    View all notifications
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ADMIN PROFILE */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="hidden lg:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {admin?.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-500">
                {admin?.role || "Farm Manager"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH - Mobile version */}
      <div className="mt-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            value={searchText}
            onChange={handleSearch}
            type="text"
            placeholder="Search sensors, logs, chambers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {notificationDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setNotificationDropdown(false)}
        />
      )}
    </header>
  );
}