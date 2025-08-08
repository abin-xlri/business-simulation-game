"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GROUP_CONFIG = exports.BUDGET_ALLOCATION_WEIGHTS = exports.MARKET_SELECTION_WEIGHTS = exports.BUDGET_FUNCTIONS = exports.MARKET_COUNTRIES = void 0;
// Market Selection Countries
exports.MARKET_COUNTRIES = [
    {
        code: 'IN',
        name: 'India',
        description: 'Large emerging market with growing healthcare needs and regulatory reforms',
        marketSize: 9,
        competition: 7,
        regulatoryEase: 6,
        growthPotential: 8
    },
    {
        code: 'BR',
        name: 'Brazil',
        description: 'Latin American powerhouse with universal healthcare system',
        marketSize: 8,
        competition: 6,
        regulatoryEase: 5,
        growthPotential: 7
    },
    {
        code: 'NG',
        name: 'Nigeria',
        description: 'Fastest growing African economy with significant healthcare gaps',
        marketSize: 7,
        competition: 4,
        regulatoryEase: 3,
        growthPotential: 9
    },
    {
        code: 'VN',
        name: 'Vietnam',
        description: 'Southeast Asian market with strong manufacturing base',
        marketSize: 6,
        competition: 5,
        regulatoryEase: 7,
        growthPotential: 8
    },
    {
        code: 'MX',
        name: 'Mexico',
        description: 'North American market with trade advantages and growing middle class',
        marketSize: 7,
        competition: 8,
        regulatoryEase: 6,
        growthPotential: 6
    },
    {
        code: 'EG',
        name: 'Egypt',
        description: 'Middle Eastern market with strategic location and healthcare reforms',
        marketSize: 6,
        competition: 5,
        regulatoryEase: 4,
        growthPotential: 7
    }
];
// Budget Allocation Functions
exports.BUDGET_FUNCTIONS = [
    {
        id: 'logistics',
        name: 'Logistics & Distribution',
        description: 'Cold chain infrastructure, warehousing, and delivery networks',
        currentPriority: 1,
        urbanROI: 0.85,
        ruralROI: 1.25,
        suburbanROI: 0.95
    },
    {
        id: 'marketing',
        name: 'Marketing & Branding',
        description: 'Brand awareness, market research, and promotional campaigns',
        currentPriority: 2,
        urbanROI: 1.15,
        ruralROI: 0.75,
        suburbanROI: 1.05
    },
    {
        id: 'technology',
        name: 'Technology & Innovation',
        description: 'Digital platforms, tracking systems, and process automation',
        currentPriority: 3,
        urbanROI: 1.20,
        ruralROI: 0.60,
        suburbanROI: 1.10
    },
    {
        id: 'partnerships',
        name: 'Strategic Partnerships',
        description: 'Alliances with healthcare providers, NGOs, and local organizations',
        currentPriority: 4,
        urbanROI: 0.90,
        ruralROI: 1.40,
        suburbanROI: 1.00
    },
    {
        id: 'training',
        name: 'Training & Development',
        description: 'Staff education, skill development, and capacity building',
        currentPriority: 5,
        urbanROI: 0.80,
        ruralROI: 1.30,
        suburbanROI: 0.90
    },
    {
        id: 'quality',
        name: 'Quality Assurance',
        description: 'Compliance, monitoring, and quality control systems',
        currentPriority: 6,
        urbanROI: 1.10,
        ruralROI: 0.85,
        suburbanROI: 1.15
    }
];
// Market Selection Scoring Weights
exports.MARKET_SELECTION_WEIGHTS = {
    marketSize: 0.30,
    competition: 0.20,
    regulatoryEase: 0.25,
    growthPotential: 0.25
};
// Budget Allocation Scoring Weights
exports.BUDGET_ALLOCATION_WEIGHTS = {
    urbanROI: 0.40,
    ruralROI: 0.35,
    suburbanROI: 0.25
};
// Group Configuration
exports.GROUP_CONFIG = {
    MAX_GROUP_SIZE: 6,
    MIN_GROUP_SIZE: 3,
    PITCH_DURATION: 2 * 60, // 2 minutes in seconds
    VOTING_DURATION: 3 * 60, // 3 minutes in seconds
    CONSENSUS_TIMEOUT: 5 * 60 // 5 minutes in seconds
};
//# sourceMappingURL=groupData.js.map