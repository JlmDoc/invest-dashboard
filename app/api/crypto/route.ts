// 加密货币数据 API - CoinGecko
import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// 缓存时间：2分钟
const CACHE_TTL = 120000;

// 获取主流加密货币列表
async function getTopCryptos(limit: number = 20) {
  const cacheKey = `crypto-top-${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
    );
    const data = await response.json();

    const cryptos = data.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
    }));

    cache.set(cacheKey, cryptos, CACHE_TTL);
    return cryptos;
  } catch (error) {
    console.error('获取加密货币列表失败:', error);
    return [];
  }
}

// 搜索加密货币
async function searchCryptos(keyword: string) {
  const cacheKey = `crypto-search-${keyword}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${COINGECKO_API}/search?query=${encodeURIComponent(keyword)}`
    );
    const data = await response.json();

    const cryptos = (data.coins || []).slice(0, 10).map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      market: 'crypto' as const,
    }));

    cache.set(cacheKey, cryptos, CACHE_TTL);
    return cryptos;
  } catch (error) {
    console.error('搜索加密货币失败:', error);
    return [];
  }
}

// 获取加密货币详情
async function getCryptoDetail(id: string) {
  const cacheKey = `crypto-detail-${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );
    const data = await response.json();

    const result = {
      id: data.id,
      name: data.name,
      symbol: data.symbol.toUpperCase(),
      market: 'crypto' as const,
      price: data.market_data.current_price.usd,
      change24h: data.market_data.price_change_percentage_24h || 0,
      marketCap: data.market_data.market_cap.usd,
      volume24h: data.market_data.total_volume.usd,
      high24h: data.market_data.high_24h.usd,
      low24h: data.market_data.low_24h.usd,
    };

    cache.set(cacheKey, result, CACHE_TTL);
    return result;
  } catch (error) {
    console.error('获取加密货币详情失败:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const id = searchParams.get('id');
  const keyword = searchParams.get('keyword');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    if (action === 'top') {
      const data = await getTopCryptos(limit);
      return NextResponse.json({ success: true, data });
    }

    if (action === 'search' && keyword) {
      const data = await searchCryptos(keyword);
      return NextResponse.json({ success: true, data });
    }

    if (action === 'detail' && id) {
      const data = await getCryptoDetail(id);
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
