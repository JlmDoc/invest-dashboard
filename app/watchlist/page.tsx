'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWatchlistStore } from '@/lib/store';

interface SearchResult {
  code: string;
  name: string;
  market: 'cn' | 'us' | 'crypto';
}

export default function WatchlistPage() {
  const { items, addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const [cnRes, usRes, cryptoRes] = await Promise.all([
        fetch(`/api/stock/cn?action=search&keyword=${encodeURIComponent(keyword)}`),
        fetch(`/api/stock/us?action=search&keyword=${encodeURIComponent(keyword)}`),
        fetch(`/api/crypto?action=search&keyword=${encodeURIComponent(keyword)}`),
      ]);

      const [cnData, usData, cryptoData] = await Promise.all([
        cnRes.json(),
        usRes.json(),
        cryptoRes.json(),
      ]);

      const allResults: SearchResult[] = [
        ...(cnData.success ? cnData.data : []),
        ...(usData.success ? usData.data : []),
        ...(cryptoData.success ? cryptoData.data : []),
      ];

      setResults(allResults);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(result: SearchResult) {
    addItem(result.code, result.market, result.name);
  }

  function handleRemove(code: string, market: 'cn' | 'us' | 'crypto') {
    removeItem(code, market);
  }

  const marketLabels = {
    cn: 'A股',
    us: '美股',
    crypto: '加密',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-500">
              ← 投资研究仪表盘
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">自选股管理</h1>

        {/* 搜索区域 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">添加自选</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="输入股票代码或名称..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition"
            >
              {loading ? '搜索中...' : '搜索'}
            </button>
          </div>

          {/* 搜索结果 */}
          {results.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">搜索结果</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {results.map((result, index) => {
                  const inList = isInWatchlist(result.code, result.market);
                  return (
                    <div
                      key={`${result.market}-${result.code}-${index}`}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-500">
                          {result.code} · {marketLabels[result.market]}
                        </div>
                      </div>
                      <button
                        onClick={() => inList ? handleRemove(result.code, result.market) : handleAdd(result)}
                        className={`px-3 py-1 rounded text-sm ${
                          inList
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        {inList ? '移除' : '添加'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 自选列表 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            我的自选 ({items.length})
          </h2>
          
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              暂无自选股，使用上方搜索添加
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={`${item.market}-${item.code}`}
                  className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Link
                    href={`/stock/${item.market}/${item.code}`}
                    className="flex-1"
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.code} · {marketLabels[item.market]}
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemove(item.code, item.market)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
