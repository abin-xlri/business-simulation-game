import { Request, Response } from 'express';
export declare const getPartners: (req: Request, res: Response) => Promise<void>;
export declare const calculatePartnerScores: (req: Request, res: Response) => Promise<void>;
export declare const submitPartnerSelection: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPartnerSelection: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=partnerSelectionController.d.ts.map