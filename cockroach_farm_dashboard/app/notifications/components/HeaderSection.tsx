import { Bell } from 'lucide-react';
import { useFirebaseList } from '@/lib/firebase';

interface Notification {
  id: string;
  isRead: boolean;
}

export default function HeaderSection() {
  const { data: notifications = [] } = useFirebaseList<Notification>('alerts');
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-700">Notifications</h1>
          <p className="text-gray-600 mt-2">
            Stay updated with system alerts and notifications
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
            {unreadCount} unread
          </span>
        </div>
      </div>
    </div>
  );
}