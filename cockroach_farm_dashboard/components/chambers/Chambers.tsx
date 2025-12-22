'use client';

import { Grid, Thermometer, Droplet, Wind, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useFirebaseList } from '@/lib/firebase';

interface Chamber {
  id: string;
  name: string;
  temperature?: number;
  humidity?: number;
  co2?: number;
  ammonia?: number;
  status: 'normal' | 'warning' | 'critical';
  active: boolean;
}

export default function ChambersPage() {
  const { data: chambers, loading } = useFirebaseList<Chamber>('chambers', {
    orderBy: 'name',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'ring-2 ring-red-500 bg-red-50';
      case 'warning':
        return 'ring-2 ring-orange-500 bg-orange-50';
      default:
        return 'ring-2 ring-green-500 bg-green-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chambers Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {chambers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-lg">No chambers configured yet</div>
            </div>
          ) : (
            chambers.map((chamber) => (
              <Link
                key={chamber.id}
                href={`/chambers/${chamber.id}`}
                className="block transform hover:scale-105 transition-all duration-300"
              >
                <div
                  className={`
                    relative bg-white rounded-2xl shadow-lg overflow-hidden
                    border border-gray-200 hover:shadow-2xl
                    ${getStatusColor(chamber.status)}
                    ${!chamber.active ? 'opacity-70 grayscale' : ''}
                  `}
                >
                  {/* Status Indicator Top Right */}
                  <div className="absolute top-4 right-4 z-10">
                    {getStatusIcon(chamber.status)}
                  </div>

                  {/* Chamber Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {chamber.name || `Chamber ${chamber.id}`}
                      </h3>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          chamber.active ? 'bg-green-500' : 'bg-gray-400'
                        } animate-pulse`}
                      />
                    </div>

                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        chamber.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {chamber.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="bg-gray-50 px-6 py-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Thermometer className="w-4 h-4" />
                        <span className="text-sm">Temperature</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {chamber.temperature !== undefined ? `${chamber.temperature.toFixed(1)}°C` : '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Droplet className="w-4 h-4" />
                        <span className="text-sm">Humidity</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {chamber.humidity !== undefined ? `${chamber.humidity}%` : '—'}
                      </span>
                    </div>

                    {chamber.co2 !== undefined && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Wind className="w-4 h-4" />
                          <span className="text-sm">CO₂</span>
                        </div>
                        <span className="font-semibold text-gray-900">{chamber.co2} ppm</span>
                      </div>
                    )}

                    {chamber.ammonia !== undefined && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm">Ammonia</span>
                        </div>
                        <span className="font-semibold text-gray-900">{chamber.ammonia} ppm</span>
                      
                    </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 bg-gray-100 text-center">
                    <span className="text-sm text-gray-600">Tap to view details</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}