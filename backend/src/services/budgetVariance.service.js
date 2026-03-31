const Event = require('../models/Events');

class BudgetVarianceService {
  async getBudgetVarianceWithAlerts() {
    try {
      const events = await Event.find({
        $and: [
          { total_budget: { $exists: true, $gt: 0 } },
          { 'logistics.total_expense': { $exists: true, $gt: 0 } }
        ]
      });

      const varianceData = events.map(event => {
        const plannedBudget = event.total_budget;
        const actualExpense = event.logistics.total_expense;
        const variance = plannedBudget - actualExpense;
        const variancePercentage = plannedBudget > 0 ? (variance / plannedBudget) * 100 : 0;

        let alertLevel = 'none';
        let alertMessage = '';

        if (variancePercentage < -20) {
          alertLevel = 'critical';
          alertMessage = `Critical: ${Math.abs(variancePercentage).toFixed(1)}% over budget`;
        } else if (variancePercentage < -10) {
          alertLevel = 'high';
          alertMessage = `High: ${Math.abs(variancePercentage).toFixed(1)}% over budget`;
        } else if (variancePercentage < 0) {
          alertLevel = 'medium';
          alertMessage = `Medium: ${Math.abs(variancePercentage).toFixed(1)}% over budget`;
        }

        return {
          eventId: event._id,
          eventTitle: event.title,
          eventDate: event.date,
          plannedBudget,
          actualExpense,
          variance,
          variancePercentage,
          alertLevel,
          alertMessage,
          isOverBudget: variance < 0
        };
      });

      const alerts = {
        critical: varianceData.filter(e => e.alertLevel === 'critical'),
        high: varianceData.filter(e => e.alertLevel === 'high'),
        medium: varianceData.filter(e => e.alertLevel === 'medium')
      };

      return {
        success: true,
        data: varianceData,
        alerts,
        summary: {
          totalEvents: varianceData.length,
          overBudgetEvents: varianceData.filter(e => e.variance < 0).length,
          totalVariance: varianceData.reduce((sum, e) => sum + e.variance, 0)
        }
      };
    } catch (error) {
      throw new Error('Failed to generate budget variance analysis');
    }
  }

  async getChartData() {
    try {
      const incomeService = require('./incomeAnalytics.service');
      const expenseService = require('./expenseAnalytics.service');
      
      const [incomeResult, expenseResult] = await Promise.all([
        incomeService.getIncomeAnalytics(),
        expenseService.getExpenseAnalytics()
      ]);

      return {
        success: true,
        charts: {
          incomeVsExpense: {
            labels: ['Income', 'Expenses', 'Profit'],
            data: [
              incomeResult.data.totalIncome,
              expenseResult.data.totalExpenses,
              incomeResult.data.totalIncome - expenseResult.data.totalExpenses
            ]
          },
          incomeBreakdown: {
            labels: ['Online', 'Onsite'],
            data: [incomeResult.data.onlineIncome, incomeResult.data.onsiteIncome]
          },
          expenseBreakdown: {
            labels: expenseResult.data.categoryAnalytics.map(cat => cat.category),
            data: expenseResult.data.categoryAnalytics.map(cat => cat.amount)
          }
        }
      };
    } catch (error) {
      throw new Error('Failed to generate chart data');
    }
  }
}

module.exports = new BudgetVarianceService();