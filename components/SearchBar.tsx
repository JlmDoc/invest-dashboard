'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  code: string;
  name: string;
  market: 'cn' | 'us' | 'crypto';
}

export default function SearchBar() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  async function handleSearch(query: string) {
    setKeyword(query);
    
    if (query.length < 1) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    try {
      // 并行搜索三个市场
      const [cnRes, usRes, cryptoRes] = await Promise.all([
        fetch(`/api/stock/cn?action=search&keyword=${encodeURIComponent(query)}`),
        fetch(`/api/stock/us?action=search&keyword=${encodeURIComponent(query)}`),
        fetch(`/api/crypto?action=search&keyword=${encodeURIComponent(query)}`),
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

      setResults(allResults.slice(0, 10));
    } catch (error) {
      console.error('搜索失败:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(result: SearchResult) {
    setKeyword('');
    setShowResults(false);
    router.push(`/stock/${result.market}/${result.code}`);
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={keyword}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => keyword && setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        placeholder="搜索股票/加密货币..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">搜索中...</div>
          ) : results.length > 0 ? (
            <div className="divide-y">
              {results.map((result, index) => (
                <button
                  key={`${result.market}-${result.code}-${index}`}
                  onClick={() => handleSelect(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-gray-500">{result.code}</div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {result.market === 'cn' ? 'A股' : result.market === 'us' ? '美股' : '加密'}
                  </span>
                </button>
              ))}
            </div>
          ) : keyword ? (
            <div className="p-4 text-center text-gray-500">未找到结果</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
