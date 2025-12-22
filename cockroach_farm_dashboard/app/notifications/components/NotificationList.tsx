'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useFirebaseList, updateFirebaseData } from '@/lib/firebase';
import NotificationItem from './NotificationItem';

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

export default function NotificationList() {
  const searchParams = useSearchParams();
  const alertId = searchParams.get('alert');

  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'warning' | 'info'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const { data: notifications = [], loading, error } = useFirebaseList<Notification>('alerts', {
    orderBy: 'timestamp',
    reverse: true
  });

  const markAsRead = async (id: string) => {
    await updateFirebaseData(`alerts/${id}`, { isRead: true });
  };

  const markAsUnread = async (id: string) => {
    await updateFirebaseData(`alerts/${id}`, { isRead: false });
  };

  const markSelectedAsRead = async () => {
    for (const id of selectedNotifications) {
      await markAsRead(id);
    }
    setSelectedNotifications([]);
  };

  const deleteNotification = async (id: string) => {
    console.log('Delete not implemented:', id);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.isRead) return false;
    if (filter === 'critical' && notification.severity !== 'critical') return false;
    if (filter === 'warning' && notification.severity !== 'warning') return false;
    if (filter === 'info' && notification.severity !== 'info') return false;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      return (
        notification.message.toLowerCase().includes(lower) ||
        notification.chamber?.toLowerCase().includes(lower) ||
        notification.sensor?.toLowerCase().includes(lower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || filteredNotifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications found</h3>
        <p className="text-gray-600">
          {searchTerm || filter !== 'all'
            ? 'Try adjusting your search or filter criteria.'
            : 'You\'re all caught up! No new notifications.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          isSelected={selectedNotifications.includes(notification.id)}
          isHighlighted={notification.id === alertId}
          onToggleSelect={(id) =>
            setSelectedNotifications(prev =>
              prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            )
          }
          onMarkAsRead={markAsRead}
          onMarkAsUnread={markAsUnread}
          onDelete={deleteNotification}
        />
      ))}
    </div>
  );
}