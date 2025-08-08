import { Request, Response } from 'express';
export declare class CompanyController {
    getAllCompanies(req: Request, res: Response): Promise<void>;
    getCompanyById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createCompany(req: Request, res: Response): Promise<void>;
    updateCompany(req: Request, res: Response): Promise<void>;
    deleteCompany(req: Request, res: Response): Promise<void>;
    hireEmployee(req: Request, res: Response): Promise<void>;
    fireEmployee(req: Request, res: Response): Promise<void>;
    investInCompany(req: Request, res: Response): Promise<void>;
    startResearch(req: Request, res: Response): Promise<void>;
    startMarketing(req: Request, res: Response): Promise<void>;
    getCompanyFinancials(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=companyController.d.ts.map