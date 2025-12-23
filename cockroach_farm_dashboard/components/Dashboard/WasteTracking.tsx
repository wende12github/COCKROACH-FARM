import { useEffect, useState } from 'react';
import { useFirebaseValue } from "@/lib/firebase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Trash2, TrendingUp, TrendingDown, Activity } from "lucide-react";

interface WasteData {
  day: string;
  wasteInput: number;
  efficiency: number;
}

interface FirebaseWasteData {
  [key: string]: {
    wasteInput: number;
    efficiency: number;
    timestamp: number;
  }
}

export const WasteIntake = () => {
  // Get waste data from Firebase
  const rawWasteData = useFirebaseValue<FirebaseWasteData>("waste/data") || {};
  
  const [weeklyData, setWeeklyData] = useState<WasteData[]>([
    { day: 'Mon', wasteInput: 150, efficiency: 82 },
    { day: 'Tue', wasteInput: 220, efficiency: 85 },
    { day: 'Wed', wasteInput: 180, efficiency: 83 },
    { day: 'Thu', wasteInput: 250, efficiency: 87 },
    { day: 'Fri', wasteInput: 300, efficiency: 88 },
    { day: 'Sat', wasteInput: 280, efficiency: 86 },
    { day: 'Sun', wasteInput: 200, efficiency: 84 },
  ]);

  const [summaryStats, setSummaryStats] = useState({
    dailyInput: 220,
    conversionEfficiency: 85,
    weeklyTotal: 1580,
    efficiencyTrend: 2.5,
    avgDaily: 225.7
  });

  useEffect(() => {
    // Process Firebase data if available
    if (Object.keys(rawWasteData).length > 0) {
      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      // Convert Firebase data to weekly format
      const processedData = daysOfWeek.map((day, index) => {
        const dayKey = `day${index + 1}`;
        const dayData = rawWasteData[dayKey] || rawWasteData[day.toLowerCase()];
        
        if (dayData) {
          return {
            day,
            wasteInput: dayData.wasteInput,
            efficiency: dayData.efficiency
          };
        }
        
        // Fallback to default data
        return weeklyData[index];
      });

      setWeeklyData(processedData);

      // Calculate summary statistics
      const totalWaste = processedData.reduce((sum, day) => sum + day.wasteInput, 0);
      const avgEfficiency = processedData.reduce((sum, day) => sum + day.efficiency, 0) / processedData.length;
      const today = processedData[new Date().getDay() - 1] || processedData[0];
      
      setSummaryStats({
        dailyInput: today.wasteInput,
        conversionEfficiency: Math.round(avgEfficiency),
        weeklyTotal: totalWaste,
        efficiencyTrend: 2.5, // This could be calculated from historical data
        avgDaily: Math.round(totalWaste / processedData.length)
      });
    }
  }, [rawWasteData]);

  // Custom colors for bars based on value
  const getBarColor = (value: number) => {
    if (value >= 250) return '#8b5cf6'; // Purple for high input
    if (value >= 200) return '#7c3aed'; // Darker purple
    if (value >= 150) return '#6d28d9'; // Even darker
    return '#5b21b6'; // Darkest purple
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
      <h2 className="text-lg font-semibold text-green-600 mb-6">Waste Intake Tracking</h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Daily Organic Waste</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{summaryStats.dailyInput}kg</p>
              <p className="text-sm text-gray-500 mt-1">Today's intake</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                summaryStats.dailyInput > summaryStats.avgDaily 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {summaryStats.dailyInput > summaryStats.avgDaily ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {summaryStats.dailyInput > summaryStats.avgDaily ? 'Above' : 'Below'} avg
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Conversion Efficiency</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{summaryStats.conversionEfficiency}%</p>
              <p className="text-sm text-gray-500 mt-1">This week average</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                ↑ {summaryStats.efficiencyTrend}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="h-72 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="#6b7280"
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              label={{ 
                value: 'Waste Input (kg)', 
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
                if (name === 'wasteInput') return [`${value}kg`, 'Waste Input'];
                if (name === 'efficiency') return [`${value}%`, 'Efficiency'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar 
              dataKey="wasteInput" 
              name="Daily Organic Waste Input" 
              radius={[4, 4, 0, 0]}
            >
              {weeklyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.wasteInput)} />
              ))}
            </Bar>
            <Bar 
              dataKey="efficiency" 
              name="Conversion Efficiency" 
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              yAxisId="right"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Summary */}
      <div className="bg-gray-50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-gray-700">Weekly Summary</h3>
            <p className="text-sm text-gray-500">Total waste processed this week</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">{summaryStats.weeklyTotal}kg</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600">Average Daily</p>
            <p className="text-lg font-semibold text-gray-800">{summaryStats.avgDaily}kg</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Peak Day</p>
            <p className="text-lg font-semibold text-gray-800">
              {Math.max(...weeklyData.map(d => d.wasteInput))}kg
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};