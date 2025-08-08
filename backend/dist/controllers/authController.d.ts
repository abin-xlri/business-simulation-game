import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createSession: (req: Request, res: Response) => Promise<void>;
export declare const joinSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCurrentSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const validateRegister: import("express-validator").ValidationChain[];
export declare const validateLogin: import("express-validator").ValidationChain[];
export declare const validateCreateSession: import("express-validator").ValidationChain[];
export declare const validateJoinSession: import("express-validator").ValidationChain[];
//# sourceMappingURL=authController.d.ts.map