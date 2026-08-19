import { useMemo, useState } from "react";
import { CandidateEnhancement } from "./components/CandidateEnhancement";
import { MarketTable } from "./components/MarketTable";
import { ShellDiagnostics } from "./components/ShellDiagnostics";
import { useClock } from "./hooks/useClock";
import { useDesktopMarketFocus } from "./hooks/useDesktopMarketFocus";
import { useMarketFeed } from "./hooks/useMarketFeed";
import type { Desk, SortMode } from "./types";

function MarketWorkspace({
  onMountedChange,
}: {
  onMountedChange: (mounted: boolean) => void;
}) {
  const now = useClock();
  const [desk, setDesk] = useState<Desk>("atlantic");
  const [sortMode, setSortMode] = useState<SortMode>("market");
  const [query, setQuery] = useState("");
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const quotes = useMarketFeed(desk);

  const visibleQuotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchingQuotes = quotes.filter(
      (quote) =>
        quote.market.toLowerCase().includes(normalizedQuery) ||
        quote.route.toLowerCase().includes(normalizedQuery)
    );

    return matchingQuotes.sort((a, b) =>
      sortMode === "activity"
        ? b.activity - a.activity
        : a.market.localeCompare(b.market)
    );
  }, [quotes, query]);

  useDesktopMarketFocus((marketId) => {
    if (visibleQuotes.some((quote) => quote.id === marketId)) {
      setSelectedMarketId(marketId);
    }
  });

  return (
    <>
      <main className="workspace">
        <section className="workspace__hero">
          <div>
            <span className="eyebrow">Live freight intelligence</span>
            <h1>Market Pulse</h1>
            <p>Fast indications, without losing the signal.</p>
          </div>
          <div className="sync-status" aria-label="Renderer clock">
            <span className="live-dot" />
            <span>
              Renderer pass
              <strong>{now.toLocaleTimeString("en-GB")}</strong>
            </span>
          </div>
        </section>

        <section className="market-card">
          <div className="toolbar">
            <div className="desk-tabs" aria-label="Trading desk">
              {(["atlantic", "pacific"] as const).map((deskOption) => (
                <button
                  key={deskOption}
                  type="button"
                  aria-pressed={desk === deskOption}
                  onClick={() => {
                    setDesk(deskOption);
                    setSelectedMarketId(null);
                  }}
                >
                  {deskOption}
                </button>
              ))}
            </div>

            <label className="search-control">
              <span className="sr-only">Search markets</span>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
              </svg>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search market or route"
              />
            </label>

            <label className="sort-control">
              <span>Sort</span>
              <select
                value={sortMode}
                onChange={(event) =>
                  setSortMode(event.target.value as SortMode)
                }
              >
                <option value="market">Market A–Z</option>
                <option value="activity">Most active</option>
              </select>
            </label>
          </div>

          <div className="market-meta">
            <span>{visibleQuotes.length} markets</span>
            <span>
              Selected{" "}
              <strong>
                {visibleQuotes.find((quote) => quote.id === selectedMarketId)
                  ?.market ?? "—"}
              </strong>
            </span>
          </div>

          <MarketTable
            quotes={visibleQuotes}
            selectedMarketId={selectedMarketId}
            onSelectMarket={setSelectedMarketId}
          />
        </section>

        <CandidateEnhancement
          quotes={visibleQuotes}
          selectedMarketId={selectedMarketId}
          onSelectMarket={setSelectedMarketId}
        />
      </main>
      <ShellDiagnostics
        desk={desk}
        quotes={visibleQuotes}
        mounted
        onMountedChange={onMountedChange}
      />
    </>
  );
}

export default function App() {
  const [mounted, setMounted] = useState(true);

  return (
    <div className="app-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />
      {mounted ? (
        <MarketWorkspace onMountedChange={setMounted} />
      ) : (
        <>
          <main className="workspace workspace--unmounted">
            <span className="eyebrow">Renderer unmounted</span>
            <h1>Host shell remains active</h1>
            <p>
              Use the Electron controls below to mount the React renderer again.
            </p>
          </main>
          <ShellDiagnostics
            desk="atlantic"
            quotes={[]}
            mounted={false}
            onMountedChange={setMounted}
          />
        </>
      )}
    </div>
  );
}
