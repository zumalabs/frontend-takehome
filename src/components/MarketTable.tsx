import type { MarketQuote } from '../types';
import { MarketRow } from './MarketRow';

interface MarketTableProps {
  quotes: MarketQuote[];
  selectedMarketId: string | null;
  onSelectMarket: (marketId: string) => void;
}

export function MarketTable({
  quotes,
  selectedMarketId,
  onSelectMarket,
}: MarketTableProps) {
  if (quotes.length === 0) {
    return (
      <div className="empty-state">
        <strong>No markets match</strong>
        <span>Try a shorter market or route search.</span>
      </div>
    );
  }

  return (
    <div className="market-table" role="table" aria-label="Live markets">
      <div className="market-table__header" role="row">
        <span>Market</span>
        <span>Bid</span>
        <span>Ask</span>
        <span>Move</span>
        <span>Activity</span>
        <span>Renders</span>
      </div>
      <div role="rowgroup">
        {quotes.map((quote) => (
          <MarketRow
            key={quote.id}
            quote={quote}
            selected={selectedMarketId === quote.id}
            onSelect={() => onSelectMarket(quote.id)}
          />
        ))}
      </div>
    </div>
  );
}

