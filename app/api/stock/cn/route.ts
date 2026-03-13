// A股数据 API - 东方财富
import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

// 东方财富 API 配置
const EASTMONEY_API = 'https://push2.eastmoney.com/api/qt';

// 缓存时间：2分钟
const CACHE_TTL = 120000;

interface EastMoneyStock {
  f12: string; // 代码
  f14: string; // 名称
  f2: number;  // 最新价
  f3: number;  // 涨跌幅
  f4: number;  // 涨跌额
  f5: number;  // 成交量
  f15: number; // 最高
  f16: number; // 最低
  f17: number; // 开盘
  f18: number; // 昨收
}

// 获取大盘指数
async function getMarketIndices() {
  const cacheKey = 'cn-indices';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // 上证指数、深证成指、创业板指
    const codes = ['sh000001', 'sz399001', 'sz399006'];
    const promises = codes.map(async (code) => {
      const response = await fetch(
        `${EASTMONEY_API}/stock/get?secid=${code}&fields=f12,f14,f2,f3,f4,f15,f16,f17,f18`
      );
      const data = await response.json();
      const stock = data.data as EastMoneyStock;
      
      return {
        code: stock.f12,
        name: stock.f14,
        price: stock.f2,
        change: stock.f4,
        changePercent: stock.f3,
      };
    });

    const results = await Promise.all(promises);
    cache.set(cacheKey, results, CACHE_TTL);
    return results;
  } catch (error) {
    console.error('获取A股指数失败:', error);
    return [];
  }
}

// 搜索股票
async function searchStocks(keyword: string) {
  const cacheKey = `cn-search-${keyword}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://searchapi.eastmoney.com/bussiness/web/QuotationLabelSearch?keyword=${encodeURIComponent(keyword)}`
    );
    const data = await response.json();
    
    const stocks = (data.Data?.stock || []).slice(0, 10).map((item: any) => ({
      code: item.Code,
      name: item.Name,
      market: 'cn' as const,
    }));

    cache.set(cacheKey, stocks, CACHE_TTL);
    return stocks;
  } catch (error) {
    console.error('搜索A股失败:', error);
    return [];
  }
}

// 获取股票详情
async function getStockDetail(code: string) {
  const cacheKey = `cn-stock-${code}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    // 判断市场：6开头是上海，其他是深圳
    const market = code.startsWith('6') ? 'sh' : 'sz';
    const secid = `${market}${code}`;
    
    const response = await fetch(
      `${EASTMONEY_API}/stock/get?secid=${secid}&fields=f12,f14,f2,f3,f4,f5,f15,f16,f17,f18`
    );
    const data = await response.json();
    const stock = data.data as EastMoneyStock;

    const result = {
      code: stock.f12,
      name: stock.f14,
      market: 'cn' as const,
      price: stock.f2,
      change: stock.f4,
      changePercent: stock.f3,
      volume: stock.f5,
      high: stock.f15,
      low: stock.f16,
      open: stock.f17,
      prevClose: stock.f18,
    };

    cache.set(cacheKey, result, CACHE_TTL);
    return result;
  } catch (error) {
    console.error('获取A股详情失败:', error);
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
