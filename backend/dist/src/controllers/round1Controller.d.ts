import { Request, Response } from 'express';
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
export declare const calculateRoute: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getStations: (req: Request, res: Response) => Promise<void>;
export declare const getRouteSegments: (req: Request, res: Response) => Promise<void>;
export declare function calculateRouteMetrics(route: string[]): RouteCalculationResult;
export {};
//# sourceMappingURL=round1Controller.d.ts.map