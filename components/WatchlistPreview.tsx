'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWatchlistStore } from '@/lib/store';
import { Stock } from '@/lib/types';

export default function WatchlistPreview() {
  const { items } = useWatchlistStore();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWatchlistStocks() {
      if (items.length === 0) {
        setStocks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const promises = items.map(async (item) => {
          let endpoint = '';
          let code = item.code;
          
          if (item.market === 'cn') {
            endpoint = `/api/stock/cn?action=detail&code=${code}`;
          } else if (item.market === 'us') {
            endpoint = `/api/stock/us?action=detail&code=${code}`;
          } else {
            endpoint = `/api/crypto?action=detail&id=${code}`;
          }

          const response = await fetch(endpoint);
          const result = await response.json();
          return result.success ? result.data : null;
        });

        const results = await Promise.all(promises);
        setStocks(results.filter(Boolean));
      } catch (error) {
        console.error('获取自选股数据失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWatchlistStocks();
  }, [items]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">自选股</h2>
          <Link href="/watchlist" className="text-blue-500 text-sm hover:underline">
            管理
          </Link>
        </div>
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">自选股</h2>
          <Link href="/watchlist" className="text-blue-500 text-sm hover:underline">
            添加
          </Link>
        </div>
        <div className="text-gray-400 text-sm text-center py-4">
          暂无自选股，点击"添加"开始关注
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">自选股</h2>
        <Link href="/watchlist" className="text-blue-500 text-sm hover:underline">
          管理
        </Link>
      </div>
      <div className="space-y-2">
        {stocks.slice(0, 5).map((stock) => (
          <Link
            key={`${stock.market}-${stock.code}`}
            href={`/stock/${stock.market}/${stock.code}`}
            className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
          >
            <div>
              <div className="font-medium">{stock.name}</div>
              <div className="text-sm text-gray-500">{stock.code}</div>
            </div>
            <div className="text-right">
              <div className="font-mono">
                {stock.price.toLocaleString('zh-CN', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                })}
              </div>
              <div className={`text-sm ${
                stock.changePercent >= 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {stock.changePercent >= 0 ? '+' : ''}
                {stock.changePercent.toFixed(2)}%
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
