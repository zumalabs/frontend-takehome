import type { DesktopBridge } from '../types/desktop';

type FocusListener = (marketId: string) => void;

class DesktopBridgeMock implements DesktopBridge {
  readonly host = 'electron' as const;
  private listeners = new Set<FocusListener>();
  private registrations = 0;

  onMarketFocus(listener: FocusListener) {
    this.registrations += 1;
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  focusMarket(marketId: string) {
    this.listeners.forEach((listener) => listener(marketId));
  }

  activeListenerCount() {
    return this.listeners.size;
  }

  registrationCount() {
    return this.registrations;
  }

  reset() {
    this.listeners.clear();
    this.registrations = 0;
  }
}

export const desktopBridgeMock = new DesktopBridgeMock();

function isDesktopBridgeDisabled() {
  return new URLSearchParams(window.location.search).get('environment') === 'web';
}

export function installEnvironmentSelector() {
  const webButton = document.querySelector<HTMLButtonElement>('#environment-web');
  const desktopButton = document.querySelector<HTMLButtonElement>(
    '#environment-desktop',
  );

  if (!webButton || !desktopButton) {
    return;
  }

  const bridgeDisabled = isDesktopBridgeDisabled();
  webButton.setAttribute('aria-pressed', String(bridgeDisabled));
  desktopButton.setAttribute('aria-pressed', String(!bridgeDisabled));

  const selectEnvironment = (environment: 'web' | 'desktop') => {
    const selectingWeb = environment === 'web';

    if (selectingWeb === bridgeDisabled) {
      return;
    }

    const nextUrl = new URL(window.location.href);

    if (selectingWeb) {
      nextUrl.searchParams.set('environment', 'web');
    } else {
      nextUrl.searchParams.delete('environment');
    }

    window.location.assign(nextUrl);
  };

  webButton.addEventListener('click', () => selectEnvironment('web'));
  desktopButton.addEventListener('click', () => selectEnvironment('desktop'));
}

export function installDesktopBridgeMock() {
  if (isDesktopBridgeDisabled()) {
    return;
  }

  if (!window.marketDesktop) {
    window.marketDesktop = desktopBridgeMock;
  }
}
