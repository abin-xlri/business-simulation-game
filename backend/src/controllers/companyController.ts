import { Request, Response } from 'express';
import { Company, ApiResponse } from '../../shared/types/company';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CompanyController {
  async getAllCompanies(req: Request, res: Response) {
    try {
      const companies = await prisma.company.findMany({
        include: {
          player: true,
          products: true,
          employees: true,
          facilities: true
        }
      });
      
      // Transform to match Company interface
      const transformedCompanies: Company[] = companies.map(company => ({
        id: company.id,
        name: company.name,
        industry: company.industry,
        size: 'MEDIUM', // Default size since it's not in schema
        revenue: company.products.reduce((sum, product) => sum + (product.price * product.demand), 0),
        employees: company.employees.length,
        location: 'Unknown', // Not in schema
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }));
      
      const response: ApiResponse<Company[]> = {
        success: true,
        data: transformedCompanies
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch companies'
      });
    }
  }

  async getCompanyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          player: true,
          products: true,
          employees: true,
          facilities: true
        }
      });
      
      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        });
      }
      
      // Transform to match Company interface
      const transformedCompany: Company = {
        id: company.id,
        name: company.name,
        industry: company.industry,
        size: 'MEDIUM', // Default size since it's not in schema
        revenue: company.products.reduce((sum, product) => sum + (product.price * product.demand), 0),
        employees: company.employees.length,
        location: 'Unknown', // Not in schema
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      };
      
      const response: ApiResponse<Company> = {
        success: true,
        data: transformedCompany
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch company'
      });
    }
  }

  async createCompany(req: Request, res: Response) {
    try {
      const companyData = req.body;
      
      const newCompany = await prisma.company.create({
        data: {
          name: companyData.name,
          industry: companyData.industry,
          player: companyData.playerId ? {
            connect: { id: companyData.playerId }
          } : undefined
        },
        include: {
          player: true,
          products: true,
          employees: true,
          facilities: true
        }
      });
      
      // Transform to match Company interface
      const transformedCompany: Company = {
        id: newCompany.id,
        name: newCompany.name,
        industry: newCompany.industry,
        size: 'MEDIUM',
        revenue: 0,
        employees: 0,
        location: 'Unknown',
        createdAt: newCompany.createdAt,
        updatedAt: newCompany.updatedAt
      };
      
      const response: ApiResponse<Company> = {
        success: true,
        data: transformedCompany,
        message: 'Company created successfully'
      };
      
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create company'
      });
    }
  }

  async updateCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedCompany = await prisma.company.update({
        where: { id },
        data: {
          name: updateData.name,
          industry: updateData.industry
        },
        include: {
          player: true,
          products: true,
          employees: true,
          facilities: true
        }
      });
      
      // Transform to match Company interface
      const transformedCompany: Company = {
        id: updatedCompany.id,
        name: updatedCompany.name,
        industry: updatedCompany.industry,
        size: 'MEDIUM',
        revenue: updatedCompany.products.reduce((sum, product) => sum + (product.price * product.demand), 0),
        employees: updatedCompany.employees.length,
        location: 'Unknown',
        createdAt: updatedCompany.createdAt,
        updatedAt: updatedCompany.updatedAt
      };
      
      const response: ApiResponse<Company> = {
        success: true,
        data: transformedCompany,
        message: 'Company updated successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update company'
      });
    }
  }

  async deleteCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.company.delete({
        where: { id }
      });
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Company deleted successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete company'
      });
    }
  }

  async hireEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const employeeData = req.body;
      
      const employee = await prisma.employee.create({
        data: {
          name: employeeData.name,
          position: employeeData.position,
          salary: employeeData.salary,
          company: {
            connect: { id }
          }
        }
      });
      
      const response: ApiResponse<any> = {
        success: true,
        data: employee,
        message: 'Employee hired successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to hire employee'
      });
    }
  }

  async fireEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { employeeId } = req.body;
      
      await prisma.employee.delete({
        where: { id: employeeId }
      });
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Employee fired successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fire employee'
      });
    }
  }

  async investInCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { amount, type } = req.body;
      
      // Update player balance (assuming investment comes from player)
      if (req.body.playerId) {
        await prisma.player.update({
          where: { id: req.body.playerId },
          data: {
            balance: {
              decrement: amount
            }
          }
        });
      }
      
      // Create investment record (you might want to add an Investment model)
      const response: ApiResponse<null> = {
        success: true,
        message: 'Investment made successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to make investment'
      });
    }
  }

  async startResearch(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const researchData = req.body;
      
      const researchProject = await prisma.researchProject.create({
        data: {
          name: researchData.name,
          budget: researchData.budget,
          expectedCompletion: new Date(Date.now() + researchData.duration * 24 * 60 * 60 * 1000), // Convert days to milliseconds
          research: {
            connect: { companyId: id }
          }
        }
      });
      
      const response: ApiResponse<any> = {
        success: true,
        data: researchProject,
        message: 'Research project started successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to start research project'
      });
    }
  }

  async startMarketing(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const marketingData = req.body;
      
      const marketingCampaign = await prisma.marketingCampaign.create({
        data: {
          name: marketingData.name,
          budget: marketingData.budget,
          startDate: new Date(),
          endDate: new Date(Date.now() + marketingData.duration * 24 * 60 * 60 * 1000), // Convert days to milliseconds
          targetAudience: marketingData.targetAudience,
          marketing: {
            connect: { companyId: id }
          }
        }
      });
      
      const response: ApiResponse<any> = {
        success: true,
        data: marketingCampaign,
        message: 'Marketing campaign started successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to start marketing campaign'
      });
    }
  }

  async getCompanyFinancials(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          products: true,
          employees: true,
          facilities: true
        }
      });
      
      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        });
      }
      
      // Calculate financials based on company data
      const employeeSalaries = company.employees.reduce((sum: number, emp) => sum + emp.salary, 0);
      const revenue = company.products.reduce((sum: number, product) => sum + (product.price * product.demand), 0);
      const assets = company.facilities.reduce((sum: number, facility) => sum + facility.maintenanceCost, 0);
      
      const financials = {
        revenue,
        expenses: employeeSalaries,
        profit: revenue - employeeSalaries,
        assets,
        liabilities: 0, // Could be calculated based on loans/credit
        equity: 0 // Could be calculated based on player investments
      };
      
      const response: ApiResponse<any> = {
        success: true,
        data: financials
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch company financials'
      });
    }
  }
} 


