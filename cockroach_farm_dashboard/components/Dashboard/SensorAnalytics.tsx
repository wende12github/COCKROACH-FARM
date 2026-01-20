'use client'

import { useEffect, useState, useMemo } from 'react';
import { useFirebaseList, useFirebaseValue } from "@/lib/firebase"; // Ensure this points to your hooks file
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// --- Configuration ---
// Change these paths if your database uses "sensor/temperature" instead
const PATHS = {
  LOG_TEMP: 'logs/temperature',
  LOG_HUM: 'logs/humidity',
  CURR_TEMP: 'sensor/temperature',
  CURR_HUM: 'sensor/humidity'
};

// --- Types ---
interface DataPoint {
  id: string; // The firebase key (timestamp)
  value: number;
}

interface ChartData {
  timestamp: number;
  label: string;
  temperature: number | null;
  humidity: number | null;
}

interface Stats {
  currTemp: number;
  currHum: number;
  avgTemp: number;
  avgHum: number;
  maxTemp: number;
  minTemp: number;
  maxHum: number;
  minHum: number;
  tempRange: string;
  humRange: string;
}

export const SensorAnalytics = () => {
  // 1. Fetch Real-time Data
  // We limit to the last 50 points to keep the chart snappy
  const { data: tempList, loading: tempLoading } = useFirebaseList<DataPoint>(PATHS.LOG_TEMP, {
    limit: 30,
    orderBy: "$key"
  });

  const { data: humList, loading: humLoading } = useFirebaseList<DataPoint>(PATHS.LOG_HUM, {
    limit: 30,
    orderBy: "$key"
  });

  const [timeRange, setTimeRange] = useState('1h');

  // Fetch current sensor values
  const currTemp = useFirebaseValue<number>(PATHS.CURR_TEMP);
  const currHum = useFirebaseValue<number>(PATHS.CURR_HUM);

  // 2. Process & Merge Data
  // We use useMemo to avoid recalculating on every render, only when data changes
  const { chartData, stats } = useMemo(() => {
    if (tempLoading || humLoading) return { chartData: [], stats: null };

    // Create a Map for humidity for fast lookup
    const humMap = new Map(humList.map(item => [item.id, item.value]));

    // Merge streams based on Temperature timestamps
    const merged = tempList.map(t => {
      const humValue = humMap.get(t.id);
      const timestamp = parseInt(t.id); // Assuming key is timestamp
      const date = new Date(timestamp);

      return {
        timestamp: timestamp,
        // Format time as HH:MM:SS
        label: isNaN(date.getTime()) ? t.id : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temperature: Number(t.value),
        humidity: humValue !== undefined ? Number(humValue) : null
      };
    }).sort((a, b) => a.timestamp - b.timestamp);

    // Calculate Statistics
    const validTemps = merged.filter(d => d.temperature !== null).map(d => d.temperature as number);
    const validHums = merged.filter(d => d.humidity !== null).map(d => d.humidity as number);

    const statistics: Stats = {
      currTemp: currTemp !== null ? currTemp : (validTemps.length > 0 ? validTemps[validTemps.length - 1] : 0),
      currHum: currHum !== null ? currHum : (validHums.length > 0 ? validHums[validHums.length - 1] : 0),
      avgTemp: validTemps.length > 0 ? validTemps.reduce((a, b) => a + b, 0) / validTemps.length : 0,
      avgHum: validHums.length > 0 ? validHums.reduce((a, b) => a + b, 0) / validHums.length : 0,
      maxTemp: validTemps.length > 0 ? Math.max(...validTemps) : 0,
      minTemp: 0,
      maxHum: 0,
      minHum: 0,
      tempRange: "18°C - 33°C",
      humRange: "50.5% - 80.2%"
    };

    return { chartData: merged, stats: statistics };
  }, [tempList, humList, tempLoading, humLoading, currTemp, currHum]);

  // 3. Loading State
  if (!stats) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center bg-white rounded-xl shadow-lg border border-gray-100 animate-pulse">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-medium">Connecting to Sensors...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 h-full transition-all duration-300 hover:shadow-2xl">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <h2 className="text-xl font-bold text-gray-800">Live Environmental Data</h2>
          </div>
          <p className="text-sm text-gray-500 ml-5">Real-time sync from Firebase</p>
        </div>

        {/* Live Badges */}
        <div className="flex gap-4">
          <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-lg">
            <p className="text-xs text-red-600 font-bold uppercase">Temperature</p>
            <p className="text-2xl font-bold text-red-600">{stats.currTemp.toFixed(1)}°C</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg">
            <p className="text-xs text-blue-600 font-bold uppercase">Humidity</p>
            <p className="text-2xl font-bold text-blue-600">{stats.currHum.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-[350px] w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="label"
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
              tickFormatter={(value, index) => {
                if (timeRange === '24h' && index % 3 !== 0) return '';
                return value;
              }}
              label={{ 
                value: `Time (${timeRange})`, 
                position: 'insideBottom', 
                offset: -15,
                fontSize: 20,
                fill: '#6b7280'
              }}
            />
            <YAxis
              yAxisId="left"
              stroke="#ef4444"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit="°C"
              domain={['auto', 'auto']}
              label={{ 
                value: 'Temperature (°C)', 
                angle: -90, 
                position: 'insideLeft',
                offset: -10,
                fontSize: 20,
                fill: '#ef4444'
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit="%"
              label={{ 
                value: 'Humidity (%)', 
                angle: 90, 
                position: 'insideRight',
                offset: 1,
                fontSize: 20,
                fill: '#10b981'
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ color: '#374151', marginBottom: '0.5rem' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }}/>

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              name="Temperature"
              stroke="#ef4444"
              strokeWidth={2}
              animationDuration={1000}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="humidity"
              name="Humidity"
              stroke="#10b981"
              strokeWidth={2}
              animationDuration={1000}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Green Statistics Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center justify-between">
          <div>
            <p className="text-green-600 text-xs font-bold uppercase">Avg Temperature</p>
            <p className="text-xl font-bold text-gray-800">{stats.avgTemp.toFixed(1)}°C</p>
          </div>
          <div className="bg-white p-2 rounded-lg text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center justify-between">
          <div>
            <p className="text-green-600 text-xs font-bold uppercase">Avg Humidity</p>
            <p className="text-xl font-bold text-gray-800">{stats.avgHum.toFixed(1)}%</p>
          </div>
          <div className="bg-white p-2 rounded-lg text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center justify-between">
          <div>
            <p className="text-green-600 text-xs font-bold uppercase">Peak Temp</p>
            <p className="text-xl font-bold text-gray-800">{stats.maxTemp.toFixed(1)}°C</p>
          </div>
          <div className="bg-white p-2 rounded-lg text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};