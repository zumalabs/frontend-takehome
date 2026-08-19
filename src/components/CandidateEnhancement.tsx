import type { MarketQuote } from '../types';

interface CandidateEnhancementProps {
  quotes: MarketQuote[];
  selectedMarketId: string | null;
  onSelectMarket: (marketId: string) => void;
}

export function CandidateEnhancement({
  quotes: _quotes,
  selectedMarketId: _selectedMarketId,
  onSelectMarket: _onSelectMarket,
}: CandidateEnhancementProps) {
  return (
    <aside className="enhancement-slot" aria-label="Candidate enhancement">
      <span className="eyebrow">Part 2</span>
      <strong>Your product improvement goes here</strong>
      <p>Keep it small, useful, and intentional.</p>
    </aside>
  );
}

