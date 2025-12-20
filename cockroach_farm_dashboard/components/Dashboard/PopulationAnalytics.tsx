import { useEffect, useState } from 'react';
import { useFirebaseValue } from "@/lib/firebase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

interface PopulationData {
  name: string;
  count: number;
  growthRate: number;
  feedConsumption: number;
  timestamp: number;
}

interface FirebasePopulationData {
  [key: string]: {
    count: number;
    feedConsumption: number;
    timestamp: number;
  }
}

export const PopulationAnalytics = () => {
  // Get population data from Firebase
  const rawPopulationData = useFirebaseValue<FirebasePopulationData>("population/data") || {};
  
  const [populationStats, setPopulationStats] = useState({
    count: 4000,
    growthRate: 5.3,
    feedConsumption: 220,
    harvestTime: "Week 8"
  });

  const [growthData, setGrowthData] = useState<Array<{name: string; count: number; growthRate: number}>>([
    { name: 'Week 1', count: 1000, growthRate: 0 },
    { name: 'Week 2', count: 1500, growthRate: 50 },
    { name: 'Week 3', count: 2000, growthRate: 33.3 },
    { name: 'Week 4', count: 2800, growthRate: 40 },
    { name: 'Week 5', count: 3500, growthRate: 25 },
    { name: 'Week 6', count: 3800, growthRate: 8.6 },
    { name: 'Week 7', count: 4000, growthRate: 5.3 },
  ]);

  useEffect(() => {
    // Process Firebase data
    if (Object.keys(rawPopulationData).length > 0) {
      const weeks = Object.keys(rawPopulationData)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .slice(-7); // Get last 7 weeks

      const processedData = weeks.map((week, index) => {
        const weekData = rawPopulationData[week];
        const prevWeekData = rawPopulationData[weeks[index - 1]];
        
        let growthRate = 0;
        if (prevWeekData && prevWeekData.count > 0) {
          growthRate = ((weekData.count - prevWeekData.count) / prevWeekData.count) * 100;
        }

        return {
          name: `Week ${index + 1}`,
          count: weekData.count,
          growthRate: parseFloat(growthRate.toFixed(1))
        };
      });

      if (processedData.length > 0) {
        setGrowthData(processedData);
        const latest = processedData[processedData.length - 1];
        setPopulationStats({
          count: latest.count,
          growthRate: latest.growthRate,
          feedConsumption: Math.round(latest.count * 0.055), // Estimate: 55g per roach per day
          harvestTime: `Week ${processedData.length + 1}`
        });
      }
    }
  }, [rawPopulationData]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Population Analytics</h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-800">{populationStats.count.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Population Count</p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className={`text-3xl font-bold ${populationStats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {populationStats.growthRate >= 0 ? '+' : ''}{populationStats.growthRate}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Growth Rate</p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-800">{populationStats.feedConsumption}kg</p>
          <p className="text-sm text-gray-500 mt-1">Daily Feed</p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{populationStats.harvestTime}</p>
          <p className="text-sm text-gray-500 mt-1">Harvest Time</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={growthData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
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
              yAxisId="left"
              label={{ 
                value: 'Count', 
                angle: -90, 
                position: 'insideLeft',
                fontSize: 12 
              }}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              yAxisId="right"
              orientation="right"
              label={{ 
                value: 'Growth %', 
                angle: 90, 
                position: 'insideRight',
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
                if (name === 'count') return [`${value} roaches`, 'Population Count'];
                if (name === 'growthRate') return [`${value}%`, 'Growth Rate'];
                return [value, name];
              }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="count"
              name="Population Count"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorCount)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="growthRate"
              name="Growth Rate"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};