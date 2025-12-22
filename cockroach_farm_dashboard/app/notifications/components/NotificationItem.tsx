import { AlertTriangle, Bell, Check, X } from 'lucide-react';
import { updateFirebaseData } from '@/lib/firebase';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  timestamp: number;
  severity: 'critical' | 'warning' | 'info';
  chamber?: string;
  sensor?: string;
  value?: number;
  unit?: string;
}

interface NotificationItemProps {
  notification: Notification;
  isSelected: boolean;
  isHighlighted: boolean;
  onToggleSelect: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationItem({
  notification,
  isSelected,
  isHighlighted,
  onToggleSelect,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
}: NotificationItemProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info':
      default: return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const borderColor = notification.severity === 'critical' ? 'border-l-red-500' :
                     notification.severity === 'warning' ? 'border-l-yellow-500' :
                     'border-l-blue-500';

  return (
    <div
      id={`notification-${notification.id}`}
      className={`bg-gry rounded-lg shadow p-6 border-l-4 transition-all hover:shadow-md ${
        isHighlighted ? 'ring-2 ring-blue-500' : ''
      } ${borderColor} ${!notification.isRead ? 'bg-blue-50' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(notification.id)}
            className="mt-1"
          />
          <div className="flex-shrink-0">
            {getSeverityIcon(notification.severity)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {notification.message}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>{formatTime(notification.timestamp)}</span>
                  <span>{formatDate(notification.timestamp)}</span>
                  {notification.chamber && (
                    <span className="px-2 py-1 bg-gray-100 rounded-md">{notification.chamber}</span>
                  )}
                  {notification.sensor && (
                    <span className="px-2 py-1 bg-gray-100 rounded-md">{notification.sensor}</span>
                  )}
                </div>
                {notification.value !== undefined && (
                  <div className="text-sm text-gray-700 mb-3">
                    <span className="font-medium">Current Value: </span>
                    {notification.value} {notification.unit}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getSeverityColor(notification.severity)}`}>
                  {notification.severity}
                </span>
                {!notification.isRead && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    New
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {notification.isRead ? (
            <button
              onClick={() => onMarkAsUnread(notification.id)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Mark as unread"
            >
              <Bell className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="p-2 text-green-600 hover:text-green-800 transition-colors"
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="p-2 text-red-600 hover:text-red-800 transition-colors"
            title="Delete notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}