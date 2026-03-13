'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MarketIndex } from '@/lib/types';

export default function MarketPage() {
  const [cnIndices, setCnIndices] = useState<MarketIndex[]>([]);
  const [usIndices, setUsIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const [cnRes, usRes] = await Promise.all([
          fetch('/api/stock/cn?action=indices'),
          fetch('/api/stock/us?action=indices'),
        ]);

        const [cnData, usData] = await Promise.all([
          cnRes.json(),
          usRes.json(),
        ]);

        if (cnData.success) setCnIndices(cnData.data);
        if (usData.success) setUsIndices(usData.data);
      } catch (error) {
        console.error('获取市场数据失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMarketData();
  }, []);

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
        <h1 className="text-2xl font-bold mb-6">市场概览</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-400">加载中...</div>
        ) : (
          <div className="space-y-8">
            {/* A股市场 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">A股市场</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cnIndices.map((index) => (
                  <div key={index.code} className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm">{index.code}</div>
                    <div className="text-lg font-semibold mt-1">{index.name}</div>
                    <div className="mt-4">
                      <div className="text-2xl font-bold">
                        {index.price.toLocaleString('zh-CN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className={`text-sm mt-1 ${
                        index.changePercent >= 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {index.changePercent >= 0 ? '+' : ''}
                        {index.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 美股市场 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">美股市场</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {usIndices.map((index) => (
                  <div key={index.code} className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm">{index.code}</div>
                    <div className="text-lg font-semibold mt-1">{index.name}</div>
                    <div className="mt-4">
                      <div className="text-2xl font-bold">
                        {index.price.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className={`text-sm mt-1 ${
                        index.changePercent >= 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {index.changePercent >= 0 ? '+' : ''}
                        {index.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 加密货币市场 */}
            <section>
              <h2 className="text-xl font-semibold mb-4">加密货币市场</h2>
              <CryptoList />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function CryptoList() {
  const [cryptos, setCryptos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCryptos() {
      try {
        const res = await fetch('/api/crypto?action=top&limit=10');
        const data = await res.json();
        if (data.success) {
          setCryptos(data.data);
        }
      } catch (error) {
        console.error('获取加密货币数据失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCryptos();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-400">加载中...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">排名</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">价格</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">24h涨跌</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">市值</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {cryptos.map((crypto, index) => (
            <tr key={crypto.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/stock/crypto/${crypto.id}`} className="hover:text-blue-500">
                  <div className="font-medium">{crypto.name}</div>
                  <div className="text-sm text-gray-500">{crypto.symbol}</div>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right font-mono">
                ${crypto.price.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-right ${
                crypto.change24h >= 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {crypto.change24h >= 0 ? '+' : ''}
                {crypto.change24h.toFixed(2)}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                ${crypto.marketCap ? (crypto.marketCap / 1e9).toFixed(2) + 'B' : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
