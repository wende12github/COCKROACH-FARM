'use client'

import { useEffect, useState, useMemo } from 'react';
import { useFirebaseList } from "@/lib/firebase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface EnvironmentalData {
  id: string;
  value: number;
  timestamp: number;
}

interface ChartData {
  name: string;
  temperature: number;
  humidity: number;
}

interface EnvironmentalStats {
  currentTemp: number;
  tempChange: number;
  currentHum: number;
  humChange: number;
}

interface WeeklySummary {
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  avgHum: number;
  minHum: number;
  maxHum: number;
  totalReadings: number;
}

export const PopulationAnalytics = () => {
  // Get temperature and humidity data from Firebase
  const { data: tempData, loading: tempLoading } = useFirebaseList<EnvironmentalData>("logs/temperature", {
    orderBy: "timestamp",
    limit: 500
  });

  const { data: humData, loading: humLoading } = useFirebaseList<EnvironmentalData>("logs/humidity", {
    orderBy: "timestamp",
    limit: 500
  });

  const [envData, setEnvData] = useState<ChartData[]>([]);
  const [environmentalStats, setEnvironmentalStats] = useState<EnvironmentalStats>({
    currentTemp: 0,
    tempChange: 0,
    currentHum: 0,
    humChange: 0
  });
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary>({
    avgTemp: 0,
    minTemp: 0,
    maxTemp: 0,
    avgHum: 0,
    minHum: 0,
    maxHum: 0,
    totalReadings: 0
  });
  const [mounted, setMounted] = useState(false);

  // Set mounted state to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || tempData.length === 0 || humData.length === 0) return;

    // Process temperature and humidity data
    const combinedData = tempData.map(temp => {
      const matchingHum = humData.find(hum => hum.timestamp === temp.timestamp);
      return {
        timestamp: temp.timestamp,
        temperature: temp.value,
        humidity: matchingHum ? matchingHum.value : null
      };
    }).filter(item => item.humidity !== null).sort((a, b) => a.timestamp - b.timestamp);

    // Get current time (client-side only)
    const now = Date.now();

    // Take last 24 hours of data
    const last24Hours = combinedData.filter(item =>
      item.timestamp > now - 24 * 60 * 60 * 1000
    );

    // Take last 7 days of data for weekly summary
    const last7Days = combinedData.filter(item =>
      item.timestamp > now - 7 * 24 * 60 * 60 * 1000
    );

    // Process for chart display
    const chartData = last24Hours.slice(-20).map((item) => ({
      name: new Date(item.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      temperature: parseFloat(item.temperature.toFixed(1)),
      humidity: parseFloat(item.humidity!.toFixed(1))
    }));

    setEnvData(chartData);

    // Calculate stats
    if (last24Hours.length > 1) {
      const latest = last24Hours[last24Hours.length - 1];
      const previous = last24Hours[last24Hours.length - 2];

      setEnvironmentalStats({
        currentTemp: parseFloat(latest.temperature.toFixed(1)),
        tempChange: parseFloat((latest.temperature - previous.temperature).toFixed(1)),
        currentHum: parseFloat(latest.humidity!.toFixed(1)),
        humChange: parseFloat((latest.humidity! - previous.humidity!).toFixed(1))
      });
    }

    // Calculate weekly summary
    if (last7Days.length > 0) {
      const temps = last7Days.map(d => d.temperature);
      const hums = last7Days.map(d => d.humidity!);

      setWeeklySummary({
        avgTemp: parseFloat((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)),
        minTemp: parseFloat(Math.min(...temps).toFixed(1)),
        maxTemp: parseFloat(Math.max(...temps).toFixed(1)),
        avgHum: parseFloat((hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1)),
        minHum: parseFloat(Math.min(...hums).toFixed(1)),
        maxHum: parseFloat(Math.max(...hums).toFixed(1)),
        totalReadings: last7Days.length
      });
    }
  }, [tempData, humData, mounted]);

  if (!mounted) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 h-full">
        <h2 className="text-lg font-semibold text-green-600 mb-6">Environmental Analytics</h2>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-72 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
      <h2 className="text-lg font-semibold text-green-600 mb-6">Environmental Analytics</h2>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-800">{environmentalStats.currentTemp}°C</p>
          <p className="text-sm text-gray-500 mt-1">Current Temperature</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className={`text-3xl font-bold ${environmentalStats.tempChange >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {environmentalStats.tempChange >= 0 ? '+' : ''}{environmentalStats.tempChange}°C
          </p>
          <p className="text-sm text-gray-500 mt-1">Temperature Change</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-800">{environmentalStats.currentHum}%</p>
          <p className="text-sm text-gray-500 mt-1">Current Humidity</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className={`text-3xl font-bold ${environmentalStats.humChange >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {environmentalStats.humChange >= 0 ? '+' : ''}{environmentalStats.humChange}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Humidity Change</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={envData}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              domain={['dataMin - 2', 'dataMax + 2']}
              label={{
                value: 'Temperature (°C) / Humidity (%)',
                angle: -90,
                position: 'insideLeft',
                fontSize: 12
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value, name) => {
                if (name === 'temperature') return [`${value}°C`, 'Temperature'];
                if (name === 'humidity') return [`${value}%`, 'Humidity'];
                return [value, name];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="temperature"
              name="Temperature"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="humidity"
              name="Humidity"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Summary Section */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gry mb-6 text-center">
          Weekly Summary (Last 7 Days)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Temperature Summary Card */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-red-800 dark:text-red">Temperature</h4>
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">°C</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-red-700 dark:text-red-300">Average:</span>
                <span className="font-bold text-red-900 dark:text-red-100">
                  {weeklySummary.avgTemp.toFixed(1)}°C
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700 dark:text-red-300">Minimum:</span>
                <span className="font-bold text-red-900 dark:text-red-100">
                  {weeklySummary.minTemp.toFixed(1)}°C
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700 dark:text-red-300">Maximum:</span>
                <span className="font-bold text-red-900 dark:text-red-100">
                  {weeklySummary.maxTemp.toFixed(1)}°C
                </span>
              </div>
            </div>
          </div>

          {/* Humidity Summary Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue">Humidity</h4>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Average:</span>
                <span className="font-bold text-blue-900 dark:text-blue-100">
                  {weeklySummary.avgHum.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Minimum:</span>
                <span className="font-bold text-blue-900 dark:text-blue-100">
                  {weeklySummary.minHum.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Maximum:</span>
                <span className="font-bold text-blue-900 dark:text-blue-100">
                  {weeklySummary.maxHum.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Total Readings Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-600">Data Points</h4>
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">#</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {weeklySummary.totalReadings}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-500">
                Total Readings
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
