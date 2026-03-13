// 美股数据 API - Finnhub
import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

const FINNHUB_API = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY || 'demo'; // 使用环境变量

// 缓存时间：1分钟
const CACHE_TTL = 60000;

// 获取美股主要指数
async function getMarketIndices() {
  const cacheKey = 'us-indices';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // 使用 demo API 获取主要指数（道琼斯、标普500、纳斯达克）
    // 注意：demo key 有请求限制，生产环境需要真实 API key
    const indices = [
      { symbol: 'DJI', name: '道琼斯' },
      { symbol: 'SPX', name: '标普500' },
      { symbol: 'NDX', name: '纳斯达克100' },
    ];

    const results = await Promise.all(
      indices.map(async (index) => {
        try {
          const response = await fetch(
            `${FINNHUB_API}/quote?symbol=${index.symbol}&token=${API_KEY}`
          );
          const data = await response.json();
          
          return {
            code: index.symbol,
            name: index.name,
            price: data.c || 0,
            change: data.d || 0,
            changePercent: data.dp || 0,
          };
        } catch {
          return {
            code: index.symbol,
            name: index.name,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    cache.set(cacheKey, results, CACHE_TTL);
    return results;
  } catch (error) {
    console.error('获取美股指数失败:', error);
    return [];
  }
}

// 搜索股票
async function searchStocks(keyword: string) {
  const cacheKey = `us-search-${keyword}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${FINNHUB_API}/search?q=${encodeURIComponent(keyword)}&token=${API_KEY}`
    );
    const data = await response.json();
    
    const stocks = (data.result || []).slice(0, 10).map((item: any) => ({
      code: item.symbol,
      name: item.description,
      market: 'us' as const,
    }));

    cache.set(cacheKey, stocks, CACHE_TTL);
    return stocks;
  } catch (error) {
    console.error('搜索美股失败:', error);
    return [];
  }
}

// 获取股票详情
async function getStockDetail(symbol: string) {
  const cacheKey = `us-stock-${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${FINNHUB_API}/quote?symbol=${symbol}&token=${API_KEY}`
    );
    const data = await response.json();

    const result = {
      code: symbol,
      name: symbol, // Finnhub quote 不返回名称，需要额外调用
      market: 'us' as const,
      price: data.c || 0,
      change: data.d || 0,
      changePercent: data.dp || 0,
      high: data.h || 0,
      low: data.l || 0,
      open: data.o || 0,
      prevClose: data.pc || 0,
    };

    cache.set(cacheKey, result, CACHE_TTL);
    return result;
  } catch (error) {
    console.error('获取美股详情失败:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const code = searchParams.get('code');
  const keyword = searchParams.get('keyword');

  try {
    if (action === 'indices') {
      const data = await getMarketIndices();
      return NextResponse.json({ success: true, data });
    }

    if (action === 'search' && keyword) {
      const data = await searchStocks(keyword);
      return NextResponse.json({ success: true, data });
    }

    if (action === 'detail' && code) {
      const data = await getStockDetail(code);
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
