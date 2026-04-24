-- Trojan SMIF · Roster seed
-- Loads all 44 members with auto-assigned usernames.
-- Run AFTER 01_schema.sql. Idempotent — re-running updates roles/teams without
-- changing usernames.

-- Rename fixups (safe to re-run; no-op if already renamed).
update public.members
  set username = 'nnamdi.chika-nwanja',
      full_name = 'Nnamdi Chika-Nwanja'
  where username = 'alexander.chika-nwanja';

insert into public.members (username, full_name, team, role, is_admin) values
  ('connor.chisick',          'Connor Chisick',               'Executive Committee',       'President + Chief Investment Officer (CIO)',                    true),
  ('rafeh.kamal',             'Rafeh Kamal',                  'Executive Committee',       'Chief Operating Officer (COO) + Director of Operations',        true),
  ('guillermo.sanchez.garcia','Guillermo Sanchez Garcia',     'Executive Committee',       'Chief Risk Officer (CRO)',                                      true),
  ('hung-jui.chen',           'Hung-Jui (Ryan) Chen',         'Executive Committee',       'Chief Economist + US Economics Lead',                           true),
  ('kuanwei.huang',           'Kuan-Wei (David) Huang',       'Executive Committee',       'Chief Technology Officer (CTO)',                                true),

  ('siddharth.saridevi',      'Siddharth Saridevi',           'Directors',                 'Co-Director of Fixed Income',                                   false),
  ('michael.garland',         'Michael Garland',              'Directors',                 'Co-Director of Fixed Income',                                   false),
  ('yang-en.wang',            'Yang-En (Caleb) Wang',         'Directors',                 'Director of Risk Management + Rates and Sovereign Debt Lead',   false),
  ('yufan.chi',               'Yufan Chi',                    'Directors',                 'Director of Economics Research',                                false),
  ('nikhil.shah',             'Nikhil Shah',                  'Directors',                 'Director of Alternative Investments',                           false),
  ('huei-syuan.huang',        'Huei-Syuan (Shannon) Huang',   'Directors',                 'Director of Quantitative Strategies',                           false),
  ('ziyuan.hao',              'Ziyuan Hao (Lambert)',         'Directors',                 'Director of US + International Equities',                       false),

  ('arnavsanjay.dudeja',      'Arnav Dudeja',                 'Equity Sector Leads',       'Co-Energy + Utilities Lead',                                    false),
  ('nnamdi.chika-nwanja',     'Nnamdi Chika-Nwanja',          'Equity Sector Leads',       'Consumer Discretionary Lead',                                   false),
  ('mark.huber',              'Mark Huber',                   'Equity Sector Leads',       'Technology Lead',                                               false),
  ('yanting.zhao',            'Yanting (Christine) Zhao',     'Equity Sector Leads',       'Communication Services Lead',                                   false),
  ('dylan.martling',          'Dylan Martling',               'Equity Sector Leads',       'Healthcare Lead',                                               false),
  ('huiyuwei',                'Huiyu (Vivian) Wei',           'Alternative Investments',   'Commodities & Crypto Lead + Financials Lead',                   false),
  ('mridul.bhatla',           'Mridul Bhatla',                'Equity Sector Leads',       'Co-Energy Lead',                                                false),
  ('ian.martin',              'Ian Martin',                   'Equity Sector Leads',       'Industrials Lead',                                              false),
  ('hao-chen.shieh',          'Hao-Chen (Howard) Shieh',      'Equity Sector Leads',       'Materials + Real Estate Lead',                                  false),
  ('mrudula.gurumani',        'Mrudula Gurumani',             'Equity Sector Leads',       'Consumer Staples Lead',                                         false),

  ('allenvale.duan',          'Allenvale Duan',               'Fixed Income',              'Investment Grade Credit Lead',                                  false),
  ('prithvi.acharya',         'Prithvi (Pritu) Acharya',      'Fixed Income',              'High Yield & Structured Products Lead',                         false),
  ('quynh-ngau.tran.duc',     'Quynh-Ngau Tran Duc',          'Fixed Income',              'Fixed Income Analyst',                                          false),
  ('maocheng.zuo',            'Maocheng Zuo',                 'Fixed Income',              'Fixed Income Analyst',                                          false),
  ('hsin-fu.chen',            'Hsin-Fu (Shawn) Chen',         'Fixed Income',              'Fixed Income Analyst',                                          false),

  ('chengyu.huo',             'Chengyu Huo',                  'Risk Management',           'Portfolio Risk Analytics Lead',                                 false),
  ('zi-yu.lu',                'Zi-Yu (Cameo) Lu',             'Risk Management',           'Market Risk & Stress Testing Lead',                             false),
  ('vivek.jayaraman',         'Vivek Jayaraman',              'Risk Management',           'Compliance & Reporting Lead',                                   false),
  ('nikki.wu',                'Nikki Wu',                     'Risk Management',           'Risk Management Analyst',                                       false),

  ('rishi.singal',            'Rishi Singal',                 'Quantitative Strategies',   'Factor Modeling + Private Markets & Hedge Fund Strategies Lead',false),
  ('yiyang.li',               'Yiyang Li (Leon)',             'Quantitative Strategies',   'Co-Portfolio Analytics & Risk Modeling Lead',                   false),
  ('katherine.tan',           'Katherine Tan',                'Quantitative Strategies',   'Co-Portfolio Analytics & Risk Modeling Lead',                   false),

  ('tanush.sanghai',          'Tanush Sanghai',               'Economics Research',        'Econometrics Modeling & Forecasting Lead',                      false),
  ('karthik.krishna',         'Karthik Krishna',              'Economics Research',        'Global Economics Lead',                                         false),
  ('vaishnavi.jadhav',        'Vaishnavi Jadhav',             'Economics Research',        'Thematic Economics Lead',                                       false),

  ('shreya.thakkar',          'Shreya Thakkar',               'International Equities',    'International Equities Lead',                                   false),

  ('elvis.kwong',             'Elvis Kwong',                  'Support Functions',         'Director of Communications & External Affairs',                 false),
  ('elias.guzman',            'Elias Guzman',                 'Support Functions',         'Co-Director of Fundraising',                                    false),
  ('mason.wood',              'Mason Wood',                   'Support Functions',         'Co-Director of Fundraising',                                    false),

  ('david.elman',             'David Elman',                  'Analysts',                  'Analyst',                                                       false),
  ('elaine.wang',             'Elaine Wang',                  'Analysts',                  'Analyst',                                                       false),
  ('teng.chao',               'Teng Chao (Benny)',            'Analysts',                  'Analyst',                                                       false),
  ('shaneshe',                'Shane Shepherd',               'Faculty Advisors',          'Faculty Advisor · Academic Director, MS in Finance',            true),
  ('altintig',                'Ayca Altintig',                'Faculty Advisors',          'Faculty Advisor · Co-Lead, Women-Led Initiative in Finance',    true)
on conflict (username) do update
  set full_name = excluded.full_name,
      team      = excluded.team,
      role      = excluded.role,
      is_admin  = excluded.is_admin;
