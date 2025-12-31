import { Fan, ThermometerSun, Droplet, Wind } from 'lucide-react';
import { useFirebaseValue } from '@/lib/firebase';
import { database } from '@/lib/firebase';
import { ref, set } from 'firebase/database';
import { useState } from 'react';

interface Control {
  icon: React.ReactNode;
  label: string;
  path: string;
  color: string;
  statusPath: String;
}

export default function DeviceControls() {
  const autoMode = useFirebaseValue<boolean>("settings/autoMode");

  const controls: Control[] = [
    {
      icon: <Fan className="w-8 h-8" />, label: 'Fan', path: '/manual/fan', color: 'text-blue-600',
      statusPath: "status/fan"
    },
    {
      icon: <ThermometerSun className="w-8 h-8" />, label: 'Heater', path: '/manual/heater', color: 'text-red-600',
      statusPath: "status/heater"
    },
    {
      icon: <Droplet className="w-8 h-8" />, label: 'Humidifier', path: '/manual/humidifier', color: 'text-cyan-600',
      statusPath: "status/humidifier"
    },
  ];

  // Local loading state to prevent rapid toggles
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggle = async (path: string, currentValue: boolean) => {
    const fullPath = path;
    setUpdating(fullPath);

    try {
      await set(ref(database, fullPath), !currentValue);
      console.log(`Toggled ${path} to ${!currentValue}`);
    } catch (error) {
      console.error("Failed to update Firebase:", error);
      alert("Failed to control device. Check connection or permissions.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      {controls.map((control) => {
        const isOn = useFirebaseValue<boolean>(control.path) ?? false;
        const isLoading = updating === control.path;

        return (
          <div
            key={control.path}
            className={`
              bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center hover:scale-105
              hover:shadow-xl transition-all duration-300 cursor-pointer
              border-2 ${isOn ? 'border-green-400 bg-green-50' : 'border-gray-200'}
              ${isLoading ? 'opacity-70' : ''}
            `}
            onClick={() => !isLoading && handleToggle(control.path, isOn)}
          >
            {/* Icon with dynamic color when ON */}
            <div className={`p-4 rounded-full bg-gray-100 ${isOn ? control.color : 'text-gray-500'}`}>
              {control.icon}
            </div>

            <h3 className="font-semibold text-lg text-gray-800">{control.label}</h3>

            {/* STATUS */}
            <p className="text-xs text-gray-500 mt-1">
              {autoMode ? "AUTO MODE" : "MANUAL MODE"}
            </p>

            {/* Custom Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isOn}
                onChange={(e) => {
                  e.stopPropagation(); // Prevent double trigger
                  handleToggle(control.path, isOn);
                }}
                className="sr-only peer"
                disabled={isLoading}
              />
              <div
                className={`
                  w-14 h-8 bg-gray-300 rounded-full peer
                  peer-checked:bg-green-600 peer-focus:ring-4 peer-focus:ring-green-300
                  transition-colors duration-300
                  after:content-[''] after:absolute after:top-1 after:left-1
                  after:bg-white after:rounded-full after:h-6 after:w-6
                  after:transition-all after:duration-300
                  peer-checked:after:translate-x-6
                  ${isLoading ? 'opacity-50' : ''}
                `}
              ></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {isLoading ? '...' : isOn ? 'ON' : 'OFF'}
              </span>
            </label>

            {/* Auto/Manual indicator (advanced feature) */}
            
            {autoMode && (
              <p className="text-xs text-red-500 mt-2">
                {isOn ? 'Active' : 'Inactive'}
              </p>
            )}

          </div>
        );
      })}
    </>
  );
}