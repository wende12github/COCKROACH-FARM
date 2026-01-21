'use client';

import { useFirebaseValue } from '@/lib/firebase';
import { Home, Settings, Bell, HelpCircle, ExternalLink, Github, Globe, Mail, Phone, Thermometer, Droplets, Building2 } from 'lucide-react';
import Link from 'next/link';

interface SensorData {
  temperature: number;
  humidity: number;
  lastUpdated: number;
}

export default function Footer() {
  // Fetch sensor data for quick stats
  const sensorData = useFirebaseValue<SensorData>('/sensor');
  const chambersData = useFirebaseValue<any>('/chambers');

  // Calculate active chambers
  const activeChambers = chambersData ? Object.keys(chambersData).filter(key => {
    const chamber = chambersData[key];
    return chamber && chamber.status !== undefined;
  }).length : 0;

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
      {/* Environmental Quick Stats */}
      <div className="bg-gradient-to-r from-gry-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-green-100">Avg Temperature</p>
                  <p className="font-bold text-lg">{sensorData?.temperature?.toFixed(1) || '--'}°C</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-green-100">Avg Humidity</p>
                  <p className="font-bold text-lg">{sensorData?.humidity?.toFixed(1) || '--'}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-green-100">Active Chambers</p>
                  <p className="font-bold text-lg">{activeChambers}</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-green-100">
              Live from sensors
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Quick Links */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🪳</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Cockroach Farming for Chechen Feed</h3>
                <p className="text-xs text-gray-400">Farming System</p>
              </div>
            </div>
            <nav className="flex flex-col gap-2 mt-4">
              <Link href="/" className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors py-1">
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/chambers" className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors py-1">
                <Building2 className="w-4 h-4" />
                Chambers
              </Link>
              <Link href="/settings" className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors py-1">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <Link href="/notifications" className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors py-1">
                <Bell className="w-4 h-4" />
                Notifications
              </Link>
              <Link href="/help" className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors py-1">
                <HelpCircle className="w-4 h-4" />
                Help
              </Link>
            </nav>
          </div>

          {/* Contact / Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Contact / Support
            </h3>
            <div className="flex flex-col gap-4">
              <a href="mailto:support@cockroach.farm" className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors group">
                <div className="p-2 bg-gray-700 group-hover:bg-gray-600 rounded-lg transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email us</p>
                  <p className="text-sm">support@cockroach.farm</p>
                </div>
              </a>
              <a href="tel:+251-9XX-XXX-XXXX" className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors group">
                <div className="p-2 bg-gray-700 group-hover:bg-gray-600 rounded-lg transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Call / WhatsApp</p>
                  <p className="text-sm">+251-9XX-XXX-XXXX</p>
                </div>
              </a>
            </div>
          </div>

          {/* Social / Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Social / Links
            </h3>
            <div className="flex flex-col gap-3">
              <a href="https://github.com/wende12github/COCKROACH-FARM" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors group">
                <div className="p-2 bg-gray-700 group-hover:bg-gray-600 rounded-lg transition-colors">
                  <Github className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1">
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </div>
              </a>
              <a href="https://cockroach.farm" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors group">
                <div className="p-2 bg-gray-700 group-hover:bg-gray-600 rounded-lg transition-colors">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1">
                  <span>Company Website</span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </div>
              </a>
            </div>
          </div>

          {/* Privacy & Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Privacy & Legal
            </h3>
            <nav className="flex flex-col gap-3">
              <Link href="/privacy" className="text-gray-300 hover:text-green-400 transition-colors flex items-center gap-2 py-1">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-green-400 transition-colors flex items-center gap-2 py-1">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-300 hover:text-green-400 transition-colors flex items-center gap-2 py-1">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                Cookie Policy
              </Link>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>© 2025–2026 Smart Cockroach Farming for Chechen Feed. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                System Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

