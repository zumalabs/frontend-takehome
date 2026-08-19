export interface DesktopBridge {
  readonly host: 'electron';
  onMarketFocus(listener: (marketId: string) => void): () => void;
}

declare global {
  interface Window {
    /** Narrow API exposed by the Electron preload script when hosted on desktop. */
    marketDesktop?: DesktopBridge;
  }
}

export {};

