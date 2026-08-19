import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  desktopBridgeMock,
  installDesktopBridgeMock,
  installEnvironmentSelector,
} from './desktopBridgeMock';

describe('installDesktopBridgeMock', () => {
  beforeEach(() => {
    delete window.marketDesktop;
    desktopBridgeMock.reset();
    window.history.replaceState(null, '', '/');
    document.body.innerHTML = `
      <button id="environment-web" type="button">Web</button>
      <button id="environment-desktop" type="button">Desktop</button>
    `;
  });

  afterEach(() => {
    delete window.marketDesktop;
    window.history.replaceState(null, '', '/');
    document.body.innerHTML = '';
  });

  it('installs the browser bridge by default', () => {
    installDesktopBridgeMock();

    expect(window.marketDesktop).toBe(desktopBridgeMock);
  });

  it('leaves the bridge absent when the harness flag is off', () => {
    window.history.replaceState(null, '', '/?environment=web');

    installDesktopBridgeMock();

    expect(window.marketDesktop).toBeUndefined();
  });

  it('shows the selected runtime environment', () => {
    installEnvironmentSelector();

    expect(document.querySelector('#environment-web')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(document.querySelector('#environment-desktop')).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    window.history.replaceState(null, '', '/?environment=web');
    installEnvironmentSelector();

    expect(document.querySelector('#environment-web')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(document.querySelector('#environment-desktop')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
