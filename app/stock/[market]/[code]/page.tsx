'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useWatchlistStore } from '@/lib/store';
import StockChart from '@/components/StockChart';
import { Stock, Crypto } from '@/lib/types';

export default function StockDetailPage() {
  const params = useParams();
  const market = params.market as 'cn' | 'us' | 'crypto';
  const code = params.code as string;
  
  const { isInWatchlist, addItem, removeItem } = useWatchlistStore();
  
  const [data, setData] = useState<Stock | Crypto | null>(null);
  const [loading, setLoading] = useState(true);

  const inWatchlist = isInWatchlist(code, market);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let endpoint = '';
        
        if (market === 'cn') {
          endpoint = `/api/stock/cn?action=detail&code=${code}`;
        } else if (market === 'us') {
          endpoint = `/api/stock/us?action=detail&code=${code}`;
        } else {
          endpoint = `/api/crypto?action=detail&id=${code}`;
        }

        const response = await fetch(endpoint);
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('获取详情失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [market, code]);

  function handleToggleWatchlist() {
    if (!data) return;
    
    if (inWatchlist) {
      removeItem(code, market);
    } else {
      addItem(code, market, data.name);
    }
  }

  const marketLabels = {
    cn: 'A股',
    us: '美股',
    crypto: '加密货币',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-500">
              ← 投资研究仪表盘
            </Link>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12 text-gray-400">加载中...</div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-500">
              ← 投资研究仪表盘
            </Link>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12 text-gray-400">
            未找到相关数据
          </div>
        </main>
      </div>
    );
  }

  const isStock = (d: any): d is Stock => 'price' in d && 'changePercent' in d && 'market' in d;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-500">
            ← 投资研究仪表盘
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{data.name}</h1>
              <div className="text-gray-500 mt-1">
                {code} · {marketLabels[market]}
              </div>
            </div>
            <button
              onClick={handleToggleWatchlist}
              className={`px-4 py-2 rounded-lg transition ${
                inWatchlist
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {inWatchlist ? '★ 已关注' : '☆ 关注'}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">最新价</div>
              <div className="text-2xl font-bold">
                {isStock(data) ? data.price.toLocaleString('zh-CN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) : data.price.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">涨跌幅</div>
              <div className={`text-2xl font-bold ${
                (isStock(data) ? data.changePercent : data.change24h) >= 0
                  ? 'text-red-500'
                  : 'text-green-500'
              }`}>
                {(isStock(data) ? data.changePercent : data.change24h) >= 0 ? '+' : ''}
                {(isStock(data) ? data.changePercent : data.change24h).toFixed(2)}%
              </div>
            </div>
            {isStock(data) && (
              <>
                <div>
                  <div className="text-sm text-gray-500">最高</div>
                  <div className="text-lg font-semibold">
                    {data.high?.toFixed(2) || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">最低</div>
                  <div className="text-lg font-semibold">
                    {data.low?.toFixed(2) || '-'}
                  </div>
                </div>
              </>
            )}
            {!isStock(data) && (
              <>
                <div>
                  <div className="text-sm text-gray-500">市值</div>
                  <div className="text-lg font-semibold">
                    ${data.marketCap ? (data.marketCap / 1e9).toFixed(2) + 'B' : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">24h成交量</div>
                  <div className="text-lg font-semibold">
                    ${data.volume24h ? (data.volume24h / 1e9).toFixed(2) + 'B' : '-'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 图表 */}
        <StockChart market={market} code={code} name={data.name} />
      </main>
    </div>
  );
}
