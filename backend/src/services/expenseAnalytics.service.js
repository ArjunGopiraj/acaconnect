const Event = require('../models/Events');

class ExpenseAnalyticsService {
  mapEventExpenses(events) {
    return events
      .filter(event => event.logistics?.expense_submitted && event.logistics?.total_expense > 0)
      .map(event => ({
        eventId: event._id,
        eventTitle: event.title,
        eventDate: event.date,
        eventType: event.type,
        totalExpense: event.logistics.total_expense,
        breakdown: event.logistics.expense_breakdown || {},
        submittedAt: event.logistics.expense_submitted_at,
        billAttachment: event.logistics.bill_attachment
      }));
  }

  reduceExpenseData(mappedExpenses) {
    const totalExpenses = mappedExpenses.reduce((sum, item) => sum + item.totalExpense, 0);
    const eventWiseExpenses = this.groupByEvent(mappedExpenses);
    const categoryWiseExpenses = this.aggregateCategories(mappedExpenses);
    
    return {
      totalExpenses,
      eventWiseExpenses,
      categoryWiseExpenses,
      totalEventsWithExpenses: mappedExpenses.length
    };
  }

  extendWithAnalytics(reducedData, mappedExpenses) {
    // Enhanced event-wise data
    const enhancedEventWise = Object.entries(reducedData.eventWiseExpenses).map(([eventId, data]) => {
      const eventData = mappedExpenses.find(e => e.eventId.toString() === eventId);
      return {
        eventId,
        eventTitle: eventData?.eventTitle || 'Unknown Event',
        eventDate: eventData?.eventDate,
        eventType: eventData?.eventType,
        totalExpense: data.totalExpense,
        categoryBreakdown: data.categoryBreakdown,
        submittedAt: eventData?.submittedAt,
        hasBillAttachment: !!eventData?.billAttachment
      };
    });

    
    const categoryAnalytics = Object.entries(reducedData.categoryWiseExpenses).map(([category, amount]) => ({
      category: this.formatCategoryName(category),
      amount,
      percentage: reducedData.totalExpenses > 0 ? (amount / reducedData.totalExpenses) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    const analytics = {
      averageExpensePerEvent: enhancedEventWise.length > 0 ? reducedData.totalExpenses / enhancedEventWise.length : 0,
      highestExpenseEvent: enhancedEventWise.reduce((max, event) => 
        event.totalExpense > (max?.totalExpense || 0) ? event : max, null),
      topExpenseCategories: categoryAnalytics.slice(0, 5),
      expenseDistribution: this.calculateExpenseDistribution(enhancedEventWise)
    };

    return {
      ...reducedData,
      eventWiseDetails: enhancedEventWise,
      categoryAnalytics,
      analytics
    };
  }

  groupByEvent(expenseData) {
    return expenseData.reduce((acc, item) => {
      const eventId = item.eventId.toString();
      acc[eventId] = {
        totalExpense: item.totalExpense,
        categoryBreakdown: item.breakdown
      };
      return acc;
    }, {});
  }

  aggregateCategories(expenseData) {
    const categoryTotals = {};
    
    expenseData.forEach(item => {
      Object.entries(item.breakdown).forEach(([category, amount]) => {
        if (amount > 0) {
          categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        }
      });
    });
    
    return categoryTotals;
  }


  formatCategoryName(category) {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  calculateExpenseDistribution(eventWiseData) {
    if (eventWiseData.length === 0) return { low: 0, medium: 0, high: 0 };
    
    const expenses = eventWiseData.map(e => e.totalExpense).sort((a, b) => a - b);
    const q1 = expenses[Math.floor(expenses.length * 0.33)];
    const q3 = expenses[Math.floor(expenses.length * 0.67)];
    
    return {
      low: eventWiseData.filter(e => e.totalExpense <= q1).length,
      medium: eventWiseData.filter(e => e.totalExpense > q1 && e.totalExpense <= q3).length,
      high: eventWiseData.filter(e => e.totalExpense > q3).length
    };
  }

  async getBudgetVarianceAnalysis() {
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

        return {
          eventId: event._id,
          eventTitle: event.title,
          plannedBudget,
          actualExpense,
          variance,
          variancePercentage,
          status: variance >= 0 ? 'Under Budget' : 'Over Budget'
        };
      });

      return {
        success: true,
        data: varianceData,
        summary: {
          totalEvents: varianceData.length,
          underBudgetEvents: varianceData.filter(e => e.variance >= 0).length,
          overBudgetEvents: varianceData.filter(e => e.variance < 0).length,
          totalVariance: varianceData.reduce((sum, e) => sum + e.variance, 0)
        }
      };
    } catch (error) {
      console.error('Budget variance analysis error:', error);
      throw new Error('Failed to generate budget variance analysis');
    }
  }

  // Main method to get complete expense analytics
  async getExpenseAnalytics() {
    try {
      // Fetch all events with expense data
      const events = await Event.find({});

      // MAP PHASE
      const mappedExpenses = this.mapEventExpenses(events);

      // REDUCE PHASE
      const reducedData = this.reduceExpenseData(mappedExpenses);

      // EXTENDED PHASE
      const finalAnalytics = this.extendWithAnalytics(reducedData, mappedExpenses);

      return {
        success: true,
        data: finalAnalytics,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Expense analytics error:', error);
      throw new Error('Failed to generate expense analytics');
    }
  }
}

module.exports = new ExpenseAnalyticsService();