import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';

export default function MonthlySummary() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$4,250',
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      title: 'Waste Processed',
      value: '6,580kg',
      change: '+8.2%',
      trend: 'up',
      icon: <Package className="w-6 h-6" />
    },
    {
      title: 'Production Cost',
      value: '$1,240',
      change: '-3.2%',
      trend: 'down',
      icon: <TrendingDown className="w-6 h-6" />
    },
    {
      title: 'Net Profit',
      value: '$3,010',
      change: '+15.8%',
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-lg font-semibold text-green-600 mb-6">Monthly Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {stat.icon}
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}