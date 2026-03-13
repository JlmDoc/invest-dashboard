// 类型定义

export type Market = 'cn' | 'us' | 'crypto';

export interface Stock {
  code: string;
  name: string;
  market: Market;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  prevClose?: number;
}

export interface Crypto {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap?: number;
  volume24h?: number;
}

export interface MarketIndex {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WatchlistItem {
  code: string;
  market: Market;
  name: string;
  addedAt: number;
}
