import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  STATIONS,
  ROUTE_SEGMENTS,
  REVENUE_BY_RISK,
  REGIONAL_MODIFIERS,
  OPERATING_COSTS,
  COLD_CHAIN_PENALTY,
  MAX_SEGMENT_TIME
} from '../constants/round1Data';
import { Station, RouteSegment } from '../../shared/types/round1';

const prisma = new PrismaClient();

interface RouteCalculationResult {
  totalDistance: number;
  totalTime: number;
  coldChainBreaches: number;
  baseRevenue: number;
  regionalModifier: number;
  operatingCosts: number;
  penalties: number;
  netProfit: number;
  segments: Array<{
    from: string;
    to: string;
    distance: number;
    time: number;
    isBreach: boolean;
  }>;
}



export const calculateRoute = async (req: Request, res: Response) => {
  try {
    const { route } = req.body;
    const userId = (req as any).user?.userId;

    if (!route || !Array.isArray(route) || route.length < 2) {
      return res.status(400).json({
        error: 'Invalid route. Must be an array with at least 2 stations.'
      });
    }

    // Validate that all stations in route exist
    const validStations = STATIONS.map(s => s.code);
    for (const stationCode of route) {
      if (!validStations.includes(stationCode)) {
        return res.status(400).json({
          error: `Invalid station code: ${stationCode}`
        });
      }
    }

    // Validate route: starts and ends with J, 4 unique stations, etc.
    if (!route || !Array.isArray(route) || route.length !== 6 || route[0] !== 'J' || route[5] !== 'J') {
      return res.status(400).json({ error: 'Invalid route' });
    }
    const deliveryStations = route.slice(1,5);
    if (new Set(deliveryStations).size !== 4) {
      return res.status(400).json({ error: 'Must visit 4 unique stations' });
    }

    // Calculate distances, times, breaches, revenues, costs, profit
    let totalDistance = 0;
    let totalTime = 0;
    let coldChainBreaches = 0;
    let baseRevenue = 0;
    let regionalModifier = 0;
    let operatingCosts = 0;
    let penalties = 0;

    // Loop through segments
    for (let i = 0; i < route.length - 1; i++) {
      const from = route[i];
      const to = route[i + 1];
      
      // Find segment data
      const segment = ROUTE_SEGMENTS.find(
        s => (s.fromCode === from && s.toCode === to) ||
             (s.fromCode === to && s.toCode === from)
      );

      if (!segment) {
        return res.status(400).json({
          error: `No route segment found between ${from} and ${to}`
        });
      }

      totalDistance += segment.distance;
      const travelTime = segment.distance / segment.speed;
      totalTime += travelTime;

      // Add delivery time if not return to J
      if (to !== 'J') {
        totalTime += 0.5; // 30 minutes
      }

      // Cold chain breach check (only if followed by delivery)
      if (travelTime > MAX_SEGMENT_TIME && to !== 'J') {
        coldChainBreaches++;
        penalties += COLD_CHAIN_PENALTY;
      }

      // Revenue if delivery stop
      if (to !== 'J') {
        const station = STATIONS.find(s => s.code === to);
        if (station) {
          baseRevenue += REVENUE_BY_RISK[station.riskLevel];
          regionalModifier += REGIONAL_MODIFIERS[station.region];
        }
      }
    }

    // Enforce 10-hour total route time limit (driving + stops)
    if (totalTime > 10) {
      return res.status(400).json({ error: 'Total round-trip time exceeds 10 hours' });
    }

    // Operating costs
    const fuelCost = totalDistance * OPERATING_COSTS.FUEL_COST_PER_KM;
    const vanCost = Math.ceil(totalTime * 4) / 4 * OPERATING_COSTS.VAN_OPERATING_COST_PER_HOUR; // Round up to 15 mins
    operatingCosts = fuelCost + vanCost;

    const netProfit = baseRevenue + regionalModifier - operatingCosts - penalties;

    // Get user's current session
    const userSession = await prisma.userSession.findFirst({
      where: { userId: (req as any).user.userId },
      select: { sessionId: true }
    });

    if (!userSession) {
      return res.status(400).json({ error: 'No active session found' });
    }

    // Save to prisma
    const calculation = await prisma.routeCalculation.create({
      data: {
        userId: (req as any).user.userId,
        sessionId: userSession.sessionId,
        route,
        totalDistance,
        totalTime,
        coldChainBreaches,
        baseRevenue,
        regionalModifier,
        operatingCosts,
        penalties,
        netProfit
      }
    });

    res.json(calculation);

  } catch (error) {
    console.error('Route calculation error:', error);
    res.status(500).json({
      error: 'Internal server error during route calculation'
    });
  }
};

// Implement getStations
export const getStations = async (req: Request, res: Response) => {
  res.json(STATIONS);
};

// Implement getRouteSegments
export const getRouteSegments = async (req: Request, res: Response) => {
  res.json(ROUTE_SEGMENTS);
};

export function calculateRouteMetrics(route: string[]): RouteCalculationResult {
  let totalDistance = 0;
  let totalTime = 0;
  let coldChainBreaches = 0;
  let baseRevenue = 0;
  let regionalModifier = 0;
  const segments: Array<{
    from: string;
    to: string;
    distance: number;
    time: number;
    isBreach: boolean;
  }> = [];

  // Calculate each segment
  for (let i = 0; i < route.length - 1; i++) {
    const fromCode = route[i];
    const toCode = route[i + 1];
    const isLastSegment = i === route.length - 2;

    // Find segment data
    const segment = ROUTE_SEGMENTS.find(
      s => (s.fromCode === fromCode && s.toCode === toCode) ||
           (s.fromCode === toCode && s.toCode === fromCode)
    );

    if (!segment) {
      throw new Error(`No route segment found between ${fromCode} and ${toCode}`);
    }

    const time = segment.distance / segment.speed;
    // Cold chain breach: segment > 2 hours followed by delivery (not return to depot)
    const isBreach = time > MAX_SEGMENT_TIME && !isLastSegment;

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

  // Calculate revenue based on the four delivery stops only (exclude J and final return)
  const deliveryStops = route.slice(1, route.length - 1);
  for (const stationCode of deliveryStops) {
    const station = STATIONS.find(s => s.code === stationCode);
    if (station) {
      baseRevenue += REVENUE_BY_RISK[station.riskLevel];
      regionalModifier += REGIONAL_MODIFIERS[station.region];
    }
  }

  // Calculate operating costs
  // Van cost: round up to nearest 15 minutes (0.25 hours)
  const vanTimeHours = Math.ceil(totalTime * 4) / 4; // Round up to nearest 0.25 hours
  const operatingCosts = (totalDistance * OPERATING_COSTS.FUEL_COST_PER_KM) +
                        (vanTimeHours * OPERATING_COSTS.VAN_OPERATING_COST_PER_HOUR);

  // Calculate penalties
  const penalties = coldChainBreaches * COLD_CHAIN_PENALTY;

  // Calculate net profit
  const netProfit = baseRevenue + regionalModifier - operatingCosts - penalties;

  const result: RouteCalculationResult = {
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

  return result;
} 