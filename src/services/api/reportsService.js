import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { activityService } from "@/services/api/activityService";
import { subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, format, parseISO } from "date-fns";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const reportsService = {
  async getAnalytics(timeframe = '6months') {
    await delay(500);
    
    try {
      // Get data from services
      const [contacts, deals, activities] = await Promise.all([
        contactService.getAll(),
        dealService.getAll(),
        activityService.getAll()
      ]);

      // Calculate timeframe dates
      const monthsBack = timeframe === '3months' ? 3 : timeframe === '12months' ? 12 : 6;
      const endDate = new Date();
      const startDate = subMonths(endDate, monthsBack);
      const months = eachMonthOfInterval({ start: startDate, end: endDate });

      // Calculate conversion rate metrics
      const conversionRate = calculateConversionRate(deals, months);
      
      // Calculate lead generation metrics
      const leadGeneration = calculateLeadGeneration(contacts, deals, months);
      
      // Calculate customer acquisition cost
      const customerAcquisitionCost = calculateCustomerAcquisitionCost(deals, contacts);
      
      // Calculate pipeline analysis
      const pipelineAnalysis = calculatePipelineAnalysis(deals);
      
      // Calculate revenue metrics
      const revenueMetrics = calculateRevenueMetrics(deals, months);

      return {
        conversionRate,
        leadGeneration,
        customerAcquisitionCost,
        pipelineAnalysis,
        revenueMetrics,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating analytics:', error);
      throw new Error('Failed to generate analytics data');
    }
  }
};

function calculateConversionRate(deals, months) {
  const conversionTrend = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    // Filter deals created in this month
const monthDeals = deals.filter(deal => {
      const dealDate = parseISO(deal.created_at_c);
      return dealDate >= monthStart && dealDate <= monthEnd;
    });
    
const wonDeals = monthDeals.filter(deal => deal.stage_c === 'closed-won').length;
    const totalDeals = monthDeals.length;
    const rate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;
    
    return {
      month: format(month, 'yyyy-MM-dd'),
      rate: parseFloat(rate.toFixed(2)),
      wonDeals,
      totalDeals
    };
  });

  // Current month conversion rate
  const currentMonth = conversionTrend[conversionTrend.length - 1];
  const previousMonth = conversionTrend[conversionTrend.length - 2];
  const trend = previousMonth ? currentMonth.rate - previousMonth.rate : 0;

  return {
    current: currentMonth.rate,
    trend: parseFloat(trend.toFixed(2)),
    conversionTrend
  };
}

function calculateLeadGeneration(contacts, deals, months) {
  const monthly = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    // New contacts (leads) created in this month
const newLeads = contacts.filter(contact => {
      const contactDate = parseISO(contact.created_at_c);
      return contactDate >= monthStart && contactDate <= monthEnd;
    }).length;
    
    // Qualified leads (contacts with deals) in this month
const qualifiedLeads = contacts.filter(contact => {
      const contactDate = parseISO(contact.created_at_c);
      const hasDeals = deals.some(deal => deal.contact_id_c?.Id === contact.Id);
      return contactDate >= monthStart && contactDate <= monthEnd && hasDeals;
    }).length;
    
    return {
      month: format(month, 'yyyy-MM-dd'),
      newLeads,
      qualifiedLeads,
      qualificationRate: newLeads > 0 ? (qualifiedLeads / newLeads) * 100 : 0
    };
  });

  const totalNewLeads = monthly.reduce((sum, month) => sum + month.newLeads, 0);
  const monthlyAverage = Math.round(totalNewLeads / monthly.length);
  
  // Calculate trend (comparing last two months)
  const currentMonth = monthly[monthly.length - 1];
  const previousMonth = monthly[monthly.length - 2];
  const trend = previousMonth && previousMonth.newLeads > 0 
    ? ((currentMonth.newLeads - previousMonth.newLeads) / previousMonth.newLeads) * 100 
    : 0;

  return {
    monthly,
    monthlyAverage,
    totalNewLeads,
    trend: parseFloat(trend.toFixed(2))
  };
}

function calculateCustomerAcquisitionCost(deals, contacts) {
  // Filter won deals
const wonDeals = deals.filter(deal => deal.stage_c === 'closed-won');
  
  if (wonDeals.length === 0) {
    return {
      average: 0,
      lowest: 0,
      highest: 0,
      trend: 0
    };
  }

  // Calculate CAC based on deal values and conversion efficiency
  // Using a simplified model: higher deal values = lower relative CAC
  const cacValues = wonDeals.map(deal => {
    // Base CAC calculation (simplified)
const baseCac = Math.max(500, Math.min(5000, 10000 - (deal.value_c * 0.1)));
    
    // Adjust based on deal probability (higher probability = lower CAC)
    const probabilityFactor = deal.probability_c / 100;
    const adjustedCac = baseCac * (1.5 - probabilityFactor);
    
    return Math.round(adjustedCac);
  });

  const average = Math.round(cacValues.reduce((sum, cac) => sum + cac, 0) / cacValues.length);
  const lowest = Math.min(...cacValues);
  const highest = Math.max(...cacValues);

  // Calculate trend (comparing first half vs second half of won deals)
  const midPoint = Math.floor(cacValues.length / 2);
  const firstHalf = cacValues.slice(0, midPoint);
  const secondHalf = cacValues.slice(midPoint);
  
  if (firstHalf.length === 0 || secondHalf.length === 0) {
    return { average, lowest, highest, trend: 0 };
  }

  const firstHalfAvg = firstHalf.reduce((sum, cac) => sum + cac, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, cac) => sum + cac, 0) / secondHalf.length;
  const trend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

  return {
    average,
    lowest,
    highest,
    trend: parseFloat(trend.toFixed(2))
  };
}

function calculatePipelineAnalysis(deals) {
  // Group deals by stage
const stageGroups = deals.reduce((acc, deal) => {
    if (deal.stage_c !== 'closed-lost') {
      if (!acc[deal.stage_c]) {
        acc[deal.stage_c] = { count: 0, value: 0 };
      }
      acc[deal.stage_c].count++;
      acc[deal.stage_c].value += deal.value_c;
    }
    return acc;
  }, {});

  const byStage = Object.entries(stageGroups).map(([stage, data]) => ({
    stage,
    count: data.count,
    value: data.value
  }));

  const totalValue = byStage.reduce((sum, stage) => sum + stage.value, 0);
  const activeDeals = byStage.reduce((sum, stage) => sum + stage.count, 0);

  return {
    byStage,
    totalValue,
    activeDeals
  };
}

function calculateRevenueMetrics(deals, months) {
const wonDeals = deals.filter(deal => deal.stage_c === 'closed-won');
  
  const monthly = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    // Revenue from deals closed in this month
    const monthRevenue = wonDeals
.filter(deal => {
        const closedDate = parseISO(deal.expected_close_date_c);
        return closedDate >= monthStart && closedDate <= monthEnd;
      })
.reduce((sum, deal) => sum + deal.value_c, 0);
    
    return {
      month: format(month, 'yyyy-MM-dd'),
      revenue: monthRevenue
    };
  });

  const totalRevenue = monthly.reduce((sum, month) => sum + month.revenue, 0);
  const averageMonthlyRevenue = Math.round(totalRevenue / monthly.length);

  return {
    monthly,
    totalRevenue,
    averageMonthlyRevenue
  };
}