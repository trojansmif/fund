// Full Fund roster sourced from smif_positions_assignments.xlsx.
// Update by exporting a new xlsx and re-running the import script,
// or by editing this file directly.
export type RosterEntry = {
  team:
    | "Executive Committee"
    | "Directors"
    | "Equity Sector Leads"
    | "Fixed Income"
    | "Risk Management"
    | "Quantitative Strategies"
    | "Economics Research"
    | "International Equities"
    | "Support Functions"
    | "Analysts";
  name: string;
  role: string;
  /** Optional direct LinkedIn profile URL. When empty, the UI links to a LinkedIn people search for this name. */
  linkedin?: string;
};

export const ROSTER: RosterEntry[] = [
  { team: "Executive Committee", name: "Connor Chisick", role: "President + Chief Investment Officer (CIO)" },
  { team: "Executive Committee", name: "Rafeh Kamal", role: "Chief Operating Officer (COO) + Director of Operations" },
  { team: "Executive Committee", name: "Guillermo Sanchez Garcia", role: "Chief Risk Officer (CRO)" },
  { team: "Executive Committee", name: "Hungjui 'Ryan' Chen", role: "Chief Economist + US Economics Lead" },
  { team: "Executive Committee", name: "Kuan-Wei (David) Huang", role: "Chief Technology Officer (CTO)" },

  { team: "Directors", name: "Siddharth Saridevi", role: "Co-Director of Fixed Income" },
  { team: "Directors", name: "Michael Garland", role: "Co-Director of Fixed Income" },
  { team: "Directors", name: "Caleb Wang", role: "Director of Risk Management + Rates and Sovereign Debt Lead" },
  { team: "Directors", name: "Yufan Chi", role: "Director of Economics Research" },
  { team: "Directors", name: "Nikhil Shah", role: "Director of Alternative Investments" },
  { team: "Directors", name: "Huei-Syuan (Shannon) Huang", role: "Director of Quantitative Strategies" },
  { team: "Directors", name: "Ziyuan Hao (Lambert)", role: "Director of US + International Equities" },

  { team: "Equity Sector Leads", name: "Arnav Dudeja", role: "Co-Energy + Utilities Lead" },
  { team: "Equity Sector Leads", name: "Alexander Chika-Nwanja", role: "Consumer Discretionary Lead" },
  { team: "Equity Sector Leads", name: "Mark Huber", role: "Technology Lead" },
  { team: "Equity Sector Leads", name: "Yanting (Christine) Zhao", role: "Communication Services Lead" },
  { team: "Equity Sector Leads", name: "Dylan Martling", role: "Healthcare Lead" },
  { team: "Equity Sector Leads", name: "Vivian Wei", role: "Financials + Commodities & Crypto Lead" },
  { team: "Equity Sector Leads", name: "Mridul Bhatla", role: "Co-Energy Lead" },
  { team: "Equity Sector Leads", name: "Ian Martin", role: "Industrials Lead" },
  { team: "Equity Sector Leads", name: "Hao-Chen (Howard) Shieh", role: "Materials + Real Estate Lead" },
  { team: "Equity Sector Leads", name: "Mrudula Gurumani", role: "Consumer Staples Lead" },

  { team: "Fixed Income", name: "Allenvale Duan", role: "Investment Grade Credit Lead" },
  { team: "Fixed Income", name: "Prithvi (Pritu) Acharya", role: "High Yield & Structured Products Lead" },
  { team: "Fixed Income", name: "Quynh-Ngau Tran Duc", role: "Fixed Income Analyst" },
  { team: "Fixed Income", name: "Maocheng Zuo", role: "Fixed Income Analyst" },
  { team: "Fixed Income", name: "Shawn Chen", role: "Fixed Income Analyst" },

  { team: "Risk Management", name: "Chengyu Huo", role: "Portfolio Risk Analytics Lead" },
  { team: "Risk Management", name: "Zi-Yu (Cameo) Lu", role: "Market Risk & Stress Testing Lead" },
  { team: "Risk Management", name: "Vivek Jayaraman", role: "Compliance & Reporting Lead" },
  { team: "Risk Management", name: "Nikki Wu", role: "Risk Management Analyst" },

  { team: "Quantitative Strategies", name: "Rishi Singal", role: "Factor Modeling + Private Markets & Hedge Fund Strategies Lead" },
  { team: "Quantitative Strategies", name: "Yiyang Li (Leon)", role: "Co-Portfolio Analytics & Risk Modeling Lead" },
  { team: "Quantitative Strategies", name: "Katherine Tan", role: "Co-Portfolio Analytics & Risk Modeling Lead" },

  { team: "Economics Research", name: "Tanush Sanghai", role: "Econometrics Modeling & Forecasting Lead" },
  { team: "Economics Research", name: "Karthik Krishna", role: "Global Economics Lead" },
  { team: "Economics Research", name: "Vaishnavi Jadhav", role: "Thematic Economics Lead" },

  { team: "International Equities", name: "Shreya Thakkar", role: "International Equities Lead" },

  { team: "Support Functions", name: "Elvis Kwong", role: "Director of Communications & External Affairs" },
  { team: "Support Functions", name: "Elias Guzman", role: "Co-Director of Fundraising" },
  { team: "Support Functions", name: "Mason Wood", role: "Co-Director of Fundraising" },

  { team: "Analysts", name: "David Elman", role: "Analyst" },
  { team: "Analysts", name: "Elaine Wang", role: "Analyst" },
  { team: "Analysts", name: "Teng Chao (Benny)", role: "Analyst" },
];

export function byTeam(team: RosterEntry["team"]) {
  return ROSTER.filter((m) => m.team === team);
}

export function initials(fullName: string): string {
  // Strip parentheticals and pick up to two initials
  const clean = fullName.replace(/\([^)]*\)/g, "").replace(/['"]/g, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const FACULTY_ADVISORS = [
  {
    name: "Shane Shepherd",
    role: "Academic Director, MS in Finance",
    title: "Assistant Professor of Clinical Finance & Business Economics",
    department: "Finance & Business Economics · USC Marshall",
    url: "https://www.marshall.usc.edu/personnel/shane-shepherd",
    blurb:
      "Academic Director of Marshall's MS in Finance program — ranked #1 globally by the Financial Times two years running. Research and teaching focus on investment management, quantitative investing, and portfolio construction.",
    relation:
      "Faculty Advisor — academic oversight, approves non-standard trades, and non-voting Investment Committee member.",
  },
  {
    name: "Ayca Altintig",
    role: "Associate Professor of Clinical Finance & Business Economics",
    title: "Associate Professor of Clinical Finance & Business Economics",
    department: "Finance & Business Economics · USC Marshall",
    url: "https://www.marshall.usc.edu/personnel/ayca-altintig",
    blurb:
      "Teaches across personal and corporate finance, including The Power of Personal Finance alongside advanced financial analysis, valuation, and corporate financial strategy.",
    relation:
      "Faculty Advisor and co-lead of the Women-Led Initiative in Finance.",
  },
] as const;
