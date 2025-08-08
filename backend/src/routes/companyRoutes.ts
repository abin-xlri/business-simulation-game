import { Router } from 'express';
import { CompanyController } from '../controllers/companyController';

const router = Router();
const companyController = new CompanyController();

// GET /api/companies - Get all companies
router.get('/', companyController.getAllCompanies);

// GET /api/companies/:id - Get company by ID
router.get('/:id', companyController.getCompanyById);

// POST /api/companies - Create new company
router.post('/', companyController.createCompany);

// PUT /api/companies/:id - Update company
router.put('/:id', companyController.updateCompany);

// DELETE /api/companies/:id - Delete company
router.delete('/:id', companyController.deleteCompany);

// POST /api/companies/:id/hire - Hire employee
router.post('/:id/hire', companyController.hireEmployee);

// POST /api/companies/:id/fire - Fire employee
router.post('/:id/fire', companyController.fireEmployee);

// POST /api/companies/:id/invest - Invest in company
router.post('/:id/invest', companyController.investInCompany);

// POST /api/companies/:id/research - Start research project
router.post('/:id/research', companyController.startResearch);

// POST /api/companies/:id/marketing - Start marketing campaign
router.post('/:id/marketing', companyController.startMarketing);

// GET /api/companies/:id/financials - Get company financials
router.get('/:id/financials', companyController.getCompanyFinancials);

export default router; 