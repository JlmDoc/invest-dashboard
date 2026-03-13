'use client';

import { useEffect, useState } from 'react';
import { MarketIndex } from '@/lib/types';

interface MarketOverviewProps {
  market: 'cn' | 'us';
}

export default function MarketOverview({ market }: MarketOverviewProps) {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIndices() {
      try {
        const endpoint = market === 'cn' ? '/api/stock/cn' : '/api/stock/us';
        const response = await fetch(`${endpoint}?action=indices`);
        const result = await response.json();
        
        if (result.success) {
          setIndices(result.data);
        }
      } catch (error) {
        console.error('获取市场指数失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchIndices();
    // 每2分钟刷新一次
    const interval = setInterval(fetchIndices, 120000);
    return () => clearInterval(interval);
  }, [market]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          {market === 'cn' ? 'A股大盘' : '美股大盘'}
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        {market === 'cn' ? 'A股大盘' : '美股大盘'}
      </h2>
      <div className="space-y-3">
        {indices.map((index) => (
          <div key={index.code} className="flex justify-between items-center">
            <div>
              <div className="font-medium">{index.name}</div>
              <div className="text-sm text-gray-500">{index.code}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-lg">
                {index.price.toLocaleString('zh-CN', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                })}
              </div>
              <div className={`text-sm ${
                index.changePercent >= 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {index.changePercent >= 0 ? '+' : ''}
                {index.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
