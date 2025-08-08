"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouteSegments = exports.getStations = exports.calculateRoute = void 0;
exports.calculateRouteMetrics = calculateRouteMetrics;
const client_1 = require("@prisma/client");
const round1Data_1 = require("../constants/round1Data");
const prisma = new client_1.PrismaClient();
const calculateRoute = async (req, res) => {
    try {
        const { route } = req.body;
        const userId = req.user?.userId;
        if (!route || !Array.isArray(route) || route.length < 2) {
            return res.status(400).json({
                error: 'Invalid route. Must be an array with at least 2 stations.'
            });
        }
        // Validate that all stations in route exist
        const validStations = round1Data_1.STATIONS.map(s => s.code);
        for (const stationCode of route) {
            if (!validStations.includes(stationCode)) {
                return res.status(400).json({
                    error: `Invalid station code: ${stationCode}`
                });
            }
        }
        // Calculate route metrics
        const result = calculateRouteMetrics(route);
        // Save calculation to database if user is authenticated
        if (userId) {
            try {
                const userSession = await prisma.userSession.findFirst({
                    where: { userId },
                    include: { session: true }
                });
                if (userSession) {
                    await prisma.routeCalculation.create({
                        data: {
                            userId,
                            sessionId: userSession.sessionId,
                            route,
                            totalDistance: result.totalDistance,
                            totalTime: result.totalTime,
                            coldChainBreaches: result.coldChainBreaches,
                            baseRevenue: result.baseRevenue,
                            regionalModifier: result.regionalModifier,
                            operatingCosts: result.operatingCosts,
                            penalties: result.penalties,
                            netProfit: result.netProfit,
                        }
                    });
                }
            }
            catch (dbError) {
                console.error('Failed to save route calculation:', dbError);
                // Don't fail the request if database save fails
            }
        }
        res.json({
            success: true,
            calculation: result
        });
    }
    catch (error) {
        console.error('Route calculation error:', error);
        res.status(500).json({
            error: 'Internal server error during route calculation'
        });
    }
};
exports.calculateRoute = calculateRoute;
const getStations = async (req, res) => {
    try {
        res.json({
            success: true,
            stations: round1Data_1.STATIONS
        });
    }
    catch (error) {
        console.error('Get stations error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching stations'
        });
    }
};
exports.getStations = getStations;
const getRouteSegments = async (req, res) => {
    try {
        res.json({
            success: true,
            segments: round1Data_1.ROUTE_SEGMENTS
        });
    }
    catch (error) {
        console.error('Get route segments error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching route segments'
        });
    }
};
exports.getRouteSegments = getRouteSegments;
function calculateRouteMetrics(route) {
    let totalDistance = 0;
    let totalTime = 0;
    let coldChainBreaches = 0;
    let baseRevenue = 0;
    let regionalModifier = 0;
    const segments = [];
    // Calculate each segment
    for (let i = 0; i < route.length - 1; i++) {
        const fromCode = route[i];
        const toCode = route[i + 1];
        const isLastSegment = i === route.length - 2;
        // Find segment data
        const segment = round1Data_1.ROUTE_SEGMENTS.find(s => (s.fromCode === fromCode && s.toCode === toCode) ||
            (s.fromCode === toCode && s.toCode === fromCode));
        if (!segment) {
            throw new Error(`No route segment found between ${fromCode} and ${toCode}`);
        }
        const time = segment.distance / segment.speed;
        // Cold chain breach: segment > 2 hours followed by delivery (not return to depot)
        const isBreach = time > round1Data_1.MAX_SEGMENT_TIME && !isLastSegment;
        segments.push({
            from: fromCode,
            to: toCode,
            distance: segment.distance,
            time,
            isBreach
        });
        totalDistance += segment.distance;
        totalTime += time;
        if (isBreach) {
            coldChainBreaches++;
        }
    }
    // Calculate revenue based on visited stations (excluding start/end if same)
    const visitedStations = new Set(route);
    for (const stationCode of visitedStations) {
        const station = round1Data_1.STATIONS.find(s => s.code === stationCode);
        if (station) {
            baseRevenue += round1Data_1.REVENUE_BY_RISK[station.riskLevel];
            regionalModifier += round1Data_1.REGIONAL_MODIFIERS[station.region];
        }
    }
    // Calculate operating costs
    // Van cost: round up to nearest 15 minutes (0.25 hours)
    const vanTimeHours = Math.ceil(totalTime * 4) / 4; // Round up to nearest 0.25 hours
    const operatingCosts = (totalDistance * round1Data_1.OPERATING_COSTS.FUEL_PER_KM) +
        (vanTimeHours * round1Data_1.OPERATING_COSTS.VAN_TIME_PER_HOUR);
    // Calculate penalties
    const penalties = coldChainBreaches * round1Data_1.COLD_CHAIN_PENALTY;
    // Calculate net profit
    const netProfit = baseRevenue + regionalModifier - operatingCosts - penalties;
    return {
        totalDistance,
        totalTime,
        coldChainBreaches,
        baseRevenue,
        regionalModifier,
        operatingCosts,
        penalties,
        netProfit,
        segments
    };
}
//# sourceMappingURL=round1Controller.js.map