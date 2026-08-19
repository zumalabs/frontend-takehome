import { useEffect } from 'react';

export function useDesktopMarketFocus(onFocus: (marketId: string) => void) {
  useEffect(() => {
    window.marketDesktop!.onMarketFocus((marketId) => onFocus(marketId));
  }, []);
}
