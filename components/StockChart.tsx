'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  time: string;
  price: number;
  volume?: number;
}

interface StockChartProps {
  market: 'cn' | 'us' | 'crypto';
  code: string;
  name: string;
}

export default function StockChart({ market, code, name }: StockChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M'>('1D');

  useEffect(() => {
    // 生成模拟数据（实际项目中应调用真实 API）
    function generateMockData(): ChartData[] {
      const data: ChartData[] = [];
      const now = Date.now();
      const points = timeRange === '1D' ? 24 : timeRange === '1W' ? 7 : 30;
      const interval = timeRange === '1D' ? 3600000 : 86400000;

      for (let i = points; i >= 0; i--) {
        const time = new Date(now - i * interval);
        const basePrice = market === 'crypto' ? 50000 : 100;
        const variance = basePrice * 0.05;
        
        data.push({
          time: timeRange === '1D' 
            ? time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
            : time.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          price: basePrice + (Math.random() - 0.5) * variance,
          volume: Math.floor(Math.random() * 1000000),
        });
      }

      return data;
    }

    setLoading(true);
    // 模拟 API 延迟
    setTimeout(() => {
      setChartData(generateMockData());
      setLoading(false);
    }, 500);
  }, [market, timeRange]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{name} 走势</h2>
        <div className="flex gap-2">
          {(['1D', '1W', '1M'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          加载中...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              stroke="#999"
              fontSize={12}
            />
            <YAxis 
              stroke="#999"
              fontSize={12}
              domain={['auto', 'auto']}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: any) => [Number(value).toFixed(2), '价格']}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
