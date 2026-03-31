const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financial.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// All financial routes require treasurer or admin role
router.use(auth);
router.use(role('TREASURER', 'ADMIN'));

// Income analytics routes
router.get('/income-analytics', financialController.getIncomeAnalytics);

// Expense analytics routes
router.get('/expense-analytics', financialController.getExpenseAnalytics);

// Budget variance analysis
router.get('/budget-variance', financialController.getBudgetVarianceWithAlerts);

// Chart data for visualizations
router.get('/chart-data', financialController.getChartData);

// Profit analysis (combined income and expense)
router.get('/profit-analysis', financialController.getProfitAnalysis);

// Financial dashboard summary
router.get('/summary', financialController.getFinancialSummary);

module.exports = router;