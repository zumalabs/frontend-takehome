export type Desk = 'atlantic' | 'pacific';

export type SortMode = 'market' | 'activity';

export interface MarketQuote {
  id: string;
  desk: Desk;
  market: string;
  route: string;
  bid: number;
  ask: number;
  activity: number;
  change: number;
  updatedAt: number;
}

export interface QuoteUpdate {
  id: string;
  bid: number;
  ask: number;
  activity: number;
  change: number;
  updatedAt: number;
}

