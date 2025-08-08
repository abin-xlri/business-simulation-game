// Script-aligned market data and budget functions/matrix for ASEAN expansion

// Market Selection Countries (ASEAN)
export interface AseanCountry {
  id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  name: string;
  targetGroup: string;
  regulatoryClimate: string;
  infraWorkforce: string;
  govtLeverage: string;
  commercialRisk: string;
  projectedRevenue: string;
  strategicNotes: string[];
}

export const MARKET_COUNTRIES: AseanCountry[] = [
  {
    id: 'A',
    name: 'Thailand',
    targetGroup: 'Urban hospitals & private clinics',
    regulatoryClimate: '2-step approval, consistent',
    infraWorkforce: 'High infra, high fixed cost',
    govtLeverage: 'Medium',
    commercialRisk: 'Medium',
    projectedRevenue: '₹225 cr',
    strategicNotes: [
      'Quick launch and strong urban uptake',
      'Hospitals already showing interest in dengue programs',
      'High infra cost may strain margins',
      'Political uncertainty around healthcare subsidies'
    ]
  },
  {
    id: 'B',
    name: 'Vietnam',
    targetGroup: 'Young urban clinics & public hospitals',
    regulatoryClimate: 'Fast-track possible',
    infraWorkforce: 'Weak logistics, dense, low-cost workforce',
    govtLeverage: 'Low–Medium',
    commercialRisk: 'Medium–High',
    projectedRevenue: '₹170 cr',
    strategicNotes: [
      'Outbreak-prone, strong young patient base',
      'Temporary fast-track windows likely',
      'Poor logistics risk cold-chain breaks',
      'Limited govt leverage for foreign pharma'
    ]
  },
  {
    id: 'C',
    name: 'Philippines',
    targetGroup: 'Tier-2 hospitals & community clinics',
    regulatoryClimate: 'Slow data loops, local lobbying',
    infraWorkforce: 'Patchy networks, variable access',
    govtLeverage: 'Medium',
    commercialRisk: 'Medium',
    projectedRevenue: '₹185 cr',
    strategicNotes: [
      'High dengue burden, good product fit',
      'Potential to scale via community programs',
      'Local lobbying and fragmented reporting',
      'Slow rural execution can delay visibility'
    ]
  },
  {
    id: 'D',
    name: 'Malaysia',
    targetGroup: 'Urban specialists & medical tourism hubs',
    regulatoryClimate: 'Transparent, digital-first',
    infraWorkforce: 'Excellent logistics, costly labor',
    govtLeverage: 'High',
    commercialRisk: 'Low–Medium',
    projectedRevenue: '₹210 cr',
    strategicNotes: [
      'Reliable systems and regulatory clarity',
      'Urban hospitals with strong cold-chain capability',
      'Rising local-favor policies may slow approvals',
      'High labor cost reduces net margin'
    ]
  },
  {
    id: 'E',
    name: 'Indonesia',
    targetGroup: 'Semi-urban & rural government clinics',
    regulatoryClimate: 'Mixed, decentralized',
    infraWorkforce: 'Fragmented but improving',
    govtLeverage: 'Medium',
    commercialRisk: 'High',
    projectedRevenue: '₹250 cr',
    strategicNotes: [
      'Largest immediate revenue potential',
      'Big semi-urban patient base',
      'High risk of delivery failure & spoilage',
      'Very low margin and operational complexity'
    ]
  },
  {
    id: 'F',
    name: 'Myanmar',
    targetGroup: 'Rural NGO networks & aid programs',
    regulatoryClimate: 'Bureaucratic, opaque',
    infraWorkforce: 'Weak infra, aid-dependent',
    govtLeverage: 'Medium–High',
    commercialRisk: 'Very High',
    projectedRevenue: '₹115 cr',
    strategicNotes: [
      'Zero competition and first-mover edge',
      'NGO support can unlock local networks',
      'Extreme systemic and compliance risk',
      'Political instability could halt rollout'
    ]
  }
];

// Budget Allocation Functions A–F
export interface BudgetFunction {
  id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  name: string;
  description: string;
}

export const BUDGET_FUNCTIONS: BudgetFunction[] = [
  { id: 'A', name: 'Field Force Development', description: 'Hire and train medical reps, operations staff, distributor liaisons' },
  { id: 'B', name: 'Learning & Compliance', description: 'Local regulatory training, multilingual SOPs, data reporting tools' },
  { id: 'C', name: 'Market Awareness', description: 'Awareness campaigns, digital outreach, and doctor connect programs' },
  { id: 'D', name: 'Supply Chain Enablement', description: 'Warehousing, cold‑chain setup, logistics contracts' },
  { id: 'E', name: 'HealthTech Integration', description: 'Patient monitoring apps, e‑prescriptions, AI dashboards' },
  { id: 'F', name: 'Risk Mitigation Fund', description: 'Emergency pool for regulatory delays, PR backlash, or vendor failures' },
];

// Region-Based Guidance Matrix (ROI/priority hints)
// Values: 'Critical' | 'High' | 'Medium' | 'Low' | 'Medium-High' | 'Not Suitable' | 'Not Usable'
export const REGION_GUIDANCE: Record<string, Record<'A'|'B'|'C'|'D'|'E'|'F', string>> = {
  A: { A: 'Medium ROI', B: 'Medium', C: 'High', D: 'Low', E: 'Medium-High', F: 'Medium' },
  B: { A: 'High ROI', B: 'High', C: 'Medium', D: 'Critical', E: 'Low', F: 'Low' },
  C: { A: 'Very High ROI', B: 'Low', C: 'Medium', D: 'High', E: 'Not Suitable', F: 'Medium' },
  D: { A: 'Medium ROI', B: 'Medium', C: 'High', D: 'Low', E: 'High', F: 'Low-Medium' },
  E: { A: 'High ROI', B: 'Very High', C: 'Medium', D: 'High', E: 'Low', F: 'High' },
  F: { A: 'Critical', B: 'Critical', C: 'Low', D: 'Critical', E: 'Not Usable', F: 'High' },
};

// Group Configuration
export const GROUP_CONFIG = {
  MAX_GROUP_SIZE: 6,
  MIN_GROUP_SIZE: 3,
  PITCH_DURATION: 2 * 60, // seconds
  VOTING_DURATION: 3 * 60, // seconds
  CONSENSUS_TIMEOUT: 5 * 60 // seconds
};
