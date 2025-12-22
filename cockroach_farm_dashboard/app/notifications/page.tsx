'use client';

import FiltersBar from './components/FiltersBar';
import HeaderSection from './components/HeaderSection';
import NotificationList from './components/NotificationList';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <HeaderSection />
        <FiltersBar onFilterChange={function (filter: 'warning' | 'critical' | 'info' | 'all' | 'unread'): void {
                  throw new Error('Function not implemented.');
              } } onSearchChange={function (term: string): void {
                  throw new Error('Function not implemented.');
              } } selectedCount={0} onMarkSelectedAsRead={function (): void {
                  throw new Error('Function not implemented.');
              } } />
        <NotificationList />
      </div>
    </div>
  );
}