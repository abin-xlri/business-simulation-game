"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_PARTNER_SCORE = exports.STRATEGIC_PRIORITIES = exports.PARTNERS = exports.MAX_SEGMENT_TIME = exports.COLD_CHAIN_PENALTY = exports.REGIONAL_MODIFIERS = exports.OPERATING_COSTS = exports.REVENUE_BY_RISK = exports.ROUTE_SEGMENTS = exports.STATIONS = void 0;
// Updated to match Business-Simulation.txt exactly
exports.STATIONS = [
    { code: 'A', name: 'Bogor', riskLevel: 'LOW', region: 'URBAN' },
    { code: 'B', name: 'Depok', riskLevel: 'MEDIUM', region: 'URBAN' },
    { code: 'C', name: 'Bandung', riskLevel: 'MEDIUM', region: 'SEMI_URBAN' },
    { code: 'D', name: 'Bekasi', riskLevel: 'HIGH', region: 'URBAN' },
    { code: 'E', name: 'Cirebon', riskLevel: 'MEDIUM', region: 'RURAL' },
    { code: 'F', name: 'Purwakarta', riskLevel: 'HIGH', region: 'SEMI_URBAN' },
    { code: 'G', name: 'Tasikmalaya', riskLevel: 'LOW', region: 'RURAL' },
    { code: 'H', name: 'Surabaya', riskLevel: 'HIGH', region: 'URBAN' },
    { code: 'I', name: 'Solo', riskLevel: 'MEDIUM', region: 'RURAL' },
    { code: 'K', name: 'Semarang', riskLevel: 'LOW', region: 'SEMI_URBAN' },
    { code: 'J', name: 'Jakarta (Depot)', riskLevel: 'MEDIUM', region: 'SEMI_URBAN' }
];
// Updated distance matrix to match document exactly
exports.ROUTE_SEGMENTS = [
    // J connections (Jakarta)
    { fromCode: 'J', toCode: 'A', distance: 40, speed: 40 },
    { fromCode: 'J', toCode: 'B', distance: 80, speed: 50 },
    { fromCode: 'J', toCode: 'C', distance: 120, speed: 55 },
    { fromCode: 'J', toCode: 'D', distance: 150, speed: 60 },
    { fromCode: 'J', toCode: 'E', distance: 160, speed: 80 },
    { fromCode: 'J', toCode: 'F', distance: 140, speed: 56 },
    { fromCode: 'J', toCode: 'G', distance: 200, speed: 80 },
    { fromCode: 'J', toCode: 'H', distance: 180, speed: 90 },
    { fromCode: 'J', toCode: 'I', distance: 185, speed: 75 },
    { fromCode: 'J', toCode: 'K', distance: 170, speed: 70 },
    // C connections (Bandung)
    { fromCode: 'C', toCode: 'B', distance: 60, speed: 60 },
    { fromCode: 'C', toCode: 'D', distance: 70, speed: 60 },
    { fromCode: 'C', toCode: 'E', distance: 110, speed: 65 },
    { fromCode: 'C', toCode: 'F', distance: 115, speed: 65 },
    { fromCode: 'C', toCode: 'G', distance: 160, speed: 65 },
    { fromCode: 'C', toCode: 'H', distance: 135, speed: 70 },
    { fromCode: 'C', toCode: 'I', distance: 130, speed: 65 },
    { fromCode: 'C', toCode: 'K', distance: 120, speed: 60 },
    // E connections (Cirebon)
    { fromCode: 'E', toCode: 'B', distance: 100, speed: 70 },
    { fromCode: 'E', toCode: 'C', distance: 110, speed: 65 },
    { fromCode: 'E', toCode: 'D', distance: 90, speed: 60 },
    { fromCode: 'E', toCode: 'F', distance: 100, speed: 80 },
    { fromCode: 'E', toCode: 'G', distance: 100, speed: 60 },
    { fromCode: 'E', toCode: 'H', distance: 130, speed: 65 },
    { fromCode: 'E', toCode: 'I', distance: 105, speed: 70 },
    { fromCode: 'E', toCode: 'K', distance: 115, speed: 60 },
    // F connections (Purwakarta)
    { fromCode: 'F', toCode: 'B', distance: 110, speed: 65 },
    { fromCode: 'F', toCode: 'C', distance: 115, speed: 65 },
    { fromCode: 'F', toCode: 'D', distance: 120, speed: 60 },
    { fromCode: 'F', toCode: 'E', distance: 100, speed: 80 },
    { fromCode: 'F', toCode: 'G', distance: 120, speed: 80 },
    { fromCode: 'F', toCode: 'H', distance: 110, speed: 60 },
    { fromCode: 'F', toCode: 'I', distance: 120, speed: 65 },
    { fromCode: 'F', toCode: 'K', distance: 115, speed: 60 },
    // H connections (Surabaya)
    { fromCode: 'H', toCode: 'A', distance: 90, speed: 60 },
    { fromCode: 'H', toCode: 'B', distance: 140, speed: 75 },
    { fromCode: 'H', toCode: 'C', distance: 135, speed: 70 },
    { fromCode: 'H', toCode: 'D', distance: 110, speed: 55 },
    { fromCode: 'H', toCode: 'E', distance: 130, speed: 65 },
    { fromCode: 'H', toCode: 'F', distance: 110, speed: 60 },
    { fromCode: 'H', toCode: 'G', distance: 130, speed: 65 },
    { fromCode: 'H', toCode: 'I', distance: 150, speed: 70 },
    { fromCode: 'H', toCode: 'K', distance: 150, speed: 75 }
];
// Updated revenue structure to match document
exports.REVENUE_BY_RISK = {
    LOW: 180000, // ₹1,80,000
    MEDIUM: 275000, // ₹2,75,000  
    HIGH: 350000, // ₹3,50,000
    CRITICAL: 500000 // ₹5,00,000
};
// Updated operating costs to match document
exports.OPERATING_COSTS = {
    FUEL_COST_PER_KM: 70, // ₹70 per km
    VAN_OPERATING_COST_PER_HOUR: 5000, // ₹5,000 per hour
    COLD_CHAIN_PENALTY: 100000, // ₹1,00,000 per breach
    URBAN_MODIFIER: -20000, // -₹20,000 per Urban stop
    RURAL_MODIFIER: 50000 // +₹50,000 per Rural stop
};
// Regional modifiers (in ₹ per stop)
exports.REGIONAL_MODIFIERS = {
    URBAN: -20000, // -20k per stop
    RURAL: 50000, // +50k per stop
    SEMI_URBAN: 0, // No modifier
};
// Cold chain penalty (in ₹)
exports.COLD_CHAIN_PENALTY = 100000; // ₹100,000 per breach
exports.MAX_SEGMENT_TIME = 2; // hours
exports.PARTNERS = [
    {
        id: 'A',
        name: 'VitaReach NGO',
        description: 'Non-profit with rural focus and strong community trust; some infra upgrades needed.',
        criteria: {
            networkCoverage: 12,
            speedOfOnboardingDays: 20,
            coldChainInfraScore: 6, // moderate
            communityTrustScore: 9,
            moHCoordinationScore: 8, // active coordination
            dataReportingScore: 4, // manual->excel
            operationalRiskScore: 4, // one hub failed audit (lower is better)
            scalabilityYear2Score: 5, // needs infra investment
            biologicsExperienceScore: 9, // high
            costPerPatient: 950,
            mediaPoliticalRiskScore: 3 // minor misreporting cleared (lower better)
        }
    },
    {
        id: 'B',
        name: 'MedAxis Corp',
        description: 'Urban-heavy corp; fully ready cold-chain; strong tech, higher costs and lobbying pushback.',
        criteria: {
            networkCoverage: 7,
            speedOfOnboardingDays: 12,
            coldChainInfraScore: 10,
            communityTrustScore: 5, // low-moderate
            moHCoordinationScore: 4, // flagged for lobbying
            dataReportingScore: 10, // API real-time
            operationalRiskScore: 3, // attrition/strike (lower better)
            scalabilityYear2Score: 9, // pan-national
            biologicsExperienceScore: 3, // first biologics
            costPerPatient: 1250,
            mediaPoliticalRiskScore: 5 // pushback
        }
    },
    {
        id: 'C',
        name: 'HealthBridge Co-op',
        description: 'Co-op with local partnerships; needs support in 5 cold-chain locations; low cost.',
        criteria: {
            networkCoverage: 10,
            speedOfOnboardingDays: 25,
            coldChainInfraScore: 5,
            communityTrustScore: 7, // only in co-op zones
            moHCoordinationScore: 3, // not present in forums
            dataReportingScore: 5, // weekly PDF
            operationalRiskScore: 6, // aging fleet
            scalabilityYear2Score: 6, // moderate
            biologicsExperienceScore: 6, // medium
            costPerPatient: 850,
            mediaPoliticalRiskScore: 2 // not visible
        }
    },
    {
        id: 'D',
        name: 'Regenera Foundation',
        description: 'Strong MoH ties; mostly ready; some resistance in southern districts; grant conditionality.',
        criteria: {
            networkCoverage: 8,
            speedOfOnboardingDays: 18,
            coldChainInfraScore: 8,
            communityTrustScore: 6, // some resistance
            moHCoordinationScore: 9, // strong ties
            dataReportingScore: 6, // offline dashboard w/ lag
            operationalRiskScore: 5, // dependent on grant continuity
            scalabilityYear2Score: 8, // eligible for multilateral grants
            biologicsExperienceScore: 9, // high support in SE Asia
            costPerPatient: 1000,
            mediaPoliticalRiskScore: 6 // accused of leaning in 1 region
        }
    }
];
// Strategic priorities for scoring (weights)
// Script-aligned weights (cost secondary to speed/compliance/traceability/MoH)
exports.STRATEGIC_PRIORITIES = {
    speedOfOnboarding: 0.18,
    moHCoordination: 0.18,
    dataReporting: 0.12,
    coldChainInfra: 0.12,
    communityTrust: 0.12,
    scalabilityYear2: 0.10,
    biologicsExperience: 0.08,
    mediaPoliticalRisk: 0.05,
    networkCoverage: 0.03,
    costPerPatient: 0.02
};
// Maximum possible score
exports.MAX_PARTNER_SCORE = 10;
//# sourceMappingURL=round1Data.js.map