'use client';

import {
  Home,
  Grid,
  FileText,
  Settings,
  Users,
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  HelpCircle,
  Database,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth, logout } from '@/lib/firebase'; // ← Import useAuth & logout
import { useRouter } from 'next/navigation';

type SectionKey = 'monitoring' | 'management' | 'system';
type SidebarProps = {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
};

const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    monitoring: true,
    management: false,
    system: false,
  });

  const toggleSection = (section: SectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Real user data from Firebase Auth
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email || 'user@farm.com';
  const role = user?.email === 'admin@smartroach.com' ? 'Admin' :
               user?.email === 'manager@smartroach.com' ? 'Farm Manager' :
               'Operator';

  const avatarText = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Hardcoded stats (or fetch from /system if needed)
  const activeChambers = 3;
  const totalChambers = 4;
  const chamberPercentage = (activeChambers / totalChambers) * 100;

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems: Record<SectionKey, { title: string; items: { icon: React.ReactNode; label: string; href: string }[] }> = {
    monitoring: {
      title: 'MONITORING',
      items: [
        { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/' },
        { icon: <Grid className="w-5 h-5" />, label: 'Chambers', href: '/chambers' },
        { icon: <Bell className="w-5 h-5" />, label: 'Notifications', href: '/notifications' },
      ],
    },
    management: {
      title: 'MANAGEMENT',
      items: [
        { icon: <Database className="w-5 h-5" />, label: 'Population', href: '/population' },
        { icon: <FileText className="w-5 h-5" />, label: 'Reports & Logs', href: '/reports' },
      ],
    },
    system: {
      title: 'SYSTEM',
      items: [
        { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/settings' },
        { icon: <Users className="w-5 h-5" />, label: 'User Management', href: '/users' },
      ],
    },
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <aside className="w-64 bg-gray-950 text-white h-screen fixed left-0 top-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="mt-4 text-sm">Loading...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-950 text-gray-900 dark:text-white
        flex flex-col shadow-2xl overflow-y-auto
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0 lg:z-auto
      `}
      >
      <div className="p-4 lg:hidden flex justify-end">
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🪳</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Cockroach Farm</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs">Farm Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        {Object.entries(menuItems).map(([key, section]) => {
          const sectionKey = key as SectionKey;
          const isOpen = openSections[sectionKey];

          return (
            <div key={sectionKey} className="mb-4">
              <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/50"
              >
                <span>{section.title}</span>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="mt-1 space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium
                          transition-all duration-200 group relative
                          ${isActive
                            ? 'bg-gradient-to-r from-green-900/50 to-transparent dark:from-green-900/50 dark:to-transparent text-green-400 border-l-4 border-green-500 shadow-md'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-white'
                          }
                        `}
                      >
                        <div className={isActive ? 'text-green-400' : 'text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'}>
                          {item.icon}
                        </div>
                        <span>{item.label}</span>
                        {isActive && (
                          <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-green-400/50 shadow-lg" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-5">
        <div className="space-y-5">
          {/* Active Chambers */}
          <div className="bg-gray-100 dark:bg-gray-900/70 backdrop-blur rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active Chambers</span>
              <span className="text-green-400 text-sm font-bold">{activeChambers}/{totalChambers}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
                style={{ width: `${chamberPercentage}%` }}
              />
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm">
              {avatarText}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-800/70 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-all hover:shadow-md">
              <HelpCircle className="w-4 h-4" />
              Help
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-100 dark:bg-red-950/50 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-all hover:shadow-md border border-red-200 dark:border-red-900/30"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;