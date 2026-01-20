import { AlertTriangle, Thermometer, Droplet, Cloud, Wind, Bell, ChevronRight } from 'lucide-react';
import { useFirebaseValue } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface AlertData {
  active: boolean;
  message: string;
  timestamp: number;
}

interface Alert {
  id: string;
  icon: string;
  message: string;
  timestamp: number;
  severity: 'critical' | 'warning' | 'info';
  isRead: boolean;
  chamber?: string;
  sensor?: string;
  value?: number;
  unit?: string;
}

export default function Alerts() {
  const router = useRouter();

  // Fetch current alert status from Firebase using useFirebaseValue
  const alertData = useFirebaseValue<AlertData>('/alert');

  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (alertData && alertData.active) {
      // Create an alert from the active alert data
      let icon = 'alert';
      let severity: 'critical' | 'warning' | 'info' = 'critical';
      let sensor: string | undefined;
      let value: number | undefined;
      let unit: string | undefined;

      const message = alertData.message.toLowerCase();
      if (message.includes('cold') || message.includes('hot') || message.includes('heat') || message.includes('cool')) {
        icon = 'thermometer';
        sensor = 'temperature';
        unit = '°C';
      } else if (message.includes('dry') || message.includes('humid')) {
        icon = 'droplet';
        sensor = 'humidity';
        unit = '%';
      }

      if (message.includes('low') || message.includes('dry') || message.includes('cold')) {
        severity = 'warning';
      }

      setAlerts([{
        id: '1',
        icon,
        message: alertData.message,
        timestamp: alertData.timestamp,
        severity,
        isRead: false,
        sensor,
        value,
        unit
      }]);
    } else {
      // Default sample alerts if no active alert
      setAlerts([
        {
          id: '1',
          icon: 'thermometer',
          message: 'Overheating Warning: Chamber 2 temperature reached 32.5°C',
          timestamp: Date.now() - 120000,
          severity: 'critical',
          isRead: false,
          chamber: 'Chamber 2',
          sensor: 'temperature',
          value: 32.5,
          unit: '°C'
        },
        {
          id: '2',
          icon: 'droplet',
          message: 'Low Humidity Alert: Chamber 1 humidity dropped to 45%',
          timestamp: Date.now() - 900000,
          severity: 'warning',
          isRead: false,
          chamber: 'Chamber 1',
          sensor: 'humidity',
          value: 45,
          unit: '%'
        },
        {
          id: '3',
          icon: 'cloud',
          message: 'High CO₂ Notification: CO₂ levels exceeded 1200 ppm',
          timestamp: Date.now() - 3600000,
          severity: 'warning',
          isRead: true,
          sensor: 'co2',
          value: 1200,
          unit: 'ppm'
        }
      ]);
    }
  }, [alertData]);

  const getAlertIcon = (iconName: string) => {
    switch (iconName) {
      case 'thermometer': return <Thermometer className="w-5 h-5" />;
      case 'droplet': return <Droplet className="w-5 h-5" />;
      case 'cloud': return <Cloud className="w-5 h-5" />;
      case 'wind': return <Wind className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
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

  const handleViewAll = () => {
    router.push('/notifications');
  };

  const handleAlertClick = (alertId: string) => {
    router.push(`/notifications?alert=${alertId}`);
  };

  // No loading or error states for useFirebaseValue

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <AlertTriangle className="mr-3 text-yellow-500 w-6 h-6" />
          <h3 className="text-lg font-semibold text-gray-800">Alerts & Notifications</h3>
          <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
            {alerts.filter(a => !a.isRead).length} new
          </span>
        </div>
        <button 
          onClick={handleViewAll}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View all
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Alerts List */}
      <ul className="space-y-3">
        {alerts.map((alert) => (
          <li 
            key={alert.id}
            onClick={() => handleAlertClick(alert.id)}
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:translate-y-[-1px] ${getAlertColor(alert.severity)} ${
              !alert.isRead ? 'ring-1 ring-red-300' : ''
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className={`p-2 rounded-lg ${
                  alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                  alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {getAlertIcon(alert.icon)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{alert.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span>{formatTime(alert.timestamp)}</span>
                      {alert.chamber && (
                        <>
                          <span>•</span>
                          <span className="px-2 py-1 bg-gray-100 rounded-md">
                            {alert.chamber}
                          </span>
                        </>
                      )}
                      {!alert.isRead && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                </div>
                
                {alert.value !== undefined && (
                  <div className="mt-3 text-sm">
                    <span className="text-gray-600">Current: </span>
                    <span className="font-medium">{alert.value}{alert.unit}</span>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Empty State */}
      {alerts.length === 0 && (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No alerts at the moment</p>
          <p className="text-sm text-gray-400 mt-1">All systems are operating normally</p>
        </div>
      )}
    </div>
  );
}