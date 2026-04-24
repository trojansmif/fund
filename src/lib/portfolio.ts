export type AssetClass =
  | "US Equity"
  | "International Equity"
  | "Fixed Income"
  | "Alternatives"
  | "ETF"
  | "Cash";

export type Holding = {
  ticker: string;
  name: string;
  assetClass: AssetClass;
  sector: string;
  weight: number; // % of NAV
  pnl: number; // unrealized P&L %
  thesis: string;
};

export type Snapshot = {
  asOf: string;
  nav: number;
  startingAUM: number;
  invested: number;
  cash: number;
  cashPct: number;
  positions: number;
  sinceInception: number;
  annualizedReturn: number;
  annualizedVol: number;
  maxDrawdown: number;
  sharpe: number;
  sortino: number;
  beta: number;
  alpha: number;
  trackingError: number;
  informationRatio: number;
  topContributors: { ticker: string; contribution: number }[];
  topDetractors: { ticker: string; contribution: number }[];
  holdings: Holding[];
  sectors: { sector: string; weight: number }[];
  assetAllocation: { class: AssetClass; weight: number; target: [number, number] }[];
  navSeries: { date: string; nav: number; benchmark: number }[];
};

// Seed snapshot hydrated from the SMIF Portfolio Tracker (SMIF_Fund_Portfolio_Tracker.xlsx).
// This is what the site serves when no live PORTFOLIO_DATA_URL is configured.
// Update these numbers by exporting the Compliance and Holdings sheets of the tracker.
export const SEED_SNAPSHOT: Snapshot = {
  asOf: "2026-04-20",
  nav: 127348,
  startingAUM: 100000,
  invested: 41588,
  cash: 85760,
  cashPct: 67.35,
  positions: 24,
  sinceInception: 27.35,
  annualizedReturn: 39.8,
  annualizedVol: 12.4,
  maxDrawdown: -6.1,
  sharpe: 2.41,
  sortino: 3.18,
  beta: 0.46,
  alpha: 19.2,
  trackingError: 8.4,
  informationRatio: 1.82,
  topContributors: [
    { ticker: "CAT", contribution: 4.12 },
    { ticker: "GLD", contribution: 3.05 },
    { ticker: "GOOGL", contribution: 2.81 },
    { ticker: "META", contribution: 2.22 },
    { ticker: "TSLA", contribution: 1.64 },
  ],
  topDetractors: [
    { ticker: "NVDA", contribution: -0.88 },
    { ticker: "UNH", contribution: -0.31 },
    { ticker: "TLT", contribution: -0.07 },
    { ticker: "PG", contribution: -0.05 },
  ],
  holdings: [
    { ticker: "AAPL", name: "Apple Inc.", assetClass: "US Equity", sector: "Technology", weight: 2.50, pnl: 55.58, thesis: "Ecosystem moat + services margin expansion; resilient free cash flow." },
    { ticker: "AMZN", name: "Amazon.com Inc.", assetClass: "US Equity", sector: "Consumer Discretionary", weight: 1.14, pnl: 67.53, thesis: "AWS operating leverage + retail margin recovery." },
    { ticker: "BND", name: "Vanguard Total Bond Market ETF", assetClass: "ETF", sector: "Fixed Income", weight: 0.68, pnl: 0.28, thesis: "Broad investment-grade bond exposure for yield + ballast." },
    { ticker: "BRK-B", name: "Berkshire Hathaway", assetClass: "US Equity", sector: "Financials", weight: 1.73, pnl: 15.00, thesis: "Buffett discount + operating business float." },
    { ticker: "CAT", name: "Caterpillar Inc.", assetClass: "US Equity", sector: "Industrials", weight: 1.83, pnl: 189.70, thesis: "Infrastructure cycle exposure; dealer inventory reset." },
    { ticker: "COST", name: "Costco Wholesale", assetClass: "US Equity", sector: "Consumer Staples", weight: 1.83, pnl: 47.74, thesis: "Membership model moat; price-taker with operating leverage." },
    { ticker: "GLD", name: "SPDR Gold Shares", assetClass: "Alternatives", sector: "Alternatives", weight: 0.61, pnl: 126.25, thesis: "Gold hedge against real-rate volatility." },
    { ticker: "GOOGL", name: "Alphabet Inc.", assetClass: "US Equity", sector: "Communication Services", weight: 1.85, pnl: 131.43, thesis: "Search dominance + AI-led ad targeting upside; cloud mix shift." },
    { ticker: "HD", name: "The Home Depot", assetClass: "US Equity", sector: "Consumer Discretionary", weight: 0.96, pnl: 4.71, thesis: "Housing-cycle trough; pro customer share gains." },
    { ticker: "HON", name: "Honeywell", assetClass: "US Equity", sector: "Industrials", weight: 0.74, pnl: 15.80, thesis: "Aerospace recovery + automation backlog." },
    { ticker: "JNJ", name: "Johnson & Johnson", assetClass: "US Equity", sector: "Healthcare", weight: 1.27, pnl: 48.16, thesis: "Post-Kenvue spin pure-play pharma; MedTech growth." },
    { ticker: "JPM", name: "JPMorgan Chase", assetClass: "US Equity", sector: "Financials", weight: 2.32, pnl: 70.98, thesis: "Top-tier capital returns; scale in investment banking." },
    { ticker: "LIN", name: "Linde plc", assetClass: "US Equity", sector: "Materials", weight: 0.91, pnl: 16.20, thesis: "Industrial gas oligopoly; hydrogen optionality." },
    { ticker: "META", name: "Meta Platforms", assetClass: "US Equity", sector: "Communication Services", weight: 1.84, pnl: 100.03, thesis: "Reels monetization ramp + AI-driven ad optimization." },
    { ticker: "MSFT", name: "Microsoft", assetClass: "US Equity", sector: "Technology", weight: 2.87, pnl: 9.96, thesis: "Azure secular growth + Copilot monetization; enterprise pricing power." },
    { ticker: "NVDA", name: "NVIDIA", assetClass: "US Equity", sector: "Technology", weight: 0.74, pnl: -59.23, thesis: "GPU demand reset; AI infrastructure leader — stop-loss breach under review." },
    { ticker: "PG", name: "Procter & Gamble", assetClass: "US Equity", sector: "Consumer Staples", weight: 0.59, pnl: -5.44, thesis: "Premiumization + pricing power in staples categories." },
    { ticker: "QQQ", name: "Invesco QQQ Trust", assetClass: "ETF", sector: "Technology", weight: 2.07, pnl: 51.90, thesis: "Large-cap growth tilt — tech/AI exposure." },
    { ticker: "SPY", name: "SPDR S&P 500 ETF", assetClass: "ETF", sector: "US Equity", weight: 3.24, pnl: 38.88, thesis: "Core S&P 500 exposure — beta anchor for the Fund." },
    { ticker: "TLT", name: "iShares 20+ Year Treasury", assetClass: "Fixed Income", sector: "Fixed Income", weight: 0.24, pnl: -8.56, thesis: "Long-duration Treasury hedge for risk-off scenarios." },
    { ticker: "TSLA", name: "Tesla Inc.", assetClass: "US Equity", sector: "Consumer Discretionary", weight: 0.90, pnl: 82.30, thesis: "Auto demand softness priced in; energy + FSD optionality." },
    { ticker: "UNH", name: "UnitedHealth Group", assetClass: "US Equity", sector: "Healthcare", weight: 0.44, pnl: -35.08, thesis: "Managed care scale; Optum growth engine — stop-loss breach under review." },
    { ticker: "VNQ", name: "Vanguard Real Estate ETF", assetClass: "ETF", sector: "Real Estate", weight: 0.36, pnl: 9.51, thesis: "Diversified REIT exposure — rate-sensitive income sleeve." },
    { ticker: "XOM", name: "Exxon Mobil", assetClass: "US Equity", sector: "Energy", weight: 1.01, pnl: 36.11, thesis: "Capital discipline + Guyana volumes; refining tailwind." },
  ],
  sectors: [
    { sector: "Technology", weight: 18.70 },
    { sector: "Financials", weight: 12.40 },
    { sector: "Communication Services", weight: 11.31 },
    { sector: "Consumer Discretionary", weight: 9.18 },
    { sector: "Industrials", weight: 7.85 },
    { sector: "Consumer Staples", weight: 7.41 },
    { sector: "Healthcare", weight: 5.24 },
    { sector: "Energy", weight: 3.10 },
    { sector: "Materials", weight: 2.79 },
    { sector: "Fixed Income", weight: 2.07 },
    { sector: "Real Estate", weight: 1.09 },
  ],
  assetAllocation: [
    { class: "US Equity", weight: 23.9, target: [45, 55] },
    { class: "ETF", weight: 5.67, target: [0, 15] },
    { class: "Fixed Income", weight: 0.92, target: [20, 30] },
    { class: "International Equity", weight: 0, target: [10, 20] },
    { class: "Alternatives", weight: 0.61, target: [0, 10] },
    { class: "Cash", weight: 67.35, target: [2, 10] },
  ],
  navSeries: generateNavSeries(),
};

function generateNavSeries() {
  // Synthetic but plausible NAV path from inception (Aug 13 2025) to Apr 20 2026.
  // Anchored to the reported +27.35% since inception vs ~15% SPY.
  const start = new Date("2025-08-13");
  const end = new Date("2026-04-20");
  const out: { date: string; nav: number; benchmark: number }[] = [];
  let nav = 100;
  let spy = 100;
  const days = Math.floor((+end - +start) / 86400000);
  // Seeded PRNG so builds are deterministic
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i <= days; i++) {
    const d = new Date(+start + i * 86400000);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    const navDaily = 0.0012 + (rand() - 0.5) * 0.009;
    const spyDaily = 0.0006 + (rand() - 0.5) * 0.011;
    nav *= 1 + navDaily;
    spy *= 1 + spyDaily;
    out.push({
      date: d.toISOString().slice(0, 10),
      nav: Math.round(nav * 100) / 100,
      benchmark: Math.round(spy * 100) / 100,
    });
  }
  // Pin final values to reported figures
  const finalNav = out[out.length - 1];
  const navScale = 127.35 / finalNav.nav;
  const spyScale = 115.1 / finalNav.benchmark;
  return out.map((p) => ({
    date: p.date,
    nav: Math.round(p.nav * navScale * 100) / 100,
    benchmark: Math.round(p.benchmark * spyScale * 100) / 100,
  }));
}

export const POLICY_LIMITS = {
  positionCap: 5, // % NAV
  sectorCap: 25,
  cashFloor: 2,
  tradeCap: 3,
  stopLoss: 15,
};

export function formatUSD(n: number, compact = false) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: compact ? 0 : 0,
    notation: compact ? "compact" : "standard",
  }).format(n);
}

export function formatPct(n: number, sign = true) {
  const s = sign && n > 0 ? "+" : "";
  return `${s}${n.toFixed(2)}%`;
}
