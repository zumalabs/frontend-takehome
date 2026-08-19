import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RendererErrorBoundary } from './RendererErrorBoundary';

function BrokenRenderer(): never {
  throw new Error('Bridge unavailable');
}

describe('RendererErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a visible renderer failure', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <RendererErrorBoundary>
        <BrokenRenderer />
      </RendererErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Market Pulse could not start',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Bridge unavailable');
  });
});
