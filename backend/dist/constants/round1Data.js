"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_PARTNER_SCORE = exports.STRATEGIC_PRIORITIES = exports.PARTNERS = exports.MAX_SEGMENT_TIME = exports.COLD_CHAIN_PENALTY = exports.OPERATING_COSTS = exports.REGIONAL_MODIFIERS = exports.REVENUE_BY_RISK = exports.ROUTE_SEGMENTS = exports.STATIONS = void 0;
// Station data
exports.STATIONS = [
    { code: 'A', name: 'Central Hub', riskLevel: 'LOW', region: 'URBAN' },
    { code: 'B', name: 'North Terminal', riskLevel: 'MEDIUM', region: 'SUBURBAN' },
    { code: 'C', name: 'South Depot', riskLevel: 'HIGH', region: 'RURAL' },
    { code: 'D', name: 'East Station', riskLevel: 'MEDIUM', region: 'URBAN' },
    { code: 'E', name: 'West Center', riskLevel: 'CRITICAL', region: 'RURAL' },
    { code: 'F', name: 'Downtown Hub', riskLevel: 'LOW', region: 'URBAN' },
    { code: 'G', name: 'Industrial Zone', riskLevel: 'HIGH', region: 'SUBURBAN' },
    { code: 'H', name: 'Port Terminal', riskLevel: 'CRITICAL', region: 'URBAN' },
    { code: 'I', name: 'Airport Cargo', riskLevel: 'HIGH', region: 'SUBURBAN' },
    { code: 'J', name: 'Distribution Center', riskLevel: 'LOW', region: 'URBAN' },
];
// Distance and speed matrix (symmetric)
exports.ROUTE_SEGMENTS = [
    // A connections
    { fromCode: 'A', toCode: 'B', distance: 25, speed: 60 },
    { fromCode: 'A', toCode: 'C', distance: 45, speed: 50 },
    { fromCode: 'A', toCode: 'D', distance: 30, speed: 55 },
    { fromCode: 'A', toCode: 'E', distance: 60, speed: 45 },
    { fromCode: 'A', toCode: 'F', distance: 15, speed: 65 },
    { fromCode: 'A', toCode: 'G', distance: 35, speed: 55 },
    { fromCode: 'A', toCode: 'H', distance: 40, speed: 50 },
    { fromCode: 'A', toCode: 'I', distance: 50, speed: 45 },
    { fromCode: 'A', toCode: 'J', distance: 20, speed: 60 },
    // B connections
    { fromCode: 'B', toCode: 'C', distance: 55, speed: 45 },
    { fromCode: 'B', toCode: 'D', distance: 40, speed: 55 },
    { fromCode: 'B', toCode: 'E', distance: 70, speed: 40 },
    { fromCode: 'B', toCode: 'F', distance: 35, speed: 60 },
    { fromCode: 'B', toCode: 'G', distance: 45, speed: 50 },
    { fromCode: 'B', toCode: 'H', distance: 50, speed: 45 },
    { fromCode: 'B', toCode: 'I', distance: 60, speed: 40 },
    { fromCode: 'B', toCode: 'J', distance: 30, speed: 55 },
    // C connections
    { fromCode: 'C', toCode: 'D', distance: 65, speed: 40 },
    { fromCode: 'C', toCode: 'E', distance: 80, speed: 35 },
    { fromCode: 'C', toCode: 'F', distance: 50, speed: 50 },
    { fromCode: 'C', toCode: 'G', distance: 60, speed: 45 },
    { fromCode: 'C', toCode: 'H', distance: 70, speed: 40 },
    { fromCode: 'C', toCode: 'I', distance: 75, speed: 35 },
    { fromCode: 'C', toCode: 'J', distance: 55, speed: 45 },
    // D connections
    { fromCode: 'D', toCode: 'E', distance: 75, speed: 40 },
    { fromCode: 'D', toCode: 'F', distance: 25, speed: 60 },
    { fromCode: 'D', toCode: 'G', distance: 45, speed: 50 },
    { fromCode: 'D', toCode: 'H', distance: 35, speed: 55 },
    { fromCode: 'D', toCode: 'I', distance: 55, speed: 45 },
    { fromCode: 'D', toCode: 'J', distance: 40, speed: 55 },
    // E connections
    { fromCode: 'E', toCode: 'F', distance: 65, speed: 40 },
    { fromCode: 'E', toCode: 'G', distance: 55, speed: 45 },
    { fromCode: 'E', toCode: 'H', distance: 80, speed: 35 },
    { fromCode: 'E', toCode: 'I', distance: 70, speed: 40 },
    { fromCode: 'E', toCode: 'J', distance: 70, speed: 40 },
    // F connections
    { fromCode: 'F', toCode: 'G', distance: 30, speed: 60 },
    { fromCode: 'F', toCode: 'H', distance: 35, speed: 55 },
    { fromCode: 'F', toCode: 'I', distance: 45, speed: 50 },
    { fromCode: 'F', toCode: 'J', distance: 25, speed: 60 },
    // G connections
    { fromCode: 'G', toCode: 'H', distance: 45, speed: 50 },
    { fromCode: 'G', toCode: 'I', distance: 35, speed: 55 },
    { fromCode: 'G', toCode: 'J', distance: 40, speed: 55 },
    // H connections
    { fromCode: 'H', toCode: 'I', distance: 50, speed: 45 },
    { fromCode: 'H', toCode: 'J', distance: 45, speed: 50 },
    // I connections
    { fromCode: 'I', toCode: 'J', distance: 55, speed: 45 },
];
// Revenue by risk level (in ₹)
exports.REVENUE_BY_RISK = {
    LOW: 180000, // 180k
    MEDIUM: 275000, // 275k
    HIGH: 350000, // 350k
    CRITICAL: 500000, // Keep critical for completeness
};
// Regional modifiers (in ₹ per stop)
exports.REGIONAL_MODIFIERS = {
    URBAN: -20000, // -20k per stop
    RURAL: 50000, // +50k per stop
    SUBURBAN: 0, // No modifier
};
// Operating costs
exports.OPERATING_COSTS = {
    FUEL_PER_KM: 70, // ₹70 per km
    VAN_TIME_PER_HOUR: 5000, // ₹5000 per hour
};
// Cold chain penalty (in ₹)
exports.COLD_CHAIN_PENALTY = 100000; // ₹100,000 per breach
exports.MAX_SEGMENT_TIME = 2; // hours
exports.PARTNERS = [
    {
        id: 'A',
        name: 'VitaReach NGO',
        description: 'Non-profit organization with extensive rural healthcare network and community trust.',
        criteria: {
            reach: 9,
            expertise: 7,
            cost: 8,
            reliability: 8,
            scalability: 6,
            innovation: 5
        }
    },
    {
        id: 'B',
        name: 'MedAxis Corp',
        description: 'Large pharmaceutical corporation with advanced logistics and research capabilities.',
        criteria: {
            reach: 7,
            expertise: 9,
            cost: 4,
            reliability: 9,
            scalability: 9,
            innovation: 8
        }
    },
    {
        id: 'C',
        name: 'HealthBridge Co-op',
        description: 'Healthcare cooperative with strong local partnerships and sustainable practices.',
        criteria: {
            reach: 6,
            expertise: 6,
            cost: 9,
            reliability: 7,
            scalability: 7,
            innovation: 6
        }
    },
    {
        id: 'D',
        name: 'Regenera Foundation',
        description: 'Research-focused foundation with cutting-edge technology and global connections.',
        criteria: {
            reach: 5,
            expertise: 10,
            cost: 3,
            reliability: 6,
            scalability: 8,
            innovation: 10
        }
    }
];
// Strategic priorities for scoring (weights)
exports.STRATEGIC_PRIORITIES = {
    reach: 0.25, // 25% weight
    expertise: 0.20, // 20% weight
    cost: 0.15, // 15% weight
    reliability: 0.20, // 20% weight
    scalability: 0.10, // 10% weight
    innovation: 0.10 // 10% weight
};
// Maximum possible score
exports.MAX_PARTNER_SCORE = 10;
//# sourceMappingURL=round1Data.js.map