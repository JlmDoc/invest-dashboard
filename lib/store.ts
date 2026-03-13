// 自选股状态管理
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WatchlistItem, Market } from './types';

interface WatchlistState {
  items: WatchlistItem[];
  addItem: (code: string, market: Market, name: string) => void;
  removeItem: (code: string, market: Market) => void;
  isInWatchlist: (code: string, market: Market) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (code, market, name) => {
        const { items } = get();
        const exists = items.some(
          (item) => item.code === code && item.market === market
        );
        if (!exists) {
          set({
            items: [
              ...items,
              { code, market, name, addedAt: Date.now() },
            ],
          });
        }
      },
      
      removeItem: (code, market) => {
        set({
          items: get().items.filter(
            (item) => !(item.code === code && item.market === market)
          ),
        });
      },
      
      isInWatchlist: (code, market) => {
        return get().items.some(
          (item) => item.code === code && item.market === market
        );
      },
    }),
    {
      name: 'invest-watchlist',
    }
  )
);
