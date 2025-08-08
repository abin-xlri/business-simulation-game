import { Request, Response } from 'express';
export declare const createGroup: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const joinGroup: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getGroup: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getGroups: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const sendMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMessages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMarketData: (req: Request, res: Response) => Promise<void>;
export declare const getBudgetData: (req: Request, res: Response) => Promise<void>;
export declare const submitMarketDecision: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const submitBudgetOrdering: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=groupController.d.ts.map