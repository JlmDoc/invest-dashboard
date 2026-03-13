import MarketOverview from '@/components/MarketOverview';
import WatchlistPreview from '@/components/WatchlistPreview';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">投资研究仪表盘</h1>
            <div className="flex items-center gap-4">
              <div className="w-64">
                <SearchBar />
              </div>
              <Link
                href="/watchlist"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                自选管理
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 市场概览 */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">市场概览</h2>
            <Link
              href="/market"
              className="text-blue-500 hover:underline text-sm"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MarketOverview market="cn" />
            <MarketOverview market="us" />
          </div>
        </section>

        {/* 自选股预览 */}
        <section>
          <WatchlistPreview />
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>数据来源：东方财富、Finnhub、CoinGecko</p>
          <p className="mt-1">仅供研究参考，不构成投资建议</p>
        </div>
      </footer>
    </div>
  );
}
