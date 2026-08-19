import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { getDeskSnapshot } from '../data/markets';
import { MarketTable } from './MarketTable';

describe('MarketTable', () => {
  it('renders a desk snapshot and reports the selected market', async () => {
    const onSelectMarket = vi.fn();
    const quotes = getDeskSnapshot('atlantic').slice(0, 2);
    const user = userEvent.setup();

    render(
      <MarketTable
        quotes={quotes}
        selectedMarketId={null}
        onSelectMarket={onSelectMarket}
      />
    );

    expect(screen.getByText('TD3C')).toBeInTheDocument();
    expect(screen.getByText('TC2')).toBeInTheDocument();

    await user.click(screen.getByText('TD3C'));
    expect(onSelectMarket).toHaveBeenCalledWith('atl-td3c');
  });
});

