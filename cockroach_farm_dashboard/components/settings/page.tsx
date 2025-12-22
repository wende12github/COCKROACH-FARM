'use client';

import { Settings, Thermometer, Droplet, Cloud, AlertTriangle, Save } from 'lucide-react';
import { useState } from 'react';
import { useFirebaseValueEnhanced } from '@/lib/firebase';
import { updateFirebaseData } from '@/lib/firebase';

interface Thresholds {
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  co2Max: number;
  ammoniaMax: number;
}

const defaultThresholds: Thresholds = {
  tempMin: 21,
  tempMax: 29,
  humidityMin: 60,
  humidityMax: 80,
  co2Max: 1000,
  ammoniaMax: 20,
};

export default function SettingsPage() {
  const { data: thresholds, loading } = useFirebaseValueEnhanced<Thresholds>(
    '/settings/thresholds',
    defaultThresholds
  );

  const [formData, setFormData] = useState<Thresholds>(thresholds || defaultThresholds);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof Thresholds, value: number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setSaved(false); // Reset saved state on change
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateFirebaseData('/settings/thresholds', formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000); // Auto-hide success
    } catch (error) {
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const settings = [
    {
      icon: <Thermometer className="w-5 h-5" />,
      label: 'Temperature',
      unit: '°C',
      fields: [
        { key: 'tempMin' as keyof Thresholds, label: 'Minimum' },
        { key: 'tempMax' as keyof Thresholds, label: 'Maximum' },
      ],
    },
    {
      icon: <Droplet className="w-5 h-5" />,
      label: 'Humidity',
      unit: '%',
      fields: [
        { key: 'humidityMin' as keyof Thresholds, label: 'Minimum' },
        { key: 'humidityMax' as keyof Thresholds, label: 'Maximum' },
      ],
    },
    {
      icon: <Cloud className="w-5 h-5" />,
      label: 'CO₂ Level',
      unit: 'ppm',
      fields: [{ key: 'co2Max' as keyof Thresholds, label: 'Maximum' }],
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'Ammonia Level',
      unit: 'ppm',
      fields: [{ key: 'ammoniaMax' as keyof Thresholds, label: 'Maximum' }],
    },
  ];

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
          <div className="grid gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-12 max-w-4xl mx-auto">
      {/* Settings Cards */}
      <div className="grid gap-8">
        {settings.map((setting) => (
          <div
            key={setting.label}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl text-green-600">
                {setting.icon}
              </div>
              <h2 className="text-xl font-semibold text-gray-800">{setting.label}</h2>
              <span className="text-sm text-gray-500 ml-auto">{setting.unit}</span>
            </div>

            <div className={`grid gap-6 ${setting.fields.length === 1 ? 'grid-cols-1 max-w-md' : 'grid-cols-1 md:grid-cols-2'}`}>
              {setting.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, Number(e.target.value))}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    min="0"
                    step="0.5"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`
            flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white text-lg
            transition-all duration-300 shadow-lg
            ${saving || saved
              ? 'bg-green-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 hover:shadow-xl transform hover:scale-105'
            }
          `}
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}