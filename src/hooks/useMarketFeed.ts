import { useEffect, useState } from 'react';
import type { Desk, MarketQuote } from '../types';
import { marketFeed } from '../lib/marketFeed';

export function useMarketFeed(desk: Desk) {
  const [quotes, setQuotes] = useState<MarketQuote[]>(() =>
    marketFeed.getSnapshot(desk)
  );

  useEffect(() => {
    const unsubscribe = marketFeed.subscribe(desk, (update) => {
      setQuotes(
        quotes.map((quote) =>
          quote.id === update.id ? { ...quote, ...update } : quote
        )
      );
    });

    return unsubscribe;
  }, []);

  return quotes;
}

