'use client'

import { useEffect, useState, useMemo } from 'react';
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

// --- Types ---
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
}

export const SensorDataAnalytics = () => {
  const [mockData, setMockData] = useState<ChartData[]>([]);
  const [stats, setStats] = useState<Stats>({
    currTemp: 23.5,
    currHum: 65.0,
    avgTemp: 23.2,
    avgHum: 64.8,
    maxTemp: 24.5
  });

  // Initialize mock data
  useEffect(() => {
    const generateInitialData = () => {
      const dataPoints = 50;
      const timeInterval = 60000;
      const now = Date.now();
      const initialData: ChartData[] = [];
      
      let temperature = 22.5;
      let humidity = 65.0;
      
      for (let i = 0; i < dataPoints; i++) {
        const timestamp = now - (dataPoints - i - 1) * timeInterval;
        const date = new Date(timestamp);
        
        temperature += (Math.random() - 0.5) * 0.8;
        humidity += (Math.random() - 0.5) * 1.2;
        
        temperature = Math.min(Math.max(temperature, 20.0), 26.0);
        humidity = Math.min(Math.max(humidity, 55.0), 75.0);
        
        initialData.push({
          timestamp,
          label: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          temperature: parseFloat(temperature.toFixed(1)),
          humidity: parseFloat(humidity.toFixed(1))
        });
      }
      
      setMockData(initialData);
      calculateStats(initialData);
    };

    generateInitialData();
  }, []);

  // Update data periodically (optional - remove if you want completely static data)
  useEffect(() => {
    const interval = setInterval(() => {
      setMockData(prev => {
        const now = Date.now();
        const newData = [...prev.slice(1)]; // Remove oldest point
        
        // Add new data point with slight variation
        const lastTemp = prev[prev.length - 1].temperature || 23.0;
        const lastHum = prev[prev.length - 1].humidity || 65.0;
        
        const newTemp = Math.min(Math.max(lastTemp + (Math.random() - 0.5) * 0.5, 20.0), 26.0);
        const newHum = Math.min(Math.max(lastHum + (Math.random() - 0.5) * 1.0, 55.0), 75.0);
        
        newData.push({
          timestamp: now,
          label: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          temperature: parseFloat(newTemp.toFixed(1)),
          humidity: parseFloat(newHum.toFixed(1))
        });
        
        calculateStats(newData);
        return newData;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const calculateStats = (data: ChartData[]) => {
    const validTemps = data.filter(d => d.temperature !== null).map(d => d.temperature as number);
    const validHums = data.filter(d => d.humidity !== null).map(d => d.humidity as number);
    
    setStats({
      currTemp: validTemps.length > 0 ? validTemps[validTemps.length - 1] : 0,
      currHum: validHums.length > 0 ? validHums[validHums.length - 1] : 0,
      avgTemp: validTemps.length > 0 ? validTemps.reduce((a, b) => a + b, 0) / validTemps.length : 0,
      avgHum: validHums.length > 0 ? validHums.reduce((a, b) => a + b, 0) / validHums.length : 0,
      maxTemp: validTemps.length > 0 ? Math.max(...validTemps) : 0,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 h-full transition-all duration-300 hover:shadow-2xl">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <h2 className="text-xl font-bold text-gray-800">Live Environmental Data</h2>
          </div>
          <p className="text-sm text-gray-500 ml-5">Mock Data Simulation</p>
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
      <div className="h-[350px] w-full mb-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="label"
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis
              yAxisId="left"
              stroke="#ef4444"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit="°C"
              domain={['auto', 'auto']}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit="%"
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