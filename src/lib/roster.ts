// Full Fund roster sourced from smif_positions_assignments.xlsx.
// Update by exporting a new xlsx and re-running the import script,
// or by editing this file directly.
export type RosterEntry = {
  team:
    | "Executive Committee"
    | "Directors"
    | "Equity Sector Leads"
    | "Fixed Income"
    | "Alternative Investments"
    | "Risk Management"
    | "Quantitative Strategies"
    | "Economics Research"
    | "International Equities"
    | "Support Functions"
    | "Analysts"
    | "Faculty Advisors";
  name: string;
  role: string;
  /** Optional direct LinkedIn profile URL. When empty, the UI links to a LinkedIn people search for this name. */
  linkedin?: string;
};

export const ROSTER: RosterEntry[] = [
  { team: "Executive Committee", name: "Connor Chisick", role: "President + Chief Investment Officer (CIO)", linkedin: "https://www.linkedin.com/in/connorchisick" },
  { team: "Executive Committee", name: "Rafeh Kamal", role: "Chief Operating Officer (COO) + Director of Operations", linkedin: "https://www.linkedin.com/in/rafehkamal" },
  { team: "Executive Committee", name: "Guillermo Sanchez Garcia", role: "Chief Risk Officer (CRO)" },
  { team: "Executive Committee", name: "Hung-Jui (Ryan) Chen", role: "Chief Economist + US Economics Lead", linkedin: "https://www.linkedin.com/in/ryan-hj-chen" },
  { team: "Executive Committee", name: "Kuan-Wei (David) Huang", role: "Chief Technology Officer (CTO)", linkedin: "https://www.linkedin.com/in/kwhdavid" },

  { team: "Directors", name: "Siddharth Saridevi", role: "Co-Director of Fixed Income" },
  { team: "Directors", name: "Michael Garland", role: "Co-Director of Fixed Income" },
  { team: "Directors", name: "Yang-En (Caleb) Wang", role: "Director of Risk Management + Rates and Sovereign Debt Lead", linkedin: "https://www.linkedin.com/in/calebwang17/" },
  { team: "Directors", name: "Yufan Chi", role: "Director of Economics Research", linkedin: "https://www.linkedin.com/in/ethanchi/" },
  { team: "Directors", name: "Nikhil Shah", role: "Director of Alternative Investments", linkedin: "https://www.linkedin.com/in/nikshah22/" },
  { team: "Directors", name: "Huei-Syuan (Shannon) Huang", role: "Director of Quantitative Strategies", linkedin: "https://www.linkedin.com/in/shannon-huanghs" },
  { team: "Directors", name: "Ziyuan Hao (Lambert)", role: "Director of US + International Equities" },

  { team: "Equity Sector Leads", name: "Arnav Dudeja", role: "Co-Energy + Utilities Lead", linkedin: "https://www.linkedin.com/in/arnavdudeja" },
  { team: "Equity Sector Leads", name: "Nnamdi Chika-Nwanja", role: "Consumer Discretionary Lead" },
  { team: "Equity Sector Leads", name: "Mark Huber", role: "Technology Lead", linkedin: "https://www.linkedin.com/in/mark-huber-ib/" },
  { team: "Equity Sector Leads", name: "Yanting (Christine) Zhao", role: "Communication Services Lead", linkedin: "https://www.linkedin.com/in/yanting-christine-zhao" },
  { team: "Equity Sector Leads", name: "Dylan Martling", role: "Healthcare Lead", linkedin: "https://www.linkedin.com/in/dylan-martling-89a399300" },
  { team: "Alternative Investments", name: "Huiyu (Vivian) Wei", role: "Commodities & Crypto Lead + Financials Lead", linkedin: "https://www.linkedin.com/in/vivian-huiyu-wei/" },
  { team: "Equity Sector Leads", name: "Mridul Bhatla", role: "Co-Energy Lead", linkedin: "https://www.linkedin.com/in/mridul-bhatla/" },
  { team: "Equity Sector Leads", name: "Ian Martin", role: "Industrials Lead", linkedin: "https://www.linkedin.com/in/ilmartin" },
  { team: "Equity Sector Leads", name: "Hao-Chen (Howard) Shieh", role: "Materials + Real Estate Lead", linkedin: "https://www.linkedin.com/in/howard-shieh/" },
  { team: "Equity Sector Leads", name: "Mrudula Gurumani", role: "Consumer Staples Lead", linkedin: "https://www.linkedin.com/in/mrudula-gurumani" },

  { team: "Fixed Income", name: "Allenvale Duan", role: "Investment Grade Credit Lead", linkedin: "https://www.linkedin.com/in/allenvale-duan" },
  { team: "Fixed Income", name: "Prithvi (Pritu) Acharya", role: "High Yield & Structured Products Lead", linkedin: "https://www.linkedin.com/in/prithvi-acharya/" },
  { team: "Fixed Income", name: "Quynh-Ngau Tran Duc", role: "Fixed Income Analyst" },
  { team: "Fixed Income", name: "Maocheng Zuo", role: "Fixed Income Analyst" },
  { team: "Fixed Income", name: "Hsin-Fu (Shawn) Chen", role: "Fixed Income Analyst" },

  { team: "Risk Management", name: "Chengyu Huo", role: "Portfolio Risk Analytics Lead" },
  { team: "Risk Management", name: "Zi-Yu (Cameo) Lu", role: "Market Risk & Stress Testing Lead", linkedin: "https://www.linkedin.com/in/cameo-lu" },
  { team: "Risk Management", name: "Vivek Jayaraman", role: "Compliance & Reporting Lead" },
  { team: "Risk Management", name: "Nikki Wu", role: "Risk Management Analyst" },

  { team: "Quantitative Strategies", name: "Rishi Singal", role: "Factor Modeling + Private Markets & Hedge Fund Strategies Lead" },
  { team: "Quantitative Strategies", name: "Yiyang Li (Leon)", role: "Co-Portfolio Analytics & Risk Modeling Lead" },
  { team: "Quantitative Strategies", name: "Katherine Tan", role: "Co-Portfolio Analytics & Risk Modeling Lead" },

  { team: "Economics Research", name: "Tanush Sanghai", role: "Econometrics Modeling & Forecasting Lead" },
  { team: "Economics Research", name: "Karthik Krishna", role: "Global Economics Lead" },
  { team: "Economics Research", name: "Vaishnavi Jadhav", role: "Thematic Economics Lead" },

  { team: "International Equities", name: "Shreya Thakkar", role: "International Equities Lead", linkedin: "https://www.linkedin.com/in/shreya-thakkar1" },

  { team: "Support Functions", name: "Elvis Kwong", role: "Director of Communications & External Affairs" },
  { team: "Support Functions", name: "Elias Guzman", role: "Co-Director of Fundraising" },
  { team: "Support Functions", name: "Mason Wood", role: "Co-Director of Fundraising", linkedin: "https://www.linkedin.com/in/mason-wood-0147b721b" },

  { team: "Analysts", name: "David Elman", role: "Analyst" },
  { team: "Analysts", name: "Elaine Wang", role: "Analyst" },
  { team: "Analysts", name: "Teng Chao (Benny)", role: "Analyst" },
];

// Lookup by name — used by the Teams page sector lineup to pull LinkedIn URLs
// into the renderable rows.
export function findByName(name: string): RosterEntry | undefined {
  const normalized = name.toLowerCase().replace(/[^a-z]/g, "");
  return ROSTER.find(
    (m) => m.name.toLowerCase().replace(/[^a-z]/g, "") === normalized
  );
}

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
