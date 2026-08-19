import { getDeskSnapshot } from '../data/markets';
import type { Desk, QuoteUpdate } from '../types';

type QuoteListener = (update: QuoteUpdate) => void;

class MarketFeed {
  private listeners = new Map<Desk, Set<QuoteListener>>();
  private timers = new Map<Desk, number>();
  private sequence = 0;

  getSnapshot(desk: Desk) {
    return getDeskSnapshot(desk);
  }

  subscribe(desk: Desk, listener: QuoteListener) {
    const listeners = this.listeners.get(desk) ?? new Set<QuoteListener>();
    listeners.add(listener);
    this.listeners.set(desk, listeners);
    this.start(desk);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.stop(desk);
      }
    };
  }

  simulateBurst(desk: Desk) {
    const snapshot = this.getSnapshot(desk);
    snapshot.slice(0, 2).forEach((quote, index) => {
      this.emit(desk, {
        id: quote.id,
        bid: quote.bid + 2.5 + index,
        ask: quote.ask + 2.5 + index,
        activity: Math.min(99, quote.activity + 3 + index),
        change: quote.change + 0.4 + index / 10,
        updatedAt: Date.now() + index,
      });
    });
  }

  emit(desk: Desk, update: QuoteUpdate) {
    this.listeners.get(desk)?.forEach((listener) => listener(update));
  }

  listenerCount(desk?: Desk) {
    if (desk) return this.listeners.get(desk)?.size ?? 0;
    return [...this.listeners.values()].reduce(
      (total, listeners) => total + listeners.size,
      0
    );
  }

  reset() {
    [...this.timers.keys()].forEach((desk) => this.stop(desk));
    this.listeners.clear();
    this.sequence = 0;
  }

  private start(desk: Desk) {
    if (this.timers.has(desk)) return;

    const timer = window.setInterval(() => {
      const snapshot = this.getSnapshot(desk);
      const quote = snapshot[this.sequence % snapshot.length];
      const direction = this.sequence % 3 === 0 ? -1 : 1;
      const movement = ((this.sequence % 4) + 1) * 0.12 * direction;
      this.sequence += 1;

      this.emit(desk, {
        id: quote.id,
        bid: quote.bid + movement,
        ask: quote.ask + movement,
        activity: Math.min(99, quote.activity + (this.sequence % 8)),
        change: quote.change + movement,
        updatedAt: Date.now(),
      });
    }, 1200);

    this.timers.set(desk, timer);
  }

  private stop(desk: Desk) {
    const timer = this.timers.get(desk);
    if (timer !== undefined) {
      window.clearInterval(timer);
      this.timers.delete(desk);
    }
  }
}

export const marketFeed = new MarketFeed();

