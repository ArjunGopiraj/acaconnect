const Registration = require('../models/Registration');
const OnsiteRegistration = require('../models/OnsiteRegistration');
const Event = require('../models/Events');

class IncomeAnalyticsService {
  // MAP PHASE: Transform registrations to income data points
  mapOnlineRegistrations(registrations) {
    return registrations
      .filter(reg => reg.payment_status === 'COMPLETED' && reg.registration_fee > 0)
      .map(reg => ({
        eventId: reg.event_id._id || reg.event_id,
        eventTitle: reg.event_id.title || 'Unknown Event',
        amount: reg.registration_fee,
        type: 'online',
        date: reg.payment_date || reg.createdAt,
        participantName: reg.participant_name
      }));
  }

  mapOnsiteRegistrations(onsiteRegistrations) {
    return onsiteRegistrations
      .filter(reg => reg.status === 'PAYMENT_CONFIRMED')
      .flatMap(reg => 
        reg.events.map(event => ({
          eventId: event.event_id,
          eventTitle: event.event_title,
          amount: event.registration_fee,
          type: 'onsite',
          date: reg.created_at,
          participantName: reg.participant_details.name
        }))
      );
  }

  // REDUCE PHASE: Aggregate income metrics
  reduceIncomeData(mappedOnline, mappedOnsite) {
    const allIncomeData = [...mappedOnline, ...mappedOnsite];
    
    // Total income calculation
    const totalIncome = allIncomeData.reduce((sum, item) => sum + item.amount, 0);
    
    // Onsite vs Online income
    const onsiteIncome = mappedOnsite.reduce((sum, item) => sum + item.amount, 0);
    const onlineIncome = mappedOnline.reduce((sum, item) => sum + item.amount, 0);
    
    // Event-wise income aggregation
    const eventWiseIncome = this.groupByEvent(allIncomeData);
    
    return {
      totalIncome,
      onlineIncome,
      onsiteIncome,
      eventWiseIncome,
      totalRegistrations: allIncomeData.length,
      onlineRegistrations: mappedOnline.length,
      onsiteRegistrations: mappedOnsite.length
    };
  }

  // EXTENDED PHASE: Add analytics and insights
  extendWithAnalytics(reducedData, events) {
    const eventMap = new Map(events.map(event => [event._id.toString(), event]));
    
    // Enhance event-wise data with event details
    const enhancedEventWise = Object.entries(reducedData.eventWiseIncome).map(([eventId, data]) => {
      const event = eventMap.get(eventId);
      return {
        eventId,
        eventTitle: event?.title || 'Unknown Event',
        eventDate: event?.date,
        eventType: event?.type,
        totalIncome: data.totalIncome,
        onlineIncome: data.onlineIncome,
        onsiteIncome: data.onsiteIncome,
        totalRegistrations: data.totalRegistrations,
        onlineRegistrations: data.onlineRegistrations,
        onsiteRegistrations: data.onsiteRegistrations,
        averageIncomePerRegistration: data.totalRegistrations > 0 ? data.totalIncome / data.totalRegistrations : 0
      };
    });

    // Calculate percentages and ratios
    const analytics = {
      onsitePercentage: reducedData.totalIncome > 0 ? (reducedData.onsiteIncome / reducedData.totalIncome) * 100 : 0,
      onlinePercentage: reducedData.totalIncome > 0 ? (reducedData.onlineIncome / reducedData.totalIncome) * 100 : 0,
      averageIncomePerEvent: enhancedEventWise.length > 0 ? reducedData.totalIncome / enhancedEventWise.length : 0,
      topPerformingEvents: enhancedEventWise
        .sort((a, b) => b.totalIncome - a.totalIncome)
        .slice(0, 5)
    };

    return {
      ...reducedData,
      eventWiseDetails: enhancedEventWise,
      analytics
    };
  }

  // Helper method to group income by event
  groupByEvent(incomeData) {
    return incomeData.reduce((acc, item) => {
      const eventId = item.eventId.toString();
      if (!acc[eventId]) {
        acc[eventId] = {
          totalIncome: 0,
          onlineIncome: 0,
          onsiteIncome: 0,
          totalRegistrations: 0,
          onlineRegistrations: 0,
          onsiteRegistrations: 0
        };
      }
      
      acc[eventId].totalIncome += item.amount;
      acc[eventId].totalRegistrations += 1;
      
      if (item.type === 'online') {
        acc[eventId].onlineIncome += item.amount;
        acc[eventId].onlineRegistrations += 1;
      } else {
        acc[eventId].onsiteIncome += item.amount;
        acc[eventId].onsiteRegistrations += 1;
      }
      
      return acc;
    }, {});
  }

  // Main method to get complete income analytics
  async getIncomeAnalytics() {
    try {
      // Fetch all required data
      const [onlineRegistrations, onsiteRegistrations, events] = await Promise.all([
        Registration.find({ payment_status: 'COMPLETED' }).populate('event_id'),
        OnsiteRegistration.find({ status: 'PAYMENT_CONFIRMED' }),
        Event.find({})
      ]);

      // MAP PHASE
      const mappedOnline = this.mapOnlineRegistrations(onlineRegistrations);
      const mappedOnsite = this.mapOnsiteRegistrations(onsiteRegistrations);

      // REDUCE PHASE
      const reducedData = this.reduceIncomeData(mappedOnline, mappedOnsite);

      // EXTENDED PHASE
      const finalAnalytics = this.extendWithAnalytics(reducedData, events);

      return {
        success: true,
        data: finalAnalytics,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Income analytics error:', error);
      throw new Error('Failed to generate income analytics');
    }
  }
}

module.exports = new IncomeAnalyticsService();